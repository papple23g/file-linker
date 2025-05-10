import * as vscode from 'vscode';
import { spawn, exec } from 'child_process';
import * as iconv from 'iconv-lite';

export class FileOpener {
    private static readonly everythingPath = 'C:\\Program Files\\Everything\\es.exe';
    private static outputChannel: vscode.OutputChannel;

    public static initOutputChannel(channel: vscode.OutputChannel) {
        this.outputChannel = channel;
    }

    public static openFile(file_name: string): void {
        this.outputChannel.appendLine(`開始搜尋檔案: ${file_name}`);

        // 使用 Everything 搜尋檔案
        const esProcess = spawn(this.everythingPath, [
            '-n', '1',
            '-full-path-and-name',
            '-sort', 'run-count',
            file_name
        ], {
            windowsHide: true
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

        esProcess.stderr.on('data', (data: Buffer) => {
            try {
                error += data.toString('utf8');
            } catch (e) {
                error += data.toString();
            }
            this.outputChannel.appendLine(`Everything 錯誤 (原始): ${data.toString()}`);
            this.outputChannel.appendLine(`Everything 錯誤 (解碼): ${error}`);
        });

        esProcess.on('error', (err) => {
            this.outputChannel.appendLine(`執行 Everything 時發生錯誤: ${err.message}`);
            vscode.window.showErrorMessage(`執行 Everything 時發生錯誤: ${err.message}`);
        });

        esProcess.on('close', (code) => {
            this.outputChannel.appendLine(`Everything 搜尋完成，結束代碼: ${code}`);
            
            if (code !== 0) {
                vscode.window.showErrorMessage(`Everything 搜尋失敗，結束代碼: ${code}`);
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

            // 使用 VSCode API 在系統預設應用程式中開啟檔案
            const fileUri = vscode.Uri.file(filePath);
            this.outputChannel.appendLine(`嘗試使用系統預設應用程式開啟: ${fileUri.fsPath}`);
            vscode.env.openExternal(fileUri).then(
                (success) => {
                    if (success) {
                        this.outputChannel.appendLine('外部應用程式開啟成功');
                    } else {
                        this.outputChannel.appendLine('外部應用程式開啟失敗');
                        vscode.window.showErrorMessage('無法使用外部應用程式開啟檔案');
                    }
                },
                (err: Error) => {
                    this.outputChannel.appendLine(`開啟外部應用程式錯誤: ${err.message}`);
                    vscode.window.showErrorMessage(`無法開啟檔案: ${err.message}`);
                }
            );
        });
    }
}
