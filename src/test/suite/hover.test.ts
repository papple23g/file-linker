import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { FileOpener } from '../../file-opener';

async function getFileLinkHover(fileName = 'foo.txt'): Promise<{ hover: vscode.MarkdownString; editor: vscode.TextEditor }> {
    const content = `See [${fileName}] here`;
    const doc = await vscode.workspace.openTextDocument({
        language: 'plaintext',
        content,
    });
    const editor = await vscode.window.showTextDocument(doc);

    const pos = new vscode.Position(0, content.indexOf(fileName) + fileName.length - 1);
    editor.selection = new vscode.Selection(pos, pos);
    editor.revealRange(new vscode.Range(pos, pos));
    await vscode.commands.executeCommand('editor.action.showHover');

    const hovers = (await vscode.commands.executeCommand(
        'vscode.executeHoverProvider',
        doc.uri,
        pos,
    )) as vscode.Hover[];

    const fileLinkHover = hovers
        .flatMap((hover) => hover.contents)
        .find((content): content is vscode.MarkdownString => (
            typeof content !== 'string' && content.value.includes('command:file-linker.openFile?')
        ));

    assert.ok(fileLinkHover);
    return { hover: fileLinkHover, editor };
}

function parseCommandUri(markdown: string): vscode.Uri {
    const match = markdown.match(/\]\((command:[^)]+)\)/);
    assert.ok(match);
    return vscode.Uri.parse(match[1]);
}

suite('File Linker integration', () => {
    suiteSetup(async () => {
        const extension = vscode.extensions.getExtension('peterwang.file-linker');
        assert.ok(extension);
        await extension.activate();
    });

    test('hover command uses boolean trust and decodable payload', async () => {
        const { hover: fileLinkHover } = await getFileLinkHover('foo.txt');
        const commandUri = parseCommandUri(fileLinkHover.value);
        const args = JSON.parse(decodeURIComponent(commandUri.query)) as string[];

        assert.strictEqual(fileLinkHover.isTrusted, true);
        assert.strictEqual(commandUri.scheme, 'command');
        assert.strictEqual(commandUri.path, 'file-linker.openFile');
        assert.deepStrictEqual(args, ['foo.txt']);
    });

    for (const fileName of ['01.txt', '會議準備.txt', '👥會議準備.txt']) {
        test(`hover-derived [${fileName}] command opens the file without reveal shortcut`, async () => {
            if (process.platform !== 'win32') {
                return;
            }

            const previousExportText = process.env.FILE_LINKER_TEST_EXPORT_TEXT;
            const previousLogFile = process.env.FILE_LINKER_TEST_LOG_FILE;
            const previousOpenCaptureFile = process.env.FILE_LINKER_TEST_OPEN_CAPTURE_FILE;
            const previousRevealCaptureFile = process.env.FILE_LINKER_TEST_REVEAL_CAPTURE_FILE;
            const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-linker-real-hover-'));
            const fixturePath = path.join(fixtureDir, fileName);
            const logFile = path.join(fixtureDir, 'events.log');
            const openCaptureFile = path.join(fixtureDir, 'opened.txt');
            const revealCaptureFile = path.join(fixtureDir, 'reveal.txt');

            fs.writeFileSync(fixturePath, fileName, 'utf8');
            process.env.FILE_LINKER_TEST_EXPORT_TEXT = `\uFEFF${fixturePath}\r\n`;
            process.env.FILE_LINKER_TEST_LOG_FILE = logFile;
            process.env.FILE_LINKER_TEST_OPEN_CAPTURE_FILE = openCaptureFile;
            process.env.FILE_LINKER_TEST_REVEAL_CAPTURE_FILE = revealCaptureFile;
            FileOpener.resetTestState();

            try {
                const { hover: fileLinkHover } = await getFileLinkHover(fileName);
                const commandUri = parseCommandUri(fileLinkHover.value);
                const args = JSON.parse(decodeURIComponent(commandUri.query)) as string[];

                assert.deepStrictEqual(args, [fileName]);
                await vscode.commands.executeCommand(commandUri.path, ...args);
                await waitForFileText(openCaptureFile, fixturePath, 3000);

                const logText = fs.readFileSync(logFile, 'utf8');
                assert.ok(logText.includes(`log:開始搜尋檔案: ${fileName}`));
                assert.ok(logText.includes(`log:搜尋結果處理後: "${fixturePath}"`));
                assert.ok(logText.includes('log:使用 VS Code vscode.open 開啟檔案'));
                assert.strictEqual(fs.readFileSync(openCaptureFile, 'utf8'), fixturePath);
                assert.ok(!fs.existsSync(revealCaptureFile));
            } finally {
                if (previousExportText === undefined) {
                    delete process.env.FILE_LINKER_TEST_EXPORT_TEXT;
                } else {
                    process.env.FILE_LINKER_TEST_EXPORT_TEXT = previousExportText;
                }
                if (previousLogFile === undefined) {
                    delete process.env.FILE_LINKER_TEST_LOG_FILE;
                } else {
                    process.env.FILE_LINKER_TEST_LOG_FILE = previousLogFile;
                }
                if (previousOpenCaptureFile === undefined) {
                    delete process.env.FILE_LINKER_TEST_OPEN_CAPTURE_FILE;
                } else {
                    process.env.FILE_LINKER_TEST_OPEN_CAPTURE_FILE = previousOpenCaptureFile;
                }
                if (previousRevealCaptureFile === undefined) {
                    delete process.env.FILE_LINKER_TEST_REVEAL_CAPTURE_FILE;
                } else {
                    process.env.FILE_LINKER_TEST_REVEAL_CAPTURE_FILE = previousRevealCaptureFile;
                }
                fs.rmSync(fixtureDir, { recursive: true, force: true });
                FileOpener.resetTestState();
            }
        });
    }
});

async function waitForFileText(filePath: string, expectedText: string, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8').includes(expectedText)) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
    }

    const actualText = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '<missing file>';
    assert.fail(`Timed out waiting for "${expectedText}" in ${filePath}. Actual: ${actualText}`);
}
