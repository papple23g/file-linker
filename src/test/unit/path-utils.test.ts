import * as assert from 'assert';
import { isPlausibleFilePath } from '../../path-utils';

suite('path-utils', () => {
    test('accepts windows absolute path', () => {
        assert.strictEqual(isPlausibleFilePath('C:\\Temp\\a.txt'), true);
    });

    test('accepts unix absolute path', () => {
        assert.strictEqual(isPlausibleFilePath('/tmp/a.txt'), true);
    });

    test('rejects plain filename', () => {
        assert.strictEqual(isPlausibleFilePath('a.txt'), false);
    });

    test('rejects empty', () => {
        assert.strictEqual(isPlausibleFilePath(''), false);
    });
});
