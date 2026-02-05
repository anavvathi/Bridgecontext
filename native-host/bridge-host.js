#!/usr/bin/env node

/**
 * BridgeContext Native Host v1.0.0
 * This script acts as a bridge between the Browser Extension and the VS Code Extension.
 * It uses the Google Chrome Native Messaging API.
 */

const fs = require('fs');
const path = require('path');

// We use a local file as a temporary "Exchange" if the IDE isn't listening via IPC
const EXCHANGE_FILE = path.join(__dirname, 'exchange.json');

/**
 * Native Messaging protocol uses a 4-byte header for message length.
 */
function readMessage() {
    const header = Buffer.alloc(4);
    const bytesRead = fs.readSync(0, header, 0, 4);
    if (bytesRead === 0) return null;

    const length = header.readUInt32LE(0);
    const content = Buffer.alloc(length);
    fs.readSync(0, content, 0, length);

    return JSON.parse(content.toString());
}

function sendMessage(msg) {
    const content = Buffer.from(JSON.stringify(msg));
    const header = Buffer.alloc(4);
    header.writeUInt32LE(content.length, 0);

    process.stdout.write(header);
    process.stdout.write(content);
}

// Main logic
try {
    const message = readMessage();
    if (message) {
        if (message.action === 'sync') {
            // Save to exchange file atomically for VS Code to pick up
            const tempFile = EXCHANGE_FILE + '.tmp';
            try {
                fs.writeFileSync(tempFile, JSON.stringify(message.pack, null, 2));

                // On Windows, renameSync can fail with EPERM if the file is locked 
                // briefly by a watcher (like the VS Code extension). Retry a few times.
                let attempts = 0;
                const maxAttempts = 5;
                while (attempts < maxAttempts) {
                    try {
                        if (fs.existsSync(EXCHANGE_FILE)) {
                            // Some environments require explicitly deleting the target before rename for EPERM
                            // though renameSync should handle it.
                        }
                        fs.renameSync(tempFile, EXCHANGE_FILE);
                        break;
                    } catch (e) {
                        attempts++;
                        if (attempts >= maxAttempts) throw e;
                        // Sleep briefly (synchronous busy wait for simplicity in this Node script)
                        const start = Date.now();
                        while (Date.now() - start < 50) { }
                    }
                }

                sendMessage({ status: 'success', message: 'Context synced to local exchange.' });
            } catch (err) {
                // Return errors gracefully to the extension
                sendMessage({ status: 'error', message: 'Failed to write exchange file: ' + err.message });
            }
        } else if (message.action === 'ping') {
            sendMessage({ status: 'pong', version: '1.0.0' });
        }
    }
} catch (err) {
    console.error(err);
    process.exit(1);
}
