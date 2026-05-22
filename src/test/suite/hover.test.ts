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

        const fileLinkHover = hovers
            .flatMap((hover) => hover.contents)
            .find((content): content is vscode.MarkdownString => (
                typeof content !== 'string' && content.value.includes('command:file-linker.openFile?')
            ));

        assert.ok(fileLinkHover);
        assert.ok(fileLinkHover.value.includes('Open foo.txt'));
        assert.strictEqual(fileLinkHover.isTrusted, true);
    });
});
