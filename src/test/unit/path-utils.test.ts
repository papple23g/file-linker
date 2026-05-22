import * as assert from 'assert';
import { isPlausibleFilePath } from '../../path-utils';

suite('path-utils', () => {
    test('accepts windows absolute path', () => {
        assert.strictEqual(isPlausibleFilePath('C:\\Temp\\foo.txt'), true);
    });

    test('accepts unix absolute path', () => {
        assert.strictEqual(isPlausibleFilePath('/tmp/foo.txt'), true);
    });

    test('rejects plain filename', () => {
        assert.strictEqual(isPlausibleFilePath('foo.txt'), false);
    });

    test('rejects empty string', () => {
        assert.strictEqual(isPlausibleFilePath(''), false);
    });
});
