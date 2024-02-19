import { workspace, window } from 'vscode';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { BehaviorSubject } from 'rxjs';
import { ErgogenConfiguration } from "../models/ergogenConfiguration";

export class ErgogenConfigurationService {
    private configurationSubject: BehaviorSubject<ErgogenConfiguration | undefined>;

    constructor() {
        this.configurationSubject = new BehaviorSubject<ErgogenConfiguration | undefined>(undefined);
        this.loadConfiguration();
    }

    subscribeConfiguration(onConfigurationChange: (configuration: ErgogenConfiguration | undefined) => void): void {
        this.configurationSubject.subscribe(onConfigurationChange);
    }

    createOrUpdateConfiguration(configuration: ErgogenConfiguration): void {
        const workspaceFolders = workspace.workspaceFolders;

        if (workspaceFolders && workspaceFolders.length > 0) {
            const workspaceFolder = workspaceFolders[0];

            const rootPath = workspaceFolder.uri.fsPath;
            const filePath = join(rootPath, `${workspaceFolder.name}.ergogen`);

            const fileContent = JSON.stringify(configuration, null, 2);

            writeFileSync(filePath, fileContent);
            this.configurationSubject.next(configuration);
        }
        else {
            window.showInformationMessage('No workspace folder found');
        }
    }

    private loadConfiguration(): void {
        workspace
            .findFiles('**/*.ergogen', '**/node_modules/**', 1)
            .then(files => {
                if (files.length > 0) {
                    const filePath = files[0].fsPath;
                    const fileContent = readFileSync(filePath, 'utf-8');

                    const configuration: ErgogenConfiguration = JSON.parse(fileContent);

                    this.configurationSubject.next(configuration);
                }
            });
    }
}
