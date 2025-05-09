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

        const command_uri = vscode.Uri.parse(
            `command:file-linker.openFile?${encodeURIComponent(JSON.stringify([file_name]))}`,
        );
        this.outputChannel.appendLine(`Command URI: ${command_uri.toString()}`);

        const hover_content = new vscode.MarkdownString(
            `<a href="${command_uri}">開啟 ${file_name}</a>`
        );
        hover_content.isTrusted = true;
        this.outputChannel.appendLine('Hover content created with HTML link.');

        return new vscode.Hover(hover_content, range);
    }
}
