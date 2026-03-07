export function isPlausibleFilePath(filePath: string): boolean {
    if (!filePath) return false;

    // Basic path sanity check: contains path separators or starts with drive letter.
    return (
        filePath.includes('\\') ||
        filePath.includes('/') ||
        /^[a-zA-Z]:/.test(filePath)
    );
}
