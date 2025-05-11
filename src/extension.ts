import * as vscode from 'vscode';
import { FileLinkHoverProvider } from './hover-provider';
import { FileOpener } from './file-opener';

export function activate(context: vscode.ExtensionContext) {
    console.log('File Linker extension activated');

    // Create output channel
    const outputChannel = vscode.window.createOutputChannel("File Linker Debug");
    context.subscriptions.push(outputChannel);
    outputChannel.appendLine('1. Output channel created');

    // Initialize FileOpener output channel
    FileOpener.initOutputChannel(outputChannel);
    outputChannel.appendLine('2. FileOpener initialized');

    // Register hover provider
    const hoverProvider = new FileLinkHoverProvider(outputChannel);
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('*', hoverProvider)
    );
    outputChannel.appendLine('3. Hover provider registered');

    // Register file open command
    const openFileCommand = vscode.commands.registerCommand(
        'file-linker.openFile',
        (file_name: string) => {
            outputChannel.appendLine(`Command triggered for file: ${file_name}`);
            try {
                FileOpener.openFile(file_name);
                outputChannel.appendLine('File opened successfully');
            } catch (error) {
                outputChannel.appendLine(`Error opening file: ${error}`);
                throw error;
            }
        }
    );
    context.subscriptions.push(openFileCommand);
    outputChannel.appendLine('4. File open command registered');

    // Set initial alt key state
    vscode.commands.executeCommand('setContext', 'file-linker.altPressed', false);
    outputChannel.appendLine('5. Initial context set');

    outputChannel.appendLine('6. Activation completed successfully');
}

export function deactivate() {
    vscode.commands.executeCommand('setContext', 'file-linker.altPressed', false);
}
