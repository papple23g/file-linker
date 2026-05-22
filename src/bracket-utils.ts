export const BRACKET_RANGE_REGEX = /\[[^\]]+\]/;
export const BRACKET_EXTRACT_REGEX = /\[([^\]]+)\]/;

export function extractBracketedFileName(text: string): string | null {
    const match = text.match(BRACKET_EXTRACT_REGEX);
    return match?.[1] ?? null;
}
