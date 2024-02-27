import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { FileSystemWatcher, Uri, workspace } from "vscode";
import { ErgogenConfiguration } from "../models/ergogenConfiguration";

export class ErgogenConfigurationManager {
    static getOrCreateConfigurationFileUriAsync(): PromiseLike<Uri> {
        const workspaceFolder = workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        return workspace
            .findFiles('**/*.ergogen', '**/node_modules/**', 1)
            .then(files => {
                if (files.length > 0) {
                    const filePath = files[0].fsPath;
                    const fileUri = Uri.file(filePath);
                    return fileUri;
                }

                const filePath = join(workspaceFolder.uri.fsPath, `${workspaceFolder.name}.ergogen`);
                writeFileSync(filePath, '');

                const fileUri = Uri.file(filePath);
                return fileUri;
            });
    }

    static async subscribeErgogenConfigurantionFileChangeAsync(
        onFileChange: (configration: ErgogenConfiguration | undefined) => void)
        : Promise<FileSystemWatcher> {
            const fileUri: Uri = await this.getOrCreateConfigurationFileUriAsync();

            const configurationFileWatcher: FileSystemWatcher = workspace.createFileSystemWatcher(fileUri.fsPath);

            configurationFileWatcher.onDidChange(_ => {
                const fileContent = readFileSync(fileUri.fsPath, 'utf-8');

                const ergogenConfiguration: ErgogenConfiguration = JSON.parse(fileContent) as ErgogenConfiguration;

                onFileChange(ergogenConfiguration);
            });

            return configurationFileWatcher;
    }
}
