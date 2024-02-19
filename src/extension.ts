import { ExtensionContext, window, commands, ViewColumn, workspace, Uri } from 'vscode';
import { ErgogenConfigurationService } from './services/ergogen-configuration.service';
import { ErgogenConfiguration } from './models/ergogenConfiguration';
import { ErgogenProvider } from './editors/ergogen.provider';
import { Commands } from './constants/comands';
import { ViewTypes } from './constants/view.types';

export function activate(context: ExtensionContext) {
    const ergogenConfigurationService: ErgogenConfigurationService = new ErgogenConfigurationService();
    ergogenConfigurationService
        .subscribeConfiguration((ergogenConfiguration: ErgogenConfiguration | undefined) =>{
            const startProjectVisible: boolean = !ergogenConfiguration;
            commands.executeCommand('setContext', 'ergogen.startProjectVisible', startProjectVisible);
        });

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

                        commands.executeCommand(
                            Commands.vscodeOpenWith,
                            fileUri,
                            ViewTypes.ergogenEditor);
                    }
                });
        });

    const startProjectDisposable = commands.registerCommand('ergogen.startProject', () => {
        const ergogenConfiguration: ErgogenConfiguration = {
            configurationFolder: "configFile",
            outputFolder: "outputFolder"
        };

        ergogenConfigurationService.createOrUpdateConfiguration(ergogenConfiguration);
    });

    context.subscriptions.push(configureErgogenProject);
    context.subscriptions.push(startProjectDisposable);

	context.subscriptions.push(ErgogenProvider.register(context));
}

export function deactivate() { }
