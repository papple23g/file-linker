import * as assert from 'assert';
import { EventEmitter } from 'events';
import type { SpawnOptionsWithoutStdio } from 'child_process';
import { openFileOnWindowsWithDeps, ProcessLike, WindowsOpenMessages } from '../../windows-opener';

class FakeProcess extends EventEmitter implements ProcessLike {
    public stdout = new EventEmitter();
    public stderr = new EventEmitter();
}

function createMessages(): WindowsOpenMessages {
    return {
        showErrorMessage: () => Promise.resolve(undefined),
        showInformationMessage: () => {},
        showWarningMessage: () => {},
        openExternal: () => {},
    };
}

suite('windows-opener', () => {
    test('opens legacy stdout result when export file is missing', () => {
        const esProcess = new FakeProcess();
        const openedPaths: string[] = [];
        const logs: string[] = [];
        const tempDir = 'C:\\Temp\\file-linker-es-test';

        openFileOnWindowsWithDeps('foo.txt', {
            extensionPath: 'C:\\Extension',
            createTempDir: () => tempDir,
            cleanupTempDir: () => {},
            existsSync: () => false,
            spawnFn: () => esProcess,
            openFileFn: (filePath) => {
                openedPaths.push(filePath);
                return new FakeProcess();
            },
            log: (message) => logs.push(message),
            messages: createMessages(),
        });

        esProcess.stdout.emit('data', Buffer.from('C:\\Temp\\foo.txt\r\n', 'utf8'));
        esProcess.emit('close', 0);

        assert.deepStrictEqual(openedPaths, ['C:\\Temp\\foo.txt']);
        assert.ok(logs.some((message) => message.includes('stdout fallback')));
    });

    test('opens utf8 export result with emoji filename', () => {
        const esProcess = new FakeProcess();
        const openedPaths: string[] = [];
        const tempDir = 'C:\\Temp\\file-linker-es-test';
        const emojiPath = 'C:\\Temp\\👥會議準備.txt';

        openFileOnWindowsWithDeps('👥會議準備.txt', {
            extensionPath: 'C:\\Extension',
            createTempDir: () => tempDir,
            cleanupTempDir: () => {},
            existsSync: (filePath) => filePath.endsWith('results.txt'),
            readFileSync: () => `\uFEFF${emojiPath}\r\n`,
            spawnFn: () => esProcess,
            openFileFn: (filePath) => {
                openedPaths.push(filePath);
                return new FakeProcess();
            },
            log: () => {},
            messages: createMessages(),
        });

        esProcess.emit('close', 0);

        assert.deepStrictEqual(openedPaths, [emojiPath]);
    });

    test('opens utf8 export result with Chinese filename', () => {
        const esProcess = new FakeProcess();
        const openedPaths: string[] = [];
        const tempDir = 'C:\\Temp\\file-linker-es-test';
        const chinesePath = 'C:\\Temp\\會議準備.txt';

        openFileOnWindowsWithDeps('會議準備.txt', {
            extensionPath: 'C:\\Extension',
            createTempDir: () => tempDir,
            cleanupTempDir: () => {},
            existsSync: (filePath) => filePath.endsWith('results.txt'),
            readFileSync: () => `\uFEFF${chinesePath}\r\n`,
            spawnFn: () => esProcess,
            openFileFn: (filePath) => {
                openedPaths.push(filePath);
                return new FakeProcess();
            },
            log: () => {},
            messages: createMessages(),
        });

        esProcess.emit('close', 0);

        assert.deepStrictEqual(openedPaths, [chinesePath]);
    });

    test('logs key events by default', () => {
        const esProcess = new FakeProcess();
        const logs: string[] = [];
        const tempDir = 'C:\\Temp\\file-linker-es-test';

        openFileOnWindowsWithDeps('foo.txt', {
            extensionPath: 'C:\\Extension',
            createTempDir: () => tempDir,
            cleanupTempDir: () => {},
            existsSync: () => false,
            spawnFn: () => esProcess,
            openFileFn: () => new FakeProcess(),
            log: (message) => logs.push(message),
            messages: createMessages(),
        });

        esProcess.stdout.emit('data', Buffer.from('C:\\Temp\\foo.txt\r\n', 'utf8'));
        esProcess.emit('close', 0);

        assert.ok(logs.some((message) => message.includes('開始搜尋檔案')));
        assert.ok(logs.some((message) => message.includes('Everything 搜尋完成')));
        assert.ok(logs.some((message) => message.includes('準備開啟檔案')));
    });

    test('passes Everything export arguments to es.exe', () => {
        const esProcess = new FakeProcess();
        let spawnCommand = '';
        let spawnArgs: ReadonlyArray<string> | undefined;
        let spawnOptions: SpawnOptionsWithoutStdio | undefined;

        openFileOnWindowsWithDeps('foo.txt', {
            extensionPath: 'C:\\Extension',
            createTempDir: () => 'C:\\Temp\\file-linker-es-test',
            cleanupTempDir: () => {},
            existsSync: () => false,
            spawnFn: (command, args, options) => {
                spawnCommand = command;
                spawnArgs = args;
                spawnOptions = options;
                return esProcess;
            },
            openFileFn: () => new FakeProcess(),
            log: () => {},
            messages: createMessages(),
        });

        assert.strictEqual(spawnCommand, 'C:\\Extension\\bin\\es.exe');
        assert.deepStrictEqual(spawnArgs, [
            '-n',
            '1',
            '-full-path-and-name',
            '-sort',
            'run-count',
            '-export-txt',
            'C:\\Temp\\file-linker-es-test\\results.txt',
            '-utf8-bom',
            'foo.txt',
        ]);
        assert.strictEqual(spawnOptions?.shell, undefined);
        assert.strictEqual(spawnOptions?.cwd, 'C:\\Extension\\bin');
    });

    test('opens containing folder fallback when explorer select exits non-zero', () => {
        const esProcess = new FakeProcess();
        const explorerProcess = new FakeProcess();
        const fallbackPaths: string[] = [];
        const logs: string[] = [];

        openFileOnWindowsWithDeps('foo.txt', {
            extensionPath: 'C:\\Extension',
            createTempDir: () => 'C:\\Temp\\file-linker-es-test',
            cleanupTempDir: () => {},
            existsSync: () => false,
            spawnFn: () => esProcess,
            openFileFn: () => explorerProcess,
            openContainingFolderFallback: (filePath) => fallbackPaths.push(filePath),
            log: (message) => logs.push(message),
            messages: createMessages(),
        });

        esProcess.stdout.emit('data', Buffer.from('C:\\Temp\\foo.txt\r\n', 'utf8'));
        esProcess.emit('close', 0);
        explorerProcess.emit('exit', 1);

        assert.deepStrictEqual(fallbackPaths, ['C:\\Temp\\foo.txt']);
        assert.ok(logs.some((message) => message.includes('改為開啟檔案所在資料夾')));
    });

    test('opens file instead of revealing it when both open and reveal are available', async () => {
        const esProcess = new FakeProcess();
        const openProcess = new FakeProcess();
        const revealedPaths: string[] = [];
        const openedPaths: string[] = [];

        openFileOnWindowsWithDeps('foo.txt', {
            extensionPath: 'C:\\Extension',
            createTempDir: () => 'C:\\Temp\\file-linker-es-test',
            cleanupTempDir: () => {},
            existsSync: () => false,
            spawnFn: () => esProcess,
            openFileFn: (filePath) => {
                openedPaths.push(filePath);
                return openProcess;
            },
            revealFileInOs: (filePath) => {
                revealedPaths.push(filePath);
            },
            log: () => {},
            messages: createMessages(),
        });

        esProcess.stdout.emit('data', Buffer.from('C:\\Temp\\foo.txt\r\n', 'utf8'));
        esProcess.emit('close', 0);
        await new Promise((resolve) => setImmediate(resolve));

        assert.deepStrictEqual(openedPaths, ['C:\\Temp\\foo.txt']);
        assert.deepStrictEqual(revealedPaths, []);
    });

    test('falls back to containing folder when revealFileInOS rejects', async () => {
        const esProcess = new FakeProcess();
        const fallbackPaths: string[] = [];
        const logs: string[] = [];

        openFileOnWindowsWithDeps('foo.txt', {
            extensionPath: 'C:\\Extension',
            createTempDir: () => 'C:\\Temp\\file-linker-es-test',
            cleanupTempDir: () => {},
            existsSync: () => false,
            spawnFn: () => esProcess,
            revealFileInOs: () => Promise.reject(new Error('reveal failed')),
            openContainingFolderFallback: (filePath) => fallbackPaths.push(filePath),
            log: (message) => logs.push(message),
            messages: createMessages(),
        });

        esProcess.stdout.emit('data', Buffer.from('C:\\Temp\\foo.txt\r\n', 'utf8'));
        esProcess.emit('close', 0);
        await new Promise((resolve) => setImmediate(resolve));

        assert.deepStrictEqual(fallbackPaths, ['C:\\Temp\\foo.txt']);
        assert.ok(logs.some((message) => message.includes('revealFileInOS 失敗')));
        assert.ok(logs.some((message) => message.includes('改為開啟檔案所在資料夾')));
    });
});
