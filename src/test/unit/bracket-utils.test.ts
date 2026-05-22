import * as assert from 'assert';
import { BRACKET_RANGE_REGEX, extractBracketedFileName } from '../../bracket-utils';

suite('bracket-utils', () => {
    test('extractBracketedFileName extracts text inside brackets', () => {
        assert.strictEqual(extractBracketedFileName('[foo.txt]'), 'foo.txt');
    });

    test('extractBracketedFileName returns null for non-bracket text', () => {
        assert.strictEqual(extractBracketedFileName('foo.txt'), null);
    });

    test('BRACKET_RANGE_REGEX matches one bracketed file token', () => {
        assert.strictEqual('See [foo.txt]'.match(BRACKET_RANGE_REGEX)?.[0], '[foo.txt]');
    });
});
