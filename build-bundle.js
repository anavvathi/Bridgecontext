const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const version = "1.4.2";
const releaseDir = "release_bundle";
const zipName = `BridgeContext_Suite_v${version}.zip`;

async function build() {
    console.log(`📦 Creating BridgeContext Suite v${version}...`);

    if (fs.existsSync(releaseDir)) {
        fs.rmSync(releaseDir, { recursive: true, force: true });
    }
    fs.mkdirSync(releaseDir);

    const filesToCopy = [
        'one-click-setup.ps1',
        'master-install.js',
        'mcp-server.js',
        'package.json',
        'bridgecontext-vscode-1.1.0-Latest.vsix'
    ];

    filesToCopy.forEach(file => {
        if (fs.existsSync(file)) {
            fs.copyFileSync(file, path.join(releaseDir, file));
        }
    });

    const dirsToCopy = [
        'native-host',
        'neovim-extension',
        'sublime-extension'
    ];

    dirsToCopy.forEach(dir => {
        if (fs.existsSync(dir)) {
            fs.cpSync(dir, path.join(releaseDir, dir), { recursive: true });
        }
    });

    // JetBrains
    const jbSource = 'jetbrains-extension/build/distributions/BridgeContext-1.0.0.zip';
    const jbDest = path.join(releaseDir, 'jetbrains-extension');
    fs.mkdirSync(jbDest, { recursive: true });
    if (fs.existsSync(jbSource)) {
        fs.copyFileSync(jbSource, path.join(jbDest, 'BridgeContext-1.0.0.zip'));
    }

    // README
    const readmeContent = `# BridgeContext Universal Suite v${version}

The Universal AI Memory Proxy. Bridge context between your browser and all your favorite IDEs.

## 🚀 One-Click Installation (Windows)
1. Right-click "one-click-setup.ps1".
2. Select "Run with PowerShell".

This will automatically:
- Registers the Native Host for Chrome/Edge.
- Installs the VS Code / Cursor extension.
- Configures Neovim and Sublime Text plugins.
- **Auto-registers MCP Support** for Antigravity IDE, Cursor, and Claude Desktop.

## 🛠️ Individual IDE Setup

### Antigravity IDE / Cursor (MCP)
The installer auto-registers this! Just ask your AI: "Sync context from BridgeContext."

### Neovim
The installer places the plugin in your config folder. Use ":BridgeContext" to view synced data.

### Sublime Text
Use the Command Palette: "BridgeContext: Inject Context".

### JetBrains
Manually install the ZIP found in "jetbrains-extension/".
`;

    fs.writeFileSync(path.join(releaseDir, 'README_FIRST.md'), readmeContent);

    console.log('🤐 Zipping bundle...');
    try {
        // Using powershell for zipping since it's built-in on Windows
        execSync(`powershell Compress-Archive -Path "${releaseDir}/*" -DestinationPath "${zipName}" -Force`);
        console.log(`✅ Success! Bundle created: ${zipName}`);
    } catch (e) {
        console.error('❌ Zipping failed. You can zip the "release_bundle" folder manually.');
    }
}

build().catch(console.error);
