import * as assert from 'assert';
import {
    buildEverythingExportArgs,
    decodeEverythingStdout,
    EVERYTHING_TEMP_PREFIX,
    parseEverythingResultText,
} from '../../everything-utils';

suite('everything-utils', () => {
    test('buildEverythingExportArgs exports utf8 text and keeps emoji query intact', () => {
        const fileName = '👥會議準備.txt';
        const exportPath = 'C:\\Temp\\file-linker-es-test\\results.txt';

        assert.deepStrictEqual(buildEverythingExportArgs(fileName, exportPath), [
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

    test('parseEverythingResultText removes utf8 bom and keeps emoji path intact', () => {
        const filePath = 'C:\\Temp\\👥會議準備.txt';
        assert.strictEqual(parseEverythingResultText(`\uFEFF${filePath}\r\n`), filePath);
    });

    test('parseEverythingResultText returns first non-empty result', () => {
        assert.strictEqual(parseEverythingResultText('\r\nC:\\Temp\\first.txt\r\nC:\\Temp\\second.txt'), 'C:\\Temp\\first.txt');
    });

    test('decodeEverythingStdout reports utf8 when utf8 decoding succeeds', () => {
        const decoded = decodeEverythingStdout(Buffer.from('C:\\Temp\\foo.txt\r\n', 'utf8'));

        assert.strictEqual(decoded.encoding, 'utf8');
        assert.strictEqual(decoded.text, 'C:\\Temp\\foo.txt\r\n');
    });

    test('EVERYTHING_TEMP_PREFIX is scoped to file-linker', () => {
        assert.strictEqual(EVERYTHING_TEMP_PREFIX, 'file-linker-es-');
    });
});
