import * as vscode from 'vscode';

export interface Logger {
    log: (message: string) => void;
    isEnabled: () => boolean;
    dispose: () => void;
}

export function createLogger(outputChannel: vscode.OutputChannel): Logger {
    let enabled = vscode.workspace.getConfiguration('file-linker').get<boolean>('debug', false);

    const log = (message: string) => {
        if (!enabled) return;
        outputChannel.appendLine(message);
    };

    const disposable = vscode.workspace.onDidChangeConfiguration((e) => {
        if (!e.affectsConfiguration('file-linker.debug')) return;
        enabled = vscode.workspace.getConfiguration('file-linker').get<boolean>('debug', false);
        if (enabled) {
            outputChannel.appendLine('File Linker debug enabled');
        }
    });

    return {
        log,
        isEnabled: () => enabled,
        dispose: () => disposable.dispose(),
    };
}
