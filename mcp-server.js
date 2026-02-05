#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Resolve path relative to the script location
const EXCHANGE_PATH = path.join(__dirname, 'native-host', 'exchange.json');

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

main();
