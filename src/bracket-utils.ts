export const BRACKET_RANGE_REGEX = /\[[^\]]+\]/;
export const BRACKET_EXTRACT_REGEX = /\[([^\]]+)\]/;

export function extractBracketedFileName(text: string): string | null {
    const m = text.match(BRACKET_EXTRACT_REGEX);
    return m?.[1] ?? null;
}
