import * as vscode from 'vscode';
import * as child_process from 'child_process';

export class FileOpener {
    private static readonly everythingPath = 'C:\\Program Files\\Everything\\es.exe';

    public static openFile(file_name: string): void {
        // Escape 雙引號與特殊字元
        const safe_file_name = file_name.replace(/(["`$])/g, '`$1');
        const command = `& "${this.everythingPath}" -n 1 -full-path-and-name -sort run-count "${safe_file_name}" | ForEach-Object { if ($_ -ne '') { Start-Process $_ } }`;

        try {
            child_process.exec(
                command,
                { shell: 'powershell.exe' },
                (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showErrorMessage(`無法開啟檔案: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        vscode.window.showErrorMessage(`搜尋檔案時發生錯誤: ${stderr}`);
                        return;
                    }
                    if (!stdout.trim()) {
                        vscode.window.showInformationMessage(`找不到檔案: ${file_name}`);
                    }
                }
            );
        } catch (error) {
            vscode.window.showErrorMessage(`執行命令時發生錯誤: ${error}`);
        }
    }
}
