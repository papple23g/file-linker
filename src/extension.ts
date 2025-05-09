import * as vscode from 'vscode';
import { FileLinkHoverProvider } from './hover-provider';
import { FileOpener } from './file-opener';

export function activate(context: vscode.ExtensionContext) {
    // 註冊 hover provider
    const hoverProvider = new FileLinkHoverProvider();
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

    // Alt 鍵偵測與 setContext（使用 onDidChangeTextEditorSelection）
    const selection_listener = vscode.window.onDidChangeTextEditorSelection((e) => {
        // 取得目前鍵盤狀態
        const alt_pressed = (e as any).selections && (e as any).kind === vscode.TextEditorSelectionChangeKind.Mouse && (e as any).textEditor && (e as any).textEditor.options && (e as any).textEditor.options.cursorStyle;
        // 由於 VSCode API 無法直接取得 Alt 狀態，僅能於滑鼠選取時嘗試設為 true
        vscode.commands.executeCommand(
            'setContext',
            'file-linker.altPressed',
            alt_pressed ?? false,
        );
    });
    context.subscriptions.push(selection_listener);

    // 設定初始 Alt 鍵狀態
    vscode.commands.executeCommand('setContext', 'file-linker.altPressed', false);
}

export function deactivate() {
    // 清理 Alt 鍵狀態
    vscode.commands.executeCommand('setContext', 'file-linker.altPressed', false);
}
