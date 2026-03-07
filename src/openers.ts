import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

export type SpawnFn = (
    command: string,
    args?: ReadonlyArray<string>,
    options?: SpawnOptionsWithoutStdio,
) => ReturnType<typeof spawn>;

export function buildExplorerSelectArgs(filePath: string): string[] {
    // IMPORTANT (Windows): do NOT run through cmd.exe (shell=true), otherwise emoji / non-ANSI chars can break.
    // explorer.exe expects a single arg like: /select,<fullpath>
    return [`/select,${filePath}`];
}

export function openWithExplorerSelect(
    filePath: string,
    spawnFn: SpawnFn = spawn,
): ReturnType<typeof spawn> {
    return spawnFn('explorer.exe', buildExplorerSelectArgs(filePath), {
        shell: false,
        windowsHide: true,
    });
}

export function openWithMacOpen(
    filePath: string,
    spawnFn: SpawnFn = spawn,
): ReturnType<typeof spawn> {
    return spawnFn('open', [filePath], {
        shell: false,
    });
}
