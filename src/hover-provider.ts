import * as vscode from 'vscode';
import { BRACKET_RANGE_REGEX, extractBracketedFileName } from './bracket-utils';

export class FileLinkHoverProvider implements vscode.HoverProvider {
    private log: (message: string) => void;

    constructor(outputChannelOrLog: vscode.OutputChannel | ((message: string) => void)) {
        this.log = typeof outputChannelOrLog === 'function'
            ? outputChannelOrLog
            : (message: string) => outputChannelOrLog.appendLine(message);
    }

    public async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Promise<vscode.Hover | null> {
        const range = document.getWordRangeAtPosition(position, BRACKET_RANGE_REGEX);
        if (!range) return null;

        const text = document.getText(range);
        const fileName = extractBracketedFileName(text);
        if (!fileName) return null;

        this.log(`Hover match: ${fileName}`);

        const args = [fileName];
        const commandUri = vscode.Uri.parse(
            `command:file-linker.openFile?${encodeURIComponent(JSON.stringify(args))}`,
        );
        this.log(`Command URI: ${commandUri.toString()}`);

        const hoverContent = new vscode.MarkdownString();
        hoverContent.isTrusted = true;
        hoverContent.appendMarkdown(`[Open ${fileName}](${commandUri})`);

        return new vscode.Hover(hoverContent, range);
    }
}
