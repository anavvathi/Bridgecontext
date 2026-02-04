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
            // Save to exchange file for VS Code to pick up
            fs.writeFileSync(EXCHANGE_FILE, JSON.stringify(message.pack, null, 2));
            sendMessage({ status: 'success', message: 'Context synced to local exchange.' });
        } else if (message.action === 'ping') {
            sendMessage({ status: 'pong', version: '1.0.0' });
        }
    }
} catch (err) {
    console.error(err);
    process.exit(1);
}
