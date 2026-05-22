import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
    cleanupEverythingTempDir,
    cleanupStaleEverythingTempDirs,
    createEverythingTempDir,
    parseEverythingResultText,
} from './everything-utils';
import { openWithDefaultWindowsApp, openWithExplorerFolder, openWithMacOpen } from './openers';
import { openFileOnWindowsWithDeps, ProcessLike } from './windows-opener';

export class FileOpener {
    private static log: (message: string) => void = () => {};
    private static lastTestOpenedFileName: string | undefined;
    private static testLogFile: string | undefined;

    public static initOutputChannel(channel: vscode.OutputChannel) {
        this.log = (message: string) => channel.appendLine(message);
    }

    public static initLogger(logFn: (message: string) => void) {
        this.log = logFn;
    }

    public static initTestLogFile(filePath: string | undefined) {
        this.testLogFile = filePath;
    }

    private static recordTestEvent(message: string) {
        const testLogFile = this.testLogFile ?? process.env.FILE_LINKER_TEST_LOG_FILE;
        if (testLogFile) {
            fs.appendFileSync(testLogFile, `${message}\n`, 'utf8');
        }
    }

    public static resetTestState() {
        this.lastTestOpenedFileName = undefined;
        this.testLogFile = undefined;
    }

    public static getLastTestOpenedFileName(): string | undefined {
        return this.lastTestOpenedFileName;
    }

    public static openFile(fileName: string): void {
        if (process.env.FILE_LINKER_TEST_MODE === '1') {
            this.lastTestOpenedFileName = fileName;
            const captureFile = process.env.FILE_LINKER_TEST_CAPTURE_FILE;
            if (captureFile) {
                fs.writeFileSync(captureFile, fileName, 'utf8');
            }
            this.recordTestEvent(`test-mode-open:${fileName}`);
            this.log(`[TEST_MODE] openFile(${fileName})`);
            return;
        }

        const platform = os.platform();
        if (platform === 'win32') {
            this.openFileOnWindows(fileName);
        } else if (platform === 'darwin') {
            this.openFileOnMac(fileName);
        } else {
            vscode.window.showErrorMessage(`不支援的作業系統: ${platform}`);
        }
    }

    private static openFileOnWindows(fileName: string): void {
        const extension = vscode.extensions.getExtension('peterwang.file-linker');
        if (!extension) {
            vscode.window.showErrorMessage('無法找到擴充功能實例。');
            return;
        }

        openFileOnWindowsWithDeps(fileName, {
            extensionPath: extension.extensionPath,
            createTempDir: createEverythingTempDir,
            cleanupTempDir: (tempDir) => cleanupEverythingTempDir(tempDir, this.log),
            cleanupStaleTempDirs: () => cleanupStaleEverythingTempDirs(this.log),
            testExportText: process.env.FILE_LINKER_TEST_EXPORT_TEXT,
            testExplorerExitCode: process.env.FILE_LINKER_TEST_EXPLORER_EXIT_CODE
                ? Number(process.env.FILE_LINKER_TEST_EXPLORER_EXIT_CODE)
                : undefined,
            openFileFn: (filePath) => {
                const captureFile = process.env.FILE_LINKER_TEST_DEFAULT_OPEN_CAPTURE_FILE;
                if (captureFile) {
                    fs.writeFileSync(captureFile, filePath, 'utf8');
                    return this.createSucceededTestProcess();
                }
                return openWithDefaultWindowsApp(filePath) as unknown as ProcessLike;
            },
            revealFileInOs: (filePath) => {
                const captureFile = process.env.FILE_LINKER_TEST_REVEAL_CAPTURE_FILE;
                if (captureFile) {
                    fs.writeFileSync(captureFile, filePath, 'utf8');
                    return;
                }
                return vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(filePath));
            },
            openContainingFolderFallback: (filePath) => {
                this.recordTestEvent(`fallback-folder:${path.dirname(filePath)}`);
                if (process.env.FILE_LINKER_TEST_SUPPRESS_EXTERNAL_OPEN === '1') {
                    return;
                }
                const childProcess = openWithExplorerFolder(path.dirname(filePath));
                childProcess.on('error', (err) => {
                    this.log(`開啟檔案所在資料夾失敗: ${err.message}`);
                    vscode.window.showErrorMessage(`開啟檔案所在資料夾失敗: ${err.message}`);
                });
            },
            log: (message) => {
                this.log(message);
                this.recordTestEvent(`log:${message}`);
            },
            messages: {
                showErrorMessage: (message, ...items) => vscode.window.showErrorMessage(message, ...items),
                showInformationMessage: (message) => {
                    vscode.window.showInformationMessage(message);
                },
                showWarningMessage: (message) => {
                    vscode.window.showWarningMessage(message);
                },
                openExternal: (uri) => {
                    vscode.env.openExternal(vscode.Uri.parse(uri));
                },
            },
        });
    }

    private static createSucceededTestProcess(): ProcessLike {
        const childProcess = new EventEmitter() as ProcessLike;
        queueMicrotask(() => childProcess.emit('exit', 0));
        return childProcess;
    }

    private static openFileOnMac(fileName: string): void {
        this.log(`開始搜尋檔案: ${fileName}`);
        const mdfindProcess = spawn('mdfind', ['-name', fileName]);

        let result = '';
        mdfindProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        mdfindProcess.stderr.on('data', (data) => {
            this.log(`mdfind 錯誤: ${data.toString()}`);
        });

        mdfindProcess.on('error', (err) => {
            this.log(`執行 mdfind 時發生錯誤: ${err.message}`);
            vscode.window.showErrorMessage(`執行 mdfind 時發生錯誤: ${err.message}`);
        });

        mdfindProcess.on('close', (code) => {
            this.log(`mdfind 搜尋完成，結束代碼: ${code}`);
            if (code !== 0) {
                vscode.window.showErrorMessage(`mdfind search failed with exit code: ${code}.`);
                return;
            }

            const files = parseEverythingResultText(result)
                ? result
                    .trim()
                    .split('\n')
                    .map((line) => line.trim())
                    .filter((line) => line)
                : [];

            if (files.length === 0) {
                vscode.window.showInformationMessage(`找不到檔案: ${fileName}`);
                return;
            }

            if (files.length === 1) {
                this.executeOpenFileCommand(files[0]);
            } else {
                vscode.window
                    .showQuickPick(files, {
                        placeHolder: `找到多個檔案，請選擇要開啟的檔案 (${fileName})`,
                    })
                    .then((selectedPath) => {
                        if (selectedPath) {
                            this.executeOpenFileCommand(selectedPath);
                        }
                    });
            }
        });
    }

    private static executeOpenFileCommand(filePath: string): void {
        this.log(`準備開啟檔案: ${filePath}`);
        const childProcess = openWithMacOpen(filePath) as unknown as ProcessLike;

        childProcess.on('error', (err: Error) => {
            this.log(`執行錯誤: ${err.message}`);
            vscode.window.showErrorMessage(`開啟檔案失敗: ${err.message}`);
        });

        childProcess.on('exit', (exitCode: number) => {
            if (exitCode !== 0) {
                this.log(`命令執行失敗，結束代碼: ${exitCode}`);
            } else {
                this.log('檔案開啟成功');
            }
        });
    }
}
