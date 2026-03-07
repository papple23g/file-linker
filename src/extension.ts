import * as vscode from 'vscode';
import { FileLinkHoverProvider } from './hover-provider';
import { FileOpener } from './file-opener';
import { createLogger } from './logger';

export function activate(context: vscode.ExtensionContext) {
    // Create output channel (only writes when debug setting is enabled)
    const outputChannel = vscode.window.createOutputChannel('File Linker Debug');
    context.subscriptions.push(outputChannel);

    const logger = createLogger(outputChannel);
    context.subscriptions.push({ dispose: logger.dispose });

    logger.log('File Linker extension activated');

    // Initialize FileOpener logger
    FileOpener.initLogger(logger.log);

    // Register hover provider
    const hoverProvider = new FileLinkHoverProvider(logger.log);
    context.subscriptions.push(vscode.languages.registerHoverProvider('*', hoverProvider));

    // Register file open command
    const openFileCommand = vscode.commands.registerCommand('file-linker.openFile', (fileName: string) => {
        logger.log(`Command triggered for file: ${fileName}`);
        FileOpener.openFile(fileName);
    });
    context.subscriptions.push(openFileCommand);

    logger.log('Activation completed successfully');
}

// this method is called when your extension is deactivated
export function deactivate() {}
