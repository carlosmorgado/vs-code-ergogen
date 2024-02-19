import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextField } from '@vscode/webview-ui-toolkit';

// Based on https://github.com/timheuer/resx-editor/tree/main

const vscode = acquireVsCodeApi();
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextField());

(function () {
    const congurationFolderField = document.getElementById("conguration-folder-field");
    const outputFolderField = document.getElementById("output-folder-field");
    const saveButton = document.getElementById("save-button");

    initForm();
    configureEventListener();

    const state = vscode.getState();
    if (state) {
        updateContent(state.text);
    }

    function initForm() {
        saveButton.onclick = save;
    }

    function configureEventListener() {
        window.addEventListener(
            'message',
            event => {
                const message = event.data;

                if (message.type === 'ergogen-editor-update') {
                    const json = message.json;
                    const vscodeState = vscode.getState()?.text;
                    const vscodeStateJson = vscode.getState()?.json;

                    console.log('json: ' + json);
                    console.log('vscodeState (text): ' + vscodeState);
                    console.log('vscodeState (json): ' + vscodeStateJson);

                    if (json !== vscodeState) {
                        updateContent(json);
                    }

                    vscode.setState({ json });
                }
            });
    }

    function updateContent(/** @type {string} **/ json) {
        if (json) {
            let ergogenConfiguration;
            try {
                ergogenConfiguration = JSON.parse(json);

                congurationFolderField.value = ergogenConfiguration.configurationFolder;
                outputFolderField.value = ergogenConfiguration.outputFolder;
            }
            catch {
                console.log("Unable to parse json.");
                return;
            }
        }
        else {
            console.log("no json was sent");
        }
    }

    function save() {
        const congurationFolder = congurationFolderField.value;
        const outputFolder = outputFolderField.value;

        vscode.postMessage({
            type: 'ergogen-editor-save',
            json: {
                configurationFolder: congurationFolder,
                outputFolder: outputFolder
            }
        });
    }
})();
