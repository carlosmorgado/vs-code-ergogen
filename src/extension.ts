import { ExtensionContext, window, commands, workspace, Uri, FileSystemWatcher } from 'vscode';
import { ErgogenProvider } from './editors/ergogen.provider';
import { Commands } from './constants/comands';
import { ViewTypes } from './constants/view.types';
import { ErgogenConfigurationManager } from './services/ergogenConfigurationManager';
import { ErgogenConfiguration } from './models/ergogenConfiguration';
import { ErgogenConfigurationTreeDataProvider } from './providers/ergogenConfigurationTreeDataProvider';

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
    let configTreeDataProvider: ErgogenConfigurationTreeDataProvider | undefined;

    ErgogenConfigurationManager
        .subscribeErgogenConfigurantionFileChangeAsync((configration: ErgogenConfiguration | undefined) => {
            const refreshConfigView: boolean = configration?.configurationFolder !== ergogenConfiguration?.configurationFolder;

            ergogenConfiguration = configration;

            if (!configTreeDataProvider) {
                configTreeDataProvider = new ErgogenConfigurationTreeDataProvider(ergogenConfiguration!.configurationFolder);

                window.registerTreeDataProvider('ergogen.views.configurationFolder', configTreeDataProvider);
            }
            else {
                if (refreshConfigView) {
                    configTreeDataProvider.changeFolder(ergogenConfiguration!.configurationFolder);
                    configTreeDataProvider.refresh();
                }
            }
        })
        .then((fileSystemWatcher: FileSystemWatcher) => context.subscriptions.push(fileSystemWatcher));
}

export function deactivate() { }
