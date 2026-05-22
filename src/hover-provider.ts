import * as vscode from 'vscode';

export class FileLinkHoverProvider implements vscode.HoverProvider {
    private static readonly bracket_regex = /\[([^\]]+)\]/g;
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    public async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Promise<vscode.Hover | null> {
        this.outputChannel.appendLine(`provideHover called at position: ${position.line}:${position.character}`);

        const range = document.getWordRangeAtPosition(
            position,
            FileLinkHoverProvider.bracket_regex,
        );
        if (!range) {
            this.outputChannel.appendLine('No range found.');
            return null;
        }

        this.outputChannel.appendLine(`Range found: ${range.start.line}:${range.start.character} - ${range.end.line}:${range.end.character}`);

        const text = document.getText(range);
        this.outputChannel.appendLine(`Text in range: ${text}`);

        const matches = text.match(FileLinkHoverProvider.bracket_regex);
        if (!matches) {
            this.outputChannel.appendLine('No matches found.');
            return null;
        }

        this.outputChannel.appendLine(`Matches found: ${JSON.stringify(matches)}`);

        const file_name = matches[0].slice(1, -1); // 移除方括號
        this.outputChannel.appendLine(`File name extracted: ${file_name}`);

        // 使用 JSON.stringify 確保參數被正確序列化
        const args = [file_name];
        const command_uri = vscode.Uri.parse(
            `command:file-linker.openFile?${encodeURIComponent(JSON.stringify(args))}`,
        );
        this.outputChannel.appendLine(`Command URI: ${command_uri.toString()}`);

        const hover_content = new vscode.MarkdownString();
        hover_content.isTrusted = true;
        hover_content.appendMarkdown(`[Open ${file_name}](${command_uri})`);
        this.outputChannel.appendLine('Hover content created with Markdown link and command URI.');

        return new vscode.Hover(hover_content, range);
    }
}
