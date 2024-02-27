import { ExtensionContext, window, commands, workspace, Uri, FileSystemWatcher } from 'vscode';
import { ErgogenProvider } from './editors/ergogen.provider';
import { Commands } from './constants/comands';
import { ViewTypes } from './constants/view.types';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { ErgogenConfigurationManager } from './services/ergogenConfigurationManager';
import { ErgogenConfiguration } from './models/ergogenConfiguration';

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
            ErgogenConfigurationManager
                .getOrCreateConfigurationFileUriAsync()
                .then((fileUri: Uri) => {
                    commands.executeCommand(Commands.vscodeOpenWith, fileUri, ViewTypes.ergogenEditor);
                });
        });

    context.subscriptions.push(configureErgogenProject);

	context.subscriptions.push(ErgogenProvider.register(context));

    let ergogenConfiguration: ErgogenConfiguration | undefined;

    ErgogenConfigurationManager
        .subscribeErgogenConfigurantionFileChangeAsync((configration: ErgogenConfiguration | undefined) => {
            ergogenConfiguration = configration;
        })
        .then((fileSystemWatcher: FileSystemWatcher) => context.subscriptions.push(fileSystemWatcher));
}

export function deactivate() { }
