import * as vscode from 'vscode';
import { FileLinkHoverProvider } from './hover-provider';
import { FileOpener } from './file-opener';

export function activate(context: vscode.ExtensionContext) {
    console.log('File Linker extension activated');

    // 建立輸出頻道
    const outputChannel = vscode.window.createOutputChannel("File Linker Debug");
    context.subscriptions.push(outputChannel);

    // 註冊 hover provider
    const hoverProvider = new FileLinkHoverProvider(outputChannel);
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('*', hoverProvider)
    );

    // 註冊開啟檔案的命令
    const openFileCommand = vscode.commands.registerCommand(
        'file-linker.openFile',
        (file_name: string) => {
            FileOpener.openFile(file_name);
        }
    );
    context.subscriptions.push(openFileCommand);

    // 設定初始 Alt 鍵狀態
    vscode.commands.executeCommand('setContext', 'file-linker.altPressed', false);
}

export function deactivate() {
    // 清理 Alt 鍵狀態
    vscode.commands.executeCommand('setContext', 'file-linker.altPressed', false);
}
