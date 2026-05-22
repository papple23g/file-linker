import { EventEmitter } from 'events';
import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as iconv from 'iconv-lite';
import { buildEverythingExportArgs, decodeEverythingStdout, parseEverythingResultText } from './everything-utils';
import { isPlausibleFilePath } from './path-utils';
import { openWithExplorerSelect } from './openers';

export interface ProcessLike extends EventEmitter {
    stdout?: EventEmitter;
    stderr?: EventEmitter;
}

export type WindowsSpawnFn = (
    command: string,
    args?: ReadonlyArray<string>,
    options?: SpawnOptionsWithoutStdio,
) => ProcessLike;

export interface WindowsOpenMessages {
    showErrorMessage: (message: string, ...items: string[]) => PromiseLike<string | undefined>;
    showInformationMessage: (message: string) => void;
    showWarningMessage: (message: string) => void;
    openExternal: (uri: string) => void;
}

export interface WindowsOpenDeps {
    extensionPath: string;
    spawnFn?: WindowsSpawnFn;
    openFileInEditor?: (filePath: string) => PromiseLike<void> | void;
    openFileFn?: (filePath: string) => ProcessLike;
    openContainingFolderFallback?: (filePath: string) => void;
    revealFileInOs?: (filePath: string) => PromiseLike<void> | void;
    testExportText?: string;
    testExplorerExitCode?: number;
    createTempDir: () => string;
    cleanupTempDir: (tempDir: string) => void;
    cleanupStaleTempDirs?: () => void;
    existsSync?: (filePath: string) => boolean;
    readFileSync?: (filePath: string, encoding: BufferEncoding) => string;
    log: (message: string) => void;
    messages: WindowsOpenMessages;
}

export function openFileOnWindowsWithDeps(fileName: string, deps: WindowsOpenDeps): void {
    deps.log(`開始搜尋檔案: ${fileName}`);

    const esPath = path.join(deps.extensionPath, 'bin', 'es.exe');
    const esDir = path.dirname(esPath);
    deps.cleanupStaleTempDirs?.();

    let tempDir = '';
    let exportPath = '';

    try {
        tempDir = deps.createTempDir();
        exportPath = path.join(tempDir, 'results.txt');
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        deps.log(`建立 Everything 暫存資料夾失敗: ${message}`);
        deps.messages.showErrorMessage(`建立暫存檔失敗: ${message}`);
        return;
    }

    const spawnFn = deps.spawnFn ?? (spawn as unknown as WindowsSpawnFn);
    let esProcess: ProcessLike;
    let didSpawnError = false;
    let stdoutText = '';

    try {
        esProcess = deps.testExportText !== undefined
            ? createTestEverythingProcess(0)
            : spawnFn(esPath, buildEverythingExportArgs(fileName, exportPath), {
                windowsHide: true,
                cwd: esDir,
            });
    } catch (err) {
        deps.cleanupTempDir(tempDir);
        const message = err instanceof Error ? err.message : String(err);
        deps.log(`執行 Everything 時發生錯誤: ${message}`);
        deps.messages.showErrorMessage(`執行 Everything 時發生錯誤: ${message}`);
        return;
    }

    esProcess.stdout?.on('data', (data: Buffer) => {
        const decoded = decodeEverythingStdout(data);
        stdoutText += decoded.text;
        deps.log(`使用 ${decoded.encoding} 編碼解碼`);
        deps.log(`Everything 搜尋結果: ${decoded.text.trim()}`);
    });

    esProcess.stderr?.on('data', (data: Buffer) => {
        const decodedErr = iconv.decode(data, 'cp950');
        deps.log(`Everything 錯誤: ${decodedErr}`);
    });

    esProcess.on('error', (err: Error) => {
        didSpawnError = true;
        deps.cleanupTempDir(tempDir);
        deps.log(`執行 Everything 時發生錯誤: ${err.message}`);
        deps.messages.showErrorMessage(`執行 Everything 時發生錯誤: ${err.message}`);
    });

    esProcess.on('close', (code: number) => {
        if (didSpawnError) return;

        deps.log(`Everything 搜尋完成，結束代碼: ${code}`);

        try {
            if (code !== 0) {
                if (code === 8) {
                    deps.messages
                        .showErrorMessage(
                            'Everything service is not running. Please start Everything to use this feature.',
                            'Go to Download Page',
                        )
                        .then((selection) => {
                            if (selection === 'Go to Download Page') {
                                deps.messages.openExternal('https://www.voidtools.com/downloads/');
                            }
                        });
                } else {
                    deps.messages.showErrorMessage(
                        `Everything search failed with exit code: ${code}. See Output panel for details.`,
                    );
                }
                return;
            }

            const existsSync = deps.existsSync ?? fs.existsSync;
            const readFileSync = deps.readFileSync ?? fs.readFileSync;
            const exportText = deps.testExportText ?? (existsSync(exportPath) ? readFileSync(exportPath, 'utf8') : '');
            const exportFilePath = parseEverythingResultText(exportText);
            const stdoutFilePath = parseEverythingResultText(stdoutText);
            const filePath = exportFilePath || stdoutFilePath;

            if (exportFilePath) {
                deps.log('使用 Everything UTF-8 export 結果');
            } else if (stdoutFilePath) {
                deps.log('使用 Everything stdout fallback 結果');
            }

            deps.log(`搜尋結果處理後: "${filePath}" (長度: ${filePath.length})`);

            if (!filePath) {
                deps.log('搜尋結果為空');
                deps.messages.showInformationMessage(`找不到檔案: ${fileName}`);
                return;
            }

            if (!isPlausibleFilePath(filePath)) {
                deps.log(`無效的路徑格式: ${filePath}`);
                deps.messages.showWarningMessage(`搜尋結果路徑格式無效: ${fileName}`);
                return;
            }

            executeOpenFileCommand(filePath, deps);
        } finally {
            deps.cleanupTempDir(tempDir);
        }
    });
}

function executeOpenFileCommand(filePath: string, deps: WindowsOpenDeps): void {
    deps.log(`準備開啟檔案: ${filePath}`);

    if (deps.openFileInEditor) {
        deps.log('使用 VS Code vscode.open 開啟檔案');
        Promise.resolve(deps.openFileInEditor(filePath))
            .then(() => {
                deps.log('檔案開啟成功');
            })
            .catch((err) => {
                const message = err instanceof Error ? err.message : String(err);
                deps.log(`vscode.open 失敗: ${message}`);
                revealFileOrOpenFolder(filePath, deps);
            });
        return;
    }

    if (deps.openFileFn) {
        executeProcessOpen(filePath, deps.openFileFn(filePath), deps);
        return;
    }

    if (deps.revealFileInOs) {
        revealFileOrOpenFolder(filePath, deps);
        return;
    }

    const childProcess = deps.testExplorerExitCode !== undefined
        ? createTestExplorerProcess(deps.testExplorerExitCode)
        : (openWithExplorerSelect(filePath) as unknown as ProcessLike);

    executeProcessOpen(filePath, childProcess, deps);
}

function executeProcessOpen(filePath: string, childProcess: ProcessLike, deps: WindowsOpenDeps): void {
    childProcess.on('error', (err: Error) => {
        deps.log(`執行錯誤: ${err.message}`);
        deps.messages.showErrorMessage(`開啟檔案失敗: ${err.message}`);
    });

    childProcess.on('exit', (exitCode: number) => {
        if (exitCode !== 0) {
            deps.log(`命令執行失敗，結束代碼: ${exitCode}`);
            revealFileOrOpenFolder(filePath, deps);
        } else {
            deps.log('檔案開啟成功');
        }
    });
}

function revealFileOrOpenFolder(filePath: string, deps: WindowsOpenDeps): void {
    if (!deps.revealFileInOs) {
        deps.log(`改為開啟檔案所在資料夾: ${path.dirname(filePath)}`);
        deps.openContainingFolderFallback?.(filePath);
        return;
    }

    deps.log('使用 VS Code revealFileInOS 顯示檔案');
    Promise.resolve(deps.revealFileInOs(filePath))
        .then(() => {
            deps.log('已在檔案總管顯示檔案');
        })
        .catch((err) => {
            const message = err instanceof Error ? err.message : String(err);
            deps.log(`revealFileInOS 失敗: ${message}`);
            deps.log(`改為開啟檔案所在資料夾: ${path.dirname(filePath)}`);
            deps.openContainingFolderFallback?.(filePath);
        });
}

function createTestExplorerProcess(exitCode: number): ProcessLike {
    const childProcess = new EventEmitter() as ProcessLike;
    queueMicrotask(() => childProcess.emit('exit', exitCode));
    return childProcess;
}

function createTestEverythingProcess(exitCode: number): ProcessLike {
    const childProcess = new EventEmitter() as ProcessLike;
    childProcess.stdout = new EventEmitter();
    childProcess.stderr = new EventEmitter();
    queueMicrotask(() => childProcess.emit('close', exitCode));
    return childProcess;
}
