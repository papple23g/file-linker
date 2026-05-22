import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as iconv from 'iconv-lite';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { isPlausibleFilePath } from './path-utils';
import { openWithExplorerSelect, openWithMacOpen } from './openers';
import {
    buildEverythingExportArgs,
    cleanupEverythingTempDir,
    cleanupStaleEverythingTempDirs,
    createEverythingTempDir,
    parseEverythingExportText,
} from './everything-utils';

export class FileOpener {
    private static log: (message: string) => void = () => {};

    public static initLogger(logFn: (message: string) => void) {
        this.log = logFn;
    }

    public static openFile(fileName: string): void {
        this.log(`開始搜尋檔案: ${fileName}`);

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
        if (process.env.FILE_LINKER_TEST_MODE === '1') {
            this.log(`[TEST_MODE] openFileOnWindows(${fileName})`);
            return;
        }

        const extension = vscode.extensions.getExtension('peterwang.file-linker');
        if (!extension) {
            vscode.window.showErrorMessage('無法找到擴充功能實例。');
            return;
        }

        const esPath = path.join(extension.extensionPath, 'bin', 'es.exe');
        const esDir = path.dirname(esPath);
        cleanupStaleEverythingTempDirs(this.log);

        let tempDir = '';
        let exportPath = '';

        try {
            tempDir = createEverythingTempDir();
            exportPath = path.join(tempDir, 'results.txt');
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.log(`建立 Everything 暫存資料夾失敗: ${message}`);
            vscode.window.showErrorMessage(`建立暫存檔失敗: ${message}`);
            return;
        }

        let didSpawnError = false;
        let esProcess: ReturnType<typeof spawn>;

        try {
            esProcess = spawn(esPath, buildEverythingExportArgs(fileName, exportPath), {
                windowsHide: true,
                cwd: esDir,
            });
        } catch (err) {
            cleanupEverythingTempDir(tempDir, this.log);
            const message = err instanceof Error ? err.message : String(err);
            this.log(`執行 Everything 時發生錯誤: ${message}`);
            vscode.window.showErrorMessage(`執行 Everything 時發生錯誤: ${message}`);
            return;
        }

        if (esProcess.stderr) {
            esProcess.stderr.on('data', (data: Buffer) => {
                const decodedErr = iconv.decode(data, 'cp950');
                this.log(`Everything 錯誤: ${decodedErr}`);
            });
        }

        esProcess.on('error', (err) => {
            didSpawnError = true;
            cleanupEverythingTempDir(tempDir, this.log);
            this.log(`執行 Everything 時發生錯誤: ${err.message}`);
            vscode.window.showErrorMessage(`執行 Everything 時發生錯誤: ${err.message}`);
        });

        esProcess.on('close', (code) => {
            if (didSpawnError) return;

            this.log(`Everything 搜尋完成，結束代碼: ${code}`);
            try {
                if (code !== 0) {
                    if (code === 8) {
                        vscode.window
                            .showErrorMessage(
                                'Everything service is not running. Please start Everything to use this feature.',
                                'Go to Download Page',
                            )
                            .then((selection) => {
                                if (selection === 'Go to Download Page') {
                                    vscode.env.openExternal(vscode.Uri.parse('https://www.voidtools.com/downloads/'));
                                }
                            });
                    } else {
                        vscode.window.showErrorMessage(
                            `Everything search failed with exit code: ${code}. See Output panel for details.`,
                        );
                    }
                    return;
                }

                const outputText = fs.existsSync(exportPath) ? fs.readFileSync(exportPath, 'utf8') : '';
                const filePath = parseEverythingExportText(outputText);
                this.log(`搜尋結果處理後: "${filePath}" (長度: ${filePath.length})`);

                if (!filePath) {
                    vscode.window.showInformationMessage(`找不到檔案: ${fileName}`);
                    return;
                }

                if (!isPlausibleFilePath(filePath)) {
                    vscode.window.showWarningMessage(`搜尋結果路徑格式無效: ${fileName}`);
                    return;
                }

                this.executeOpenFileCommand('explorer', filePath);
            } finally {
                cleanupEverythingTempDir(tempDir, this.log);
            }
        });
    }

    private static openFileOnMac(fileName: string): void {
        if (process.env.FILE_LINKER_TEST_MODE === '1') {
            this.log(`[TEST_MODE] openFileOnMac(${fileName})`);
            return;
        }

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

            const files = result
                .trim()
                .split('\n')
                .filter((line) => line);

            if (files.length === 0) {
                vscode.window.showInformationMessage(`找不到檔案: ${fileName}`);
                return;
            }

            if (files.length === 1) {
                this.executeOpenFileCommand('open', files[0]);
            } else {
                vscode.window
                    .showQuickPick(files, {
                        placeHolder: `找到多個檔案，請選擇要開啟的檔案 (${fileName})`,
                    })
                    .then((selectedPath) => {
                        if (selectedPath) {
                            this.executeOpenFileCommand('open', selectedPath);
                        }
                    });
            }
        });
    }

    private static executeOpenFileCommand(command: 'explorer' | 'open', filePath: string): void {
        this.log(`準備開啟檔案: ${filePath}`);

        // IMPORTANT (Windows): avoid shell=true, otherwise emoji/non-ANSI chars can break in cmd.exe.
        const childProcess =
            command === 'explorer'
                ? openWithExplorerSelect(filePath)
                : openWithMacOpen(filePath);

        childProcess.on('error', (err) => {
            this.log(`執行錯誤: ${err.message}`);
            vscode.window.showErrorMessage(`開啟檔案失敗: ${err.message}`);
        });

        childProcess.on('exit', (exitCode) => {
            if (exitCode !== 0) {
                this.log(`命令執行失敗，結束代碼: ${exitCode}`);
            } else {
                this.log('檔案開啟成功');
            }
        });
    }
}
