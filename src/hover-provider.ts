import * as vscode from 'vscode';
import { BRACKET_RANGE_REGEX, extractBracketedFileName } from './bracket-utils';

export class FileLinkHoverProvider implements vscode.HoverProvider {
    private log: (message: string) => void;

    constructor(log: (message: string) => void) {
        this.log = log;
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

        const hoverContent = new vscode.MarkdownString();
        // Safer than isTrusted=true: only allow this extension command.
        hoverContent.isTrusted = { enabledCommands: ['file-linker.openFile'] };
        hoverContent.appendMarkdown(`[Open ${fileName}](${commandUri})`);

        return new vscode.Hover(hoverContent, range);
    }
}
