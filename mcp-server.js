#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

function findExchangeFile() {
    // 1. Check environment variable
    if (process.env.BRIDGE_CONTEXT_EXCHANGE) return process.env.BRIDGE_CONTEXT_EXCHANGE;

    // 2. Check local relative path (dev mode)
    const localPath = path.join(__dirname, 'native-host', 'exchange.json');
    if (fs.existsSync(localPath)) return localPath;

    // 3. Windows Registry Discovery
    if (process.platform === 'win32') {
        try {
            const hostName = 'com.bridgecontext.host';
            const regBuffer = execSync(`reg query "HKEY_CURRENT_USER\\Software\\Google\\Chrome\\NativeMessagingHosts\\${hostName}" /ve`);
            const regOutput = regBuffer.toString();
            const match = regOutput.match(/REG_SZ\s+(.*)/);
            if (match && match[1]) {
                const manifestPath = match[1].trim();
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                if (manifest.path) {
                    const exchangePath = path.join(path.dirname(manifest.path), 'exchange.json');
                    if (fs.existsSync(exchangePath)) return exchangePath;
                }
            }
        } catch (e) { /* silent fail */ }
    }

    // 4. Fallback to CWD
    return path.join(process.cwd(), 'native-host', 'exchange.json');
}

const EXCHANGE_PATH = findExchangeFile();

async function main() {
    process.stderr.write('🌉 BridgeContext MCP Server active\n');

    let buffer = '';
    process.stdin.on('data', (chunk) => {
        buffer += chunk.toString();
        let eolIndex;
        while ((eolIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, eolIndex);
            buffer = buffer.slice(eolIndex + 1);
            if (line.trim()) {
                handleRequest(line);
            }
        }
    });
}

function handleRequest(line) {
    try {
        const request = JSON.parse(line);
        const { method, params, id } = request;

        if (method === 'initialize') {
            sendResponse(id, {
                capabilities: { tools: {} },
                serverInfo: { name: "bridge-context-mcp", version: "1.0.0" }
            });
        } else if (method === 'tools/list') {
            sendResponse(id, {
                tools: [{
                    name: 'get_current_context',
                    description: 'Retrieve the latest AI context bridged from the browser. Use this to get information the user has just researched or captured in their browser.',
                    inputSchema: { type: 'object', properties: {} }
                }]
            });
        } else if (method === 'tools/call' && params.name === 'get_current_context') {
            if (fs.existsSync(EXCHANGE_PATH)) {
                try {
                    const content = fs.readFileSync(EXCHANGE_PATH, 'utf8');
                    const pack = JSON.parse(content);
                    sendResponse(id, {
                        content: [{
                            type: 'text',
                            text: `--- BRIDGE CONTEXT ---\nTitle: ${pack.name}\nDescription: ${pack.desc}\n\nPayload:\n${pack.data}`
                        }]
                    });
                } catch (err) {
                    sendResponse(id, {
                        content: [{ type: 'text', text: 'Error reading context: ' + err.message }],
                        isError: true
                    });
                }
            } else {
                sendResponse(id, {
                    content: [{ type: 'text', text: 'No context available. Please bridge context from your browser first.' }]
                });
            }
        }
    } catch (e) {
        // Silent catch for parse errors on half-written lines
    }
}

function sendResponse(id, result) {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

// Smithery Sandbox Support
function createSandboxServer() {
    return {
        connect: async () => {
            process.stderr.write('☁️ Smithery Sandbox Connect Simulation\n');
        },
        listTools: async () => {
            return {
                tools: [{
                    name: 'get_current_context',
                    description: 'Retrieve the latest AI context bridged from the browser.'
                }]
            };
        }
    };
}

if (require.main === module) {
    main();
}

module.exports = { createSandboxServer };
