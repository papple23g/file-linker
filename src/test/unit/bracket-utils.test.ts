import * as assert from 'assert';
import { extractBracketedFileName } from '../../bracket-utils';

suite('bracket-utils', () => {
    test('extractBracketedFileName extracts name from [name]', () => {
        assert.strictEqual(extractBracketedFileName('[foo.txt]'), 'foo.txt');
    });

    test('extractBracketedFileName returns null when no brackets', () => {
        assert.strictEqual(extractBracketedFileName('foo.txt'), null);
    });

    test('extractBracketedFileName supports unicode', () => {
        assert.strictEqual(extractBracketedFileName('[我的文件.txt]'), '我的文件.txt');
    });

    test('extractBracketedFileName supports emoji', () => {
        assert.strictEqual(extractBracketedFileName('[👥會議準備.txt]'), '👥會議準備.txt');
    });
});
