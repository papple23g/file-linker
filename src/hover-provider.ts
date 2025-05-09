import * as vscode from 'vscode';

export class FileLinkHoverProvider implements vscode.HoverProvider {
    private static readonly bracket_regex = /\[([^\]]+)\]/g;

    public async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Promise<vscode.Hover | null> {
        // 依據 context 判斷 Alt 是否按下
        const is_alt_pressed = vscode.workspace.getConfiguration().get<boolean>('file-linker.altPressed', false);
        if (!is_alt_pressed) {
            return null;
        }

        const range = document.getWordRangeAtPosition(
            position,
            FileLinkHoverProvider.bracket_regex,
        );
        if (!range) {
            return null;
        }

        const text = document.getText(range);
        const matches = text.match(FileLinkHoverProvider.bracket_regex);
        if (!matches) {
            return null;
        }

        const file_name = matches[0].slice(1, -1); // 移除方括號
        const command_uri = vscode.Uri.parse(
            `command:file-linker.openFile?${encodeURIComponent(JSON.stringify([file_name]))}`,
        );

        const hover_content = new vscode.MarkdownString(
            `請按住 Alt 並點擊：[開啟 ${file_name}](${command_uri})`
        );
        hover_content.isTrusted = true;

        return new vscode.Hover(hover_content, range);
    }
}
