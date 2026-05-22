import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as iconv from 'iconv-lite';

export const EVERYTHING_TEMP_PREFIX = 'file-linker-es-';
export const STALE_EVERYTHING_TEMP_DIR_AGE_MS = 24 * 60 * 60 * 1000;

export function buildEverythingExportArgs(fileName: string, exportPath: string): string[] {
    return [
        '-n',
        '1',
        '-full-path-and-name',
        '-sort',
        'run-count',
        '-export-txt',
        exportPath,
        '-utf8-bom',
        fileName,
    ];
}

export function parseEverythingResultText(outputText: string): string {
    const outputWithoutBom = outputText.replace(/^\uFEFF/, '');
    const firstPath = outputWithoutBom
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find((line) => line.length > 0);

    return firstPath ?? '';
}

export function decodeEverythingStdout(data: Buffer): { text: string; encoding: 'utf8' | 'cp950' } {
    let decoded = iconv.decode(data, 'utf8');
    if (decoded.includes('\uFFFD')) {
        decoded = iconv.decode(data, 'cp950');
        return { text: decoded, encoding: 'cp950' };
    }

    return { text: decoded, encoding: 'utf8' };
}

export function createEverythingTempDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), EVERYTHING_TEMP_PREFIX));
}

export function cleanupEverythingTempDir(
    tempDir: string,
    log: (message: string) => void = () => {},
): void {
    try {
        fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log(`清理 Everything 暫存資料夾失敗: ${message}`);
    }
}

export function cleanupStaleEverythingTempDirs(
    log: (message: string) => void = () => {},
    nowMs: number = Date.now(),
    maxAgeMs: number = STALE_EVERYTHING_TEMP_DIR_AGE_MS,
): void {
    const tempRoot = os.tmpdir();
    let tempDirents: fs.Dirent[];

    try {
        tempDirents = fs.readdirSync(tempRoot, { withFileTypes: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log(`列出 Everything 暫存資料夾失敗: ${message}`);
        return;
    }

    for (const tempDirent of tempDirents) {
        if (!tempDirent.isDirectory() || !tempDirent.name.startsWith(EVERYTHING_TEMP_PREFIX)) {
            continue;
        }

        const tempDir = path.join(tempRoot, tempDirent.name);

        try {
            const tempDirStat = fs.statSync(tempDir);
            if (nowMs - tempDirStat.mtimeMs > maxAgeMs) {
                cleanupEverythingTempDir(tempDir, log);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            log(`檢查 Everything 暫存資料夾失敗: ${message}`);
        }
    }
}
