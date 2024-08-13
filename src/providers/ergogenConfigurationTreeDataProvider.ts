import { CancellationToken, Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, workspace } from "vscode";
import { ErgogenConfigurationTreeItem } from "./ergogenConfigurationTreeItem";

export class ErgogenConfigurationTreeDataProvider implements TreeDataProvider<ErgogenConfigurationTreeItem> {
    constructor(private folderPath: string) {}

    private _onDidChangeTreeData: EventEmitter<ErgogenConfigurationTreeItem | undefined | null | void> =
        new EventEmitter<ErgogenConfigurationTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: Event<ErgogenConfigurationTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: ErgogenConfigurationTreeItem): TreeItem | Thenable<TreeItem> {
        return element;
    }

    getChildren(element?: ErgogenConfigurationTreeItem | undefined): ProviderResult<ErgogenConfigurationTreeItem[]> {
        const workspaceFolder = workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }


        return workspace
        .findFiles(`${this.folderPath}/*.yaml`)
        .then(files => {
            if (files.length > 0) {
                return files
                    .map(file => new ErgogenConfigurationTreeItem(
                        file.fsPath.split('\\').at(-1)!,
                        file.fsPath,
                        TreeItemCollapsibleState.None
                    ));
            }

            return [];
        });
    }

    changeFolder(folderPath: string): void {
        this.folderPath = folderPath;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}
