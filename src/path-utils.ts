export function isPlausibleFilePath(filePath: string): boolean {
    return filePath.includes('\\') || filePath.includes('/') || /^[a-zA-Z]:/.test(filePath);
}
