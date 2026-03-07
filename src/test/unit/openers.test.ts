import * as assert from 'assert';
import type { SpawnOptionsWithoutStdio } from 'child_process';
import { buildExplorerSelectArgs, openWithExplorerSelect, SpawnFn } from '../../openers';

suite('openers (windows)', () => {
    test('buildExplorerSelectArgs keeps emoji path intact', () => {
        const filePath = 'C:\\Temp\\file_linker_emoji_test\\⚠️我的檔案.txt';
        const args = buildExplorerSelectArgs(filePath);
        assert.deepStrictEqual(args, [`/select,${filePath}`]);
    });

    test('openWithExplorerSelect uses shell=false (emoji-safe)', () => {
        const filePath = 'C:\\Temp\\file_linker_emoji_test\\⚠️我的檔案.txt';

        type SpawnCall = {
            command: string;
            args?: ReadonlyArray<string>;
            options?: Pick<SpawnOptionsWithoutStdio, 'shell'>;
        };

        const calls: SpawnCall[] = [];

        const fakeSpawn: SpawnFn = (
            command,
            args,
            options,
        ) => {
            calls.push({ command, args, options: options ? { shell: options.shell } : undefined });
            return {} as unknown as ReturnType<typeof openWithExplorerSelect>;
        };

        openWithExplorerSelect(filePath, fakeSpawn);

        assert.strictEqual(calls.length, 1);
        assert.strictEqual(calls[0].command.toLowerCase(), 'explorer.exe');
        assert.deepStrictEqual(calls[0].args, [`/select,${filePath}`]);
        assert.strictEqual(calls[0].options?.shell, false);
    });
});
