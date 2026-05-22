import * as assert from 'assert';
import type { SpawnOptionsWithoutStdio } from 'child_process';
import { buildExplorerSelectArgs, openWithExplorerFolder, openWithExplorerSelect, SpawnFn } from '../../openers';

suite('openers', () => {
    test('buildExplorerSelectArgs keeps emoji path intact', () => {
        const filePath = 'C:\\Temp\\⚠️我的檔案.txt';
        assert.deepStrictEqual(buildExplorerSelectArgs(filePath), [`/select,"${filePath}"`]);
    });

    test('openWithExplorerSelect uses shell false', () => {
        const calls: Array<{
            command: string;
            args?: ReadonlyArray<string>;
            options?: SpawnOptionsWithoutStdio;
        }> = [];

        const fakeSpawn: SpawnFn = (command, args, options) => {
            calls.push({ command, args, options });
            return {} as ReturnType<SpawnFn>;
        };

        const filePath = 'C:\\Temp\\⚠️我的檔案.txt';
        openWithExplorerSelect(filePath, fakeSpawn);

        assert.strictEqual(calls.length, 1);
        assert.strictEqual(calls[0].command, 'explorer.exe');
        assert.deepStrictEqual(calls[0].args, [`/select,"${filePath}"`]);
        assert.strictEqual(calls[0].options?.shell, false);
    });

    test('openWithExplorerFolder uses explorer directly without VS Code openExternal', () => {
        const calls: Array<{
            command: string;
            args?: ReadonlyArray<string>;
            options?: SpawnOptionsWithoutStdio;
        }> = [];

        const fakeSpawn: SpawnFn = (command, args, options) => {
            calls.push({ command, args, options });
            return {} as ReturnType<SpawnFn>;
        };

        const folderPath = 'C:\\Users\\pappl\\我的雲端硬碟\\場外用';
        openWithExplorerFolder(folderPath, fakeSpawn);

        assert.strictEqual(calls.length, 1);
        assert.strictEqual(calls[0].command, 'explorer.exe');
        assert.deepStrictEqual(calls[0].args, [folderPath]);
        assert.strictEqual(calls[0].options?.shell, false);
    });
});
