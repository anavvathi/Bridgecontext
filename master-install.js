const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const PROJECT_ROOT = __dirname;
const IS_WINDOWS = process.platform === 'win32';

async function install() {
    console.log('🚀 BridgeContext Master Installer starting...');
    console.log('-------------------------------------------');

    // 1. Native Messaging Host Setup
    console.log('\n[1/5] Registering Native Messaging Host...');
    try {
        const setupPath = path.join(PROJECT_ROOT, 'native-host', 'setup.js');
        execSync(`node "${setupPath}"`, { stdio: 'inherit' });
        console.log('✅ Native Host registered.');
    } catch (e) {
        console.error('❌ Failed to register Native Host. Please run as admin/sudo.');
    }

    // 2. VS Code & Cursor Extension
    console.log('\n[2/5] Installing VS Code & Cursor Extensions...');
    ['code', 'cursor'].forEach(cmd => {
        try {
            console.log(`Checking for ${cmd}...`);
            // Attempt to install the VSIX if available, or just log instructions
            const vsixPath = path.join(PROJECT_ROOT, 'bridgecontext-vscode-1.0.0.vsix');
            if (fs.existsSync(vsixPath)) {
                execSync(`${cmd} --install-extension "${vsixPath}"`, { stdio: 'inherit' });
                console.log(`✅ ${cmd} extension installed.`);
            } else {
                console.log(`💡 ${cmd} found, but VSIX not found. Run "F5" in vscode-extension/ to debug.`);
            }
        } catch (e) {
            console.log(`ℹ️ ${cmd} not found or install failed. Skipping.`);
        }
    });

    // 3. Neovim Setup
    console.log('\n[3/5] Setting up Neovim Plugin...');
    const nvimPath = IS_WINDOWS
        ? path.join(process.env.LOCALAPPDATA, 'nvim', 'lua', 'bridge-context')
        : path.join(os.homedir(), '.config', 'nvim', 'lua', 'bridge-context');

    try {
        if (!fs.existsSync(path.dirname(nvimPath))) {
            fs.mkdirSync(path.dirname(nvimPath), { recursive: true });
        }
        const sourcePath = path.join(PROJECT_ROOT, 'neovim-extension', 'lua', 'bridge-context', 'init.lua');
        if (fs.existsSync(sourcePath)) {
            // Using copy for simplicity on Windows
            fs.mkdirSync(nvimPath, { recursive: true });
            fs.copyFileSync(sourcePath, path.join(nvimPath, 'init.lua'));
            console.log('✅ Neovim plugin files copied to config folder.');
        }
    } catch (e) {
        console.log('ℹ️ Neovim setup skipped (config folder not found or write error).');
    }

    // 4. Sublime Text Setup
    console.log('\n[4/5] Setting up Sublime Text Plugin...');
    const stPath = IS_WINDOWS
        ? path.join(process.env.APPDATA, 'Sublime Text', 'Packages', 'BridgeContext')
        : path.join(os.homedir(), 'Library', 'Application Support', 'Sublime Text', 'Packages', 'BridgeContext');

    try {
        if (!fs.existsSync(stPath)) {
            fs.mkdirSync(stPath, { recursive: true });
        }
        const stSource = path.join(PROJECT_ROOT, 'sublime-extension', 'BridgeContext.py');
        fs.copyFileSync(stSource, path.join(stPath, 'BridgeContext.py'));
        console.log('✅ Sublime Text plugin copied to Packages folder.');
    } catch (e) {
        console.log('ℹ️ Sublime Text setup skipped.');
    }

    console.log('\n[5/5] Registering Antigravity IDE / MCP Support...');
    const mcpServerPath = path.join(PROJECT_ROOT, 'mcp-server.js');
    console.log(`💡 MCP Server available at: ${mcpServerPath}`);
    console.log('To activate in Antigravity or Cursor:');
    console.log(`1. Open Settings -> MCP Servers`);
    console.log(`2. Add new server: "node ${mcpServerPath.replace(/\\/g, '/')}"`);

    console.log('\n-------------------------------------------');
    console.log('🎉 Production Suite Installation Complete!');
    console.log('Reload your IDEs to start the BridgeContext experience.');
}

install().catch(console.error);
