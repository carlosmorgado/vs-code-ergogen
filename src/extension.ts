import { ExtensionContext, window, commands, workspace, Uri } from 'vscode';
import { ErgogenProvider } from './editors/ergogen.provider';
import { Commands } from './constants/comands';
import { ViewTypes } from './constants/view.types';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { ErgogenConfigurationService } from './services/ergogenConfigurationService';

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
            ErgogenConfigurationService
                .getOrCreateConfigurationFileUriAsync()
                .then((fileUri: Uri) => {
                    commands.executeCommand(Commands.vscodeOpenWith, fileUri, ViewTypes.ergogenEditor);
                });
        });

    context.subscriptions.push(configureErgogenProject);

	context.subscriptions.push(ErgogenProvider.register(context));
}

export function deactivate() { }
