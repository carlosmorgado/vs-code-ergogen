import { writeFileSync } from "fs";
import { join } from "path";
import { Uri, workspace } from "vscode";

export class ErgogenConfigurationService {
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
}
