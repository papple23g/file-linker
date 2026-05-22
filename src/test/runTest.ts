import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { runTests } from '@vscode/test-electron';

function createNoSpaceJunction(targetPath: string): { root: string; link: string } {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'file-linker-vscode-test-'));
    const link = path.join(root, 'extension');
    fs.symlinkSync(targetPath, link, 'junction');
    return { root, link };
}

async function main() {
    const extensionRoot = path.resolve(__dirname, '../../');
    const testPaths = createNoSpaceJunction(extensionRoot);
    const extensionDevelopmentPath = testPaths.link;
    const extensionTestsPath = path.join(extensionDevelopmentPath, 'out', 'test', 'suite', 'index');
    const userDataDir = path.join(testPaths.root, 'user-data');
    const workspacePath = path.join(testPaths.root, 'workspace');

    fs.mkdirSync(workspacePath);

    try {
        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [workspacePath, '--disable-extensions', '--user-data-dir', userDataDir],
        });
    } finally {
        fs.rmSync(testPaths.root, { recursive: true, force: true });
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
