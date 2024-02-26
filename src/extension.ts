import { ExtensionContext, window, commands, workspace, Uri } from 'vscode';
import { ErgogenProvider } from './editors/ergogen.provider';
import { Commands } from './constants/comands';
import { ViewTypes } from './constants/view.types';
import { join } from 'path';
import { writeFileSync } from 'fs';

export function activate(context: ExtensionContext) {
    // Test Sidebar
    /*
    const projhectView = window.createTreeView('ergogen.views.project', {
        treeDataProvider: {
            getChildren
        }
    });
    context.subscriptions.push(projhectView);
    */
    // End Test Sidebar

    const configureErgogenProject = commands.registerCommand(
        Commands.configureErgogenProject,
        () => {
            workspace
                .findFiles('**/*.ergogen', '**/node_modules/**', 1)
                .then(files => {
                    if (files.length > 0) {
                        const filePath = files[0].fsPath;
                        const fileUri = Uri.file(filePath);

                        commands.executeCommand(Commands.vscodeOpenWith,fileUri, ViewTypes.ergogenEditor);

                        return;
                    }
                    const workspaceFolder = workspace.workspaceFolders?.[0];
                    if (!workspaceFolder) {
                        window.showErrorMessage('No workspace folder found');
                        return;
                    }

                    const filePath = join(workspaceFolder.uri.fsPath, `${workspaceFolder.name}.ergogen`);
                    writeFileSync(filePath, '');

                    const uri = Uri.file(filePath);

                    commands.executeCommand(Commands.vscodeOpenWith, uri, ViewTypes.ergogenEditor);
                });
        });

    context.subscriptions.push(configureErgogenProject);

	context.subscriptions.push(ErgogenProvider.register(context));
}

export function deactivate() { }
