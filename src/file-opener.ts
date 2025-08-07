import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as iconv from 'iconv-lite';
import * as path from 'path';
import * as os from 'os';

console.log('FileOpener module loaded');

export class FileOpener {
    private static outputChannel: vscode.OutputChannel;

    public static initOutputChannel(channel: vscode.OutputChannel) {
        console.log('FileOpener.initOutputChannel called');
        this.outputChannel = channel;
    }

    public static openFile(fileName: string): void {
        this.outputChannel.appendLine(`開始搜尋檔案: ${fileName}`);
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

        const esPath = path.join(extension.extensionPath, 'bin', 'es.exe');
        const esDir = path.dirname(esPath);

        const esProcess = spawn(esPath, [
            '-n', '1',
            '-full-path-and-name',
            '-sort', 'run-count',
            fileName
        ], {
            windowsHide: true,
            cwd: esDir
        });

        let result = '';
        esProcess.stdout.on('data', (data: Buffer) => {
            const decoded = iconv.decode(data, 'cp950').trim();
            result += decoded;
            this.outputChannel.appendLine(`Everything 搜尋結果: ${decoded}`);
        });

        esProcess.stderr.on('data', (data: Buffer) => {
            const decodedErr = iconv.decode(data, 'cp950');
            this.outputChannel.appendLine(`Everything 錯誤: ${decodedErr}`);
        });

        esProcess.on('error', (err) => {
            this.outputChannel.appendLine(`執行 Everything 時發生錯誤: ${err.message}`);
            vscode.window.showErrorMessage(`執行 Everything 時發生錯誤: ${err.message}`);
        });

        esProcess.on('close', (code) => {
            this.outputChannel.appendLine(`Everything 搜尋完成，結束代碼: ${code}`);
            if (code !== 0) {
                if (code === 8) {
                    vscode.window.showErrorMessage(
                        'Everything service is not running. Please start Everything to use this feature.',
                        'Go to Download Page'
                    ).then(selection => {
                        if (selection === 'Go to Download Page') {
                            vscode.env.openExternal(vscode.Uri.parse('https://www.voidtools.com/downloads/'));
                        }
                    });
                } else {
                    vscode.window.showErrorMessage(`Everything search failed with exit code: ${code}. See Output panel for details.`);
                }
                return;
            }

            if (!result) {
                vscode.window.showInformationMessage(`找不到檔案: ${fileName}`);
                return;
            }

            const filePath = result.replace(/[\r\n]+$/, '');
            this.executeOpenFileCommand('explorer', filePath);
        });
    }

    private static openFileOnMac(fileName: string): void {
        const mdfindProcess = spawn('mdfind', ['-name', fileName]);

        let result = '';
        mdfindProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        mdfindProcess.stderr.on('data', (data) => {
            this.outputChannel.appendLine(`mdfind 錯誤: ${data.toString()}`);
        });

        mdfindProcess.on('error', (err) => {
            this.outputChannel.appendLine(`執行 mdfind 時發生錯誤: ${err.message}`);
            vscode.window.showErrorMessage(`執行 mdfind 時發生錯誤: ${err.message}`);
        });

        mdfindProcess.on('close', (code) => {
            this.outputChannel.appendLine(`mdfind 搜尋完成，結束代碼: ${code}`);
            if (code !== 0) {
                vscode.window.showErrorMessage(`mdfind search failed with exit code: ${code}.`);
                return;
            }

            const files = result.trim().split('\n').filter(line => line);
            if (files.length === 0) {
                vscode.window.showInformationMessage(`找不到檔案: ${fileName}`);
                return;
            }

            if (files.length === 1) {
                this.executeOpenFileCommand('open', files[0]);
            } else {
                vscode.window.showQuickPick(files, {
                    placeHolder: `找到多個檔案，請選擇要開啟的檔案 (${fileName})`
                }).then(selectedPath => {
                    if (selectedPath) {
                        this.executeOpenFileCommand('open', selectedPath);
                    }
                });
            }
        });
    }

    private static executeOpenFileCommand(command: 'explorer' | 'open', filePath: string): void {
        this.outputChannel.appendLine(`準備開啟檔案: ${filePath}`);
        const openCommand = command === 'explorer' ? `explorer "${filePath}"` : `open "${filePath}"`;
        const fileDir = path.dirname(filePath);

        this.outputChannel.appendLine(`執行命令: ${openCommand}`);
        const childProcess = spawn(openCommand, [], {
            shell: true,
            cwd: fileDir
        });

        childProcess.on('error', (err) => {
            this.outputChannel.appendLine(`執行錯誤: ${err.message}`);
            vscode.window.showErrorMessage(`開啟檔案失敗: ${err.message}`);
        });

        childProcess.on('exit', (exitCode) => {
            if (exitCode !== 0) {
                this.outputChannel.appendLine(`命令執行失敗，結束代碼: ${exitCode}`);
            } else {
                this.outputChannel.appendLine('檔案開啟成功');
            }
        });
    }
}
