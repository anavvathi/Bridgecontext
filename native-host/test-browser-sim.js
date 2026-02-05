const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BRIDGE_HOST_JS = path.join(__dirname, 'bridge-host.js');

const testPack = {
    action: 'sync',
    pack: {
        id: 'test_context_v2',
        name: '🚀 Simulated Context v2',
        desc: 'Testing the Bridge from Antigravity Simulator',
        data: 'Context synchronized successfully via Native Messaging simulation. Timestamp: ' + new Date().toISOString()
    }
};

function sendToHost(payload) {
    const msg = JSON.stringify(payload);
    const msgBuffer = Buffer.from(msg);
    const len = Buffer.alloc(4);
    len.writeUInt32LE(msgBuffer.length, 0);

    console.log('Spawning bridge-host.js...');
    const child = spawn('node', [BRIDGE_HOST_JS]);

    let responseData = Buffer.alloc(0);
    child.stdout.on('data', (data) => {
        responseData = Buffer.concat([responseData, data]);
    });

    child.stderr.on('data', (data) => {
        console.error('Host Error Log:', data.toString());
    });

    child.on('close', (code) => {
        console.log(`Host exited with code ${code}`);
        if (responseData.length > 4) {
            const responseLen = responseData.readUInt32LE(0);
            const responseBody = responseData.slice(4, 4 + responseLen).toString();
            try {
                console.log('Host Response:', JSON.parse(responseBody));
            } catch (e) {
                console.log('Response was not JSON:', responseBody);
            }
        }
    });

    // Write the length header followed by the message
    child.stdin.write(len);
    child.stdin.write(msgBuffer);
    child.stdin.end();
}

sendToHost(testPack);
