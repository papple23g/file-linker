import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

export type SpawnFn = (
    command: string,
    args?: ReadonlyArray<string>,
    options?: SpawnOptionsWithoutStdio,
) => ReturnType<typeof spawn>;

export function buildExplorerSelectArgs(filePath: string): string[] {
    return [`/select,"${filePath}"`];
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

export function openWithExplorerFolder(
    folderPath: string,
    spawnFn: SpawnFn = spawn,
): ReturnType<typeof spawn> {
    return spawnFn('explorer.exe', [folderPath], {
        shell: false,
        windowsHide: true,
    });
}

export function openWithDefaultWindowsApp(
    filePath: string,
    spawnFn: SpawnFn = spawn,
): ReturnType<typeof spawn> {
    return spawnFn('explorer.exe', [filePath], {
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
