import * as assert from 'assert';
import {
    buildEverythingExportArgs,
    EVERYTHING_TEMP_PREFIX,
    parseEverythingExportText,
} from '../../everything-utils';

suite('everything-utils', () => {
    test('buildEverythingExportArgs exports utf8 text and keeps emoji query intact', () => {
        const fileName = '👥會議準備.txt';
        const exportPath = 'C:\\Users\\pappl\\AppData\\Local\\Temp\\file-linker-es-test\\results.txt';

        const args = buildEverythingExportArgs(fileName, exportPath);

        assert.deepStrictEqual(args, [
            '-n',
            '1',
            '-full-path-and-name',
            '-sort',
            'run-count',
            '-export-txt',
            exportPath,
            '-utf8-bom',
            fileName,
        ]);
    });

    test('parseEverythingExportText removes utf8 bom and keeps emoji path intact', () => {
        const filePath = 'C:\\Users\\pappl\\OneDrive - Optoma\\奧圖碼\\奧圖碼TODO\\👥會議準備.txt';
        const outputText = `\uFEFF${filePath}\r\n`;

        assert.strictEqual(parseEverythingExportText(outputText), filePath);
    });

    test('parseEverythingExportText returns first non-empty result', () => {
        const firstFilePath = 'C:\\Temp\\first.txt';
        const secondFilePath = 'C:\\Temp\\second.txt';
        const outputText = `\uFEFF\r\n${firstFilePath}\r\n${secondFilePath}\r\n`;

        assert.strictEqual(parseEverythingExportText(outputText), firstFilePath);
    });

    test('parseEverythingExportText returns empty string for blank output', () => {
        assert.strictEqual(parseEverythingExportText('\uFEFF\r\n'), '');
    });

    test('EVERYTHING_TEMP_PREFIX is scoped to file-linker', () => {
        assert.strictEqual(EVERYTHING_TEMP_PREFIX, 'file-linker-es-');
    });
});
