import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as iconv from 'iconv-lite';
import * as path from 'path';

console.log('FileOpener module loaded');

export class FileOpener {
    private static outputChannel: vscode.OutputChannel;

    public static initOutputChannel(channel: vscode.OutputChannel) {
        console.log('FileOpener.initOutputChannel called');
        this.outputChannel = channel;
    }

    public static openFile(file_name: string): void {
        this.outputChannel.appendLine(`開始搜尋檔案: ${file_name}`);

        const extension = vscode.extensions.getExtension('papple23g.file-linker');
        if (!extension) {
            vscode.window.showErrorMessage('無法找到擴充功能實例。');
            return;
        }

        const esPath = path.join(extension.extensionPath, 'bin', 'es.exe');
        const esDir = path.dirname(esPath);

        // 使用 Everything 搜尋檔案
        const esProcess = spawn(esPath, [
            '-n', '1',
            '-full-path-and-name',
            '-sort', 'run-count',
            file_name
        ], {
            windowsHide: true,
            cwd: esDir
        });

        let result = '';
        let error = '';

        esProcess.stdout.on('data', (data: Buffer) => {
            // 使用 CP950 解碼 Windows 終端輸出
            const decoded = iconv.decode(data, 'cp950').trim();
            result += decoded;
            this.outputChannel.appendLine(`搜尋結果 (原始 bytes): ${data.toString('hex')}`);
            this.outputChannel.appendLine(`搜尋結果 (cp950 解碼): ${decoded}`);
        });

        esProcess.stderr.on('data', (data: Buffer) => {
            const decodedErr = iconv.decode(data, 'cp950');
            error += decodedErr;
            this.outputChannel.appendLine(`Everything 錯誤 (原始 bytes): ${data.toString('hex')}`);
            this.outputChannel.appendLine(`Everything 錯誤 (cp950 解碼): ${decodedErr}`);
        });

        esProcess.on('error', (err) => {
            this.outputChannel.appendLine(`執行 Everything 時發生錯誤: ${err.message}`);
            vscode.window.showErrorMessage(`執行 Everything 時發生錯誤: ${err.message}`);
        });

        esProcess.on('close', (code) => {
            this.outputChannel.appendLine(`Everything 搜尋完成，結束代碼: ${code}`);

            if (code !== 0) {
                if (code === 8) {
                    // Error 8: Everything IPC window not found.
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
                vscode.window.showInformationMessage(`找不到檔案: ${file_name}`);
                return;
            }

            // 開啟找到的檔案
            // 移除可能的換行符並確保路徑正確
            const filePath = result.replace(/[\r\n]+$/, '');
            this.outputChannel.appendLine(`準備開啟檔案: ${filePath}`);

            // 使用系統預設應用程式開啟檔案
            this.outputChannel.appendLine(`使用預設應用程式開啟檔案: ${filePath}`);

            // 獲取檔案所在目錄
            const fileDir = filePath.substring(0, filePath.lastIndexOf('\\'));
            this.outputChannel.appendLine(`檔案目錄: ${fileDir}`);

            // 使用 explorer 命令開啟檔案
            const command = `explorer "${filePath}"`;
            this.outputChannel.appendLine(`執行命令: ${command}`);
            const childProcess = spawn(command, [], {
                shell: true,
                cwd: fileDir
            });

            childProcess.on('error', (err) => {
                this.outputChannel.appendLine(`執行錯誤: ${err.message}`);
                vscode.window.showErrorMessage(`開啟檔案失敗: ${err.message}`);
            });

            childProcess.on('exit', (code) => {
                if (code !== 0) {
                    this.outputChannel.appendLine(`命令執行失敗，結束代碼: ${code}`);
                } else {
                    this.outputChannel.appendLine('檔案開啟成功');
                }
            });
        });
    }
}
