import { TreeItem, TreeItemCollapsibleState } from "vscode";

export class ErgogenConfigurationTreeItem extends TreeItem {
    constructor(
        public readonly label: string,
        public readonly path: string,
        public readonly collapsibleState: TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);

        this.tooltip = label;
        this.description = path;
    }
}
