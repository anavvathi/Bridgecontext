const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('BridgeContext is now active!');
    vscode.window.showInformationMessage('🌉 BridgeContext is ready and listening!');

    const provider = new BridgeContextViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'bridgecontext-view',
            provider
        )
    );

    // Command to manually refresh
    context.subscriptions.push(
        vscode.commands.registerCommand('bridgecontext.refresh', () => {
            provider.refresh();
        })
    );
}

class BridgeContextViewProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
        this._view = undefined;
        this._exchangePath = path.join(__dirname, '..', '..', 'native-host', 'exchange.json');

        // Watch for changes in the exchange file
        fs.watchFile(this._exchangePath, (curr, prev) => {
            if (this._view) {
                this.refresh();
            }
        });
    }

    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'insertText':
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        editor.edit(editBuilder => {
                            editBuilder.insert(editor.selection.active, data.value);
                        });
                        vscode.window.showInformationMessage('Context injected from Bridge!');
                    }
                    break;
                case 'ready':
                    this.refresh();
                    break;
            }
        });

        this.refresh();
    }

    refresh() {
        if (!this._view) return;

        try {
            if (fs.existsSync(this._exchangePath)) {
                const content = fs.readFileSync(this._exchangePath, 'utf8');
                const pack = JSON.parse(content);
                this._view.webview.postMessage({ type: 'update', pack });
            } else {
                this._view.webview.postMessage({ type: 'empty' });
            }
        } catch (e) {
            console.error('Error reading exchange:', e);
        }
    }

    _getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: sans-serif; padding: 10px; color: var(--vscode-editor-foreground); }
                    .card { border: 1px solid var(--vscode-widget-border); padding: 10px; border-radius: 4px; background: var(--vscode-sideBar-background); margin-bottom: 10px; }
                    .title { font-weight: bold; margin-bottom: 5px; color: var(--vscode-button-background); }
                    .desc { font-size: 0.9em; opacity: 0.8; margin-bottom: 10px; }
                    button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 5px 10px; cursor: pointer; width: 100%; }
                    button:hover { background: var(--vscode-button-hoverBackground); }
                    .empty { text-align: center; opacity: 0.5; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div id="content">
                    <div class="empty">Waiting for context from your browser...</div>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    
                    // Signal we are ready to receive data
                    vscode.postMessage({ type: 'ready' });

                    window.addEventListener('message', event => {
                        const message = event.data;
                        const container = document.getElementById('content');
                        
                        if (message.type === 'update') {
                            container.innerHTML = '<div class="card">' +
                                '<div class="title">' + message.pack.name + '</div>' +
                                '<div class="desc">' + message.pack.desc + '</div>' +
                                '<div style="display: flex; gap: 5px;">' +
                                    '<button onclick="insert()">Inject into Code</button>' +
                                    '<button onclick="copy()" style="background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground);">Copy</button>' +
                                '</div>' +
                            '</div>';
                            window.currentText = message.pack.data;
                        } else if (message.type === 'empty') {
                            container.innerHTML = '<div class="empty">No active bridge found.</div>';
                        }
                    });

                    function insert() {
                        vscode.postMessage({ type: 'insertText', value: window.currentText });
                    }

                    function copy() {
                        navigator.clipboard.writeText(window.currentText);
                        const btn = event.target;
                        const original = btn.innerText;
                        btn.innerText = 'Copied!';
                        setTimeout(() => btn.innerText = original, 2000);
                    }
                </script>
            </body>
            </html>`;
    }
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
