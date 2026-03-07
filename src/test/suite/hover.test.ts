import * as assert from 'assert';
import * as vscode from 'vscode';

suite('File Linker (integration)', () => {
    test('hover over [file] shows command link', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'plaintext',
            content: 'See [foo.txt] here',
        });
        await vscode.window.showTextDocument(doc);

        const pos = new vscode.Position(0, 'See ['.length + 1); // inside foo.txt

        const hovers = (await vscode.commands.executeCommand(
            'vscode.executeHoverProvider',
            doc.uri,
            pos,
        )) as vscode.Hover[];

        assert.ok(Array.isArray(hovers));
        assert.ok(hovers.length >= 1);

        const hover0 = hovers[0];
        const contents = hover0.contents
            .map((c) => (typeof c === 'string' ? c : (c as vscode.MarkdownString).value))
            .join('\n');

        assert.ok(contents.includes('command:file-linker.openFile?'));
        assert.ok(contents.includes('Open foo.txt'));
    });
});
