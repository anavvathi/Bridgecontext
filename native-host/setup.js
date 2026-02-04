const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const HOST_NAME = 'com.bridgecontext.host';
const MANIFEST_FILE = `${HOST_NAME}.json`;
const PROJECT_ROOT = path.join(__dirname, '..');
const NATIVE_HOST_DIR = path.join(PROJECT_ROOT, 'native-host');
const MANIFEST_PATH = path.join(NATIVE_HOST_DIR, MANIFEST_FILE);

/**
 * Universal Setup Script for BridgeContext Native Host
 */
function setup() {
    console.log('--- BridgeContext Native Host Setup ---');

    // 1. Resolve absolute paths for the manifest
    let manifest;
    try {
        manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    } catch (e) {
        console.error(`Error: Could not find ${MANIFEST_FILE} at ${MANIFEST_PATH}`);
        process.exit(1);
    }

    const isWindows = process.platform === 'win32';
    const wrapperName = isWindows ? 'bridge-host.bat' : 'bridge-host.js';
    const hostPath = path.join(NATIVE_HOST_DIR, wrapperName);

    manifest.path = hostPath;
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 4));
    console.log(`✓ Updated manifest path to: ${hostPath}`);

    // 2. Register based on OS
    if (isWindows) {
        registerWindows();
    } else {
        registerUnix();
    }

    console.log('\n--- Setup Complete ---');
    console.log('Next steps:');
    console.log('1. Ensure your Chrome Extension ID is in the "allowed_origins" of the manifest.');
    console.log('2. Reload the BridgeContext extension in chrome://extensions.');
}

function registerWindows() {
    console.log('Registering for Windows...');
    const chromeKey = `HKEY_CURRENT_USER\\Software\\Google\\Chrome\\NativeMessagingHosts\\${HOST_NAME}`;
    const edgeKey = `HKEY_CURRENT_USER\\Software\\Microsoft\\Edge\\NativeMessagingHosts\\${HOST_NAME}`;

    try {
        execSync(`reg add "${chromeKey}" /ve /t REG_SZ /d "${MANIFEST_PATH}" /f`);
        console.log(`✓ Chrome Registry key updated: ${chromeKey}`);

        execSync(`reg add "${edgeKey}" /ve /t REG_SZ /d "${MANIFEST_PATH}" /f`);
        console.log(`✓ Edge Registry key updated: ${edgeKey}`);
    } catch (e) {
        console.error('Failed to update registry. Try running as Administrator.');
    }
}

function registerUnix() {
    const platform = process.platform;
    const targets = [];

    if (platform === 'darwin') {
        console.log('Registering for macOS...');
        targets.push(path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome', 'NativeMessagingHosts'));
        targets.push(path.join(os.homedir(), 'Library', 'Application Support', 'Microsoft Edge', 'NativeMessagingHosts'));
    } else {
        console.log('Registering for Linux...');
        targets.push(path.join(os.homedir(), '.config', 'google-chrome', 'NativeMessagingHosts'));
        targets.push(path.join(os.homedir(), '.config', 'microsoft-edge', 'NativeMessagingHosts'));
    }

    targets.forEach(destDir => {
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        const destPath = path.join(destDir, MANIFEST_FILE);
        fs.copyFileSync(MANIFEST_PATH, destPath);
        console.log(`✓ Manifest copied to: ${destPath}`);
    });
}

setup();
