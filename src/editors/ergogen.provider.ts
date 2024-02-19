import { CancellationToken, CustomTextEditorProvider, Disposable, ExtensionContext, Range, TextDocument, Uri, ViewColumn, Webview, WebviewPanel, WorkspaceEdit, commands, window, workspace } from "vscode";
import { ViewTypes } from "../constants/view.types";
import { getNonce } from "../utils/getNonce";
import { Commands } from "../constants/comands";

// Based on https://github.com/timheuer/resx-editor/tree/main

export class ErgogenProvider implements CustomTextEditorProvider {
    private static readonly viewType = ViewTypes.ergogenEditor;

    constructor(private readonly context: ExtensionContext) { }

    public static register(context: ExtensionContext): Disposable {
        const provider = new ErgogenProvider(context);
        const providerRegistration = window.registerCustomEditorProvider(ErgogenProvider.viewType, provider);

        this.registerCommands(context);
        return providerRegistration;
    }

    resolveCustomTextEditor(
        document: TextDocument,
        webviewPanel: WebviewPanel,
        token: CancellationToken
    ): void | Thenable<void> {
        this.configureWebviewPanel(document, webviewPanel);
        this.updateWebview(document, webviewPanel);
    }

    private configureWebviewPanel(document: TextDocument, webviewPanel: WebviewPanel): void {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                Uri.joinPath(this.context.extensionUri, 'out'),
                Uri.joinPath(this.context.extensionUri, 'out', 'assets'),
                Uri.joinPath(this.context.extensionUri, 'out', 'assets', 'codicons'),
                Uri.joinPath(this.context.extensionUri, 'out', 'assets', 'styles')]
        };

        webviewPanel.webview.html = this.createWebviewContent(webviewPanel.webview);

        const changeDocumentSubscription = workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                this.updateWebview(document, webviewPanel);
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        webviewPanel.webview.onDidReceiveMessage(event => this.eventListner(event, document));
    }

    private eventListner(event: any, document: TextDocument): void {
        if (event.type === 'ergogen-editor-save') {
            this.saveTextDocumentAsync(document, event.json);
        }
    }

    private updateWebview(document: TextDocument, webviewPanel: WebviewPanel) {
        const ergogenConfigurationJson = document.getText();

        webviewPanel.webview.postMessage({
            type: 'ergogen-editor-update',
            json: ergogenConfigurationJson
        });
    }

    private async saveTextDocumentAsync(document: TextDocument, ergogenConfiguration: any): Promise<void> {
        const edit = new WorkspaceEdit();
        const ergogenConfigurationJson = JSON.stringify(ergogenConfiguration, null, "\t");

        edit.replace(
            document.uri,
            new Range(0, 0, document.lineCount, 0),
            await ergogenConfigurationJson);

        workspace.applyEdit(edit);
        workspace.save(document.uri);
    }

    private createWebviewContent(webview: Webview): string {
        const webviewUri = webview.asWebviewUri(Uri.joinPath(this.context.extensionUri, 'out', 'webview.js'));
        const nonce = getNonce();
        const codiconsUri = webview.asWebviewUri(Uri.joinPath(this.context.extensionUri, 'out', 'assets', 'codicons', 'codicon.css'));
        const stylesUri = webview.asWebviewUri(Uri.joinPath(this.context.extensionUri, 'out', 'assets', 'styles', 'editor.css'));

        return /*html*/ `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta
                http-equiv="Content-Security-Policy"
                content="default-src 'none'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}'; style-src ${webview.cspSource} 'nonce-${nonce}'; style-src-elem ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource};"
                />
                <link href="${codiconsUri}" rel="stylesheet" nonce="${nonce}">
                <link href="${stylesUri}" rel="stylesheet" nonce="${nonce}">
            </head>
            <body>
                <div class="form-container">
                    <vscode-text-field id="conguration-folder-field" placeholder="config">Configuration Folder</vscode-text-field>
                    <vscode-text-field id="output-folder-field" placeholder="out">Output Folder</vscode-text-field>
                    <vscode-button id="save-button">
                        Save
                        <span slot="start" class="codicon codicon-save"></span>
                    </vscode-button>
                </div>
                <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
            </body>
            </html>
        `;
    }

    private static registerCommands(context: ExtensionContext): void {
        const openInErgogenEditorCommand = commands.registerCommand(
            Commands.openInErgogenEditor,
            () => {
                const editor = window.activeTextEditor;

                commands.executeCommand(Commands.workbenchCloseActiveEditor)
                    .then(_ =>
                        commands.executeCommand(
                            Commands.vscodeOpenWith,
                            editor?.document?.uri,
                            ViewTypes.ergogenEditor));
            });

        const openInTextEditorCommand = commands.registerCommand(
            Commands.openInTextEditor,
            () => {
                const editor = window.activeTextEditor;

                commands.executeCommand(Commands.workbenchReopenTextEditor, editor?.document?.uri);
            });

        context.subscriptions.push(openInErgogenEditorCommand);
        context.subscriptions.push(openInTextEditorCommand);
    }
}

