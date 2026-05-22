import * as vscode from 'vscode';
import { FileLinkHoverProvider } from './hover-provider';
import { FileOpener } from './file-opener';

export function activate(context: vscode.ExtensionContext) {
    console.log('File Linker extension activated');

    const outputChannel = vscode.window.createOutputChannel("File Linker Debug");
    context.subscriptions.push(outputChannel);
    outputChannel.appendLine('File Linker extension activated');

    FileOpener.initOutputChannel(outputChannel);
    outputChannel.appendLine('FileOpener initialized');

    const hoverProvider = new FileLinkHoverProvider(outputChannel);
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('*', hoverProvider)
    );
    outputChannel.appendLine('Hover provider registered');

    const openFileCommand = vscode.commands.registerCommand(
        'file-linker.openFile',
        (fileName: string) => {
            outputChannel.appendLine(`Command triggered for file: ${fileName}`);
            try {
                FileOpener.openFile(fileName);
            } catch (error) {
                outputChannel.appendLine(`Error opening file: ${error}`);
                throw error;
            }
        }
    );
    context.subscriptions.push(openFileCommand);
    outputChannel.appendLine('File open command registered');

    outputChannel.appendLine('Activation completed successfully');
}

// this method is called when your extension is deactivated
export function deactivate() {}
