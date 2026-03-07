import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { runTests } from '@vscode/test-electron';

function ensureSafePath(repoRoot: string): string {
    if (!repoRoot.includes(' ')) {
        return repoRoot;
    }

    const safeBase = path.join(os.tmpdir(), 'file-linker-vscode');
    const safeRepo = path.join(safeBase, 'repo');
    if (!fs.existsSync(safeBase)) {
        fs.mkdirSync(safeBase, { recursive: true });
    }
    if (!fs.existsSync(safeRepo)) {
        try {
            fs.symlinkSync(repoRoot, safeRepo, 'junction');
        } catch {
            fs.symlinkSync(repoRoot, safeRepo);
        }
    }
    return safeRepo;
}

async function main() {
    try {
        const repoRoot = path.resolve(__dirname, '../../');
        const devRoot = ensureSafePath(repoRoot);

        const extensionDevelopmentPath = devRoot;
        const extensionTestsPath = path.resolve(devRoot, 'out', 'test', 'suite', 'index');
        const testWorkspace = path.resolve(devRoot, 'test-fixtures');

        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [testWorkspace, '--disable-extensions'],
            extensionTestsEnv: {
                FILE_LINKER_TEST_MODE: '1',
            },
        });
    } catch (err) {
        console.error('Failed to run tests');
        console.error(err);
        process.exit(1);
    }
}

void main();
