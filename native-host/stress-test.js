const { spawn } = require('child_process');
const path = require('path');

const HOST_SCRIPT = path.join(__dirname, 'bridge-host.js');

function runTest(payloadSizeKB) {
    console.log(`\n--- Stress Test: ${payloadSizeKB}KB Payload ---`);

    // Generate a massive string
    const largeData = 'A'.repeat(payloadSizeKB * 1024);
    const pack = {
        name: `STRESS_TEST_${payloadSizeKB}KB`,
        desc: 'Automated Stress Test Payload',
        data: largeData
    };

    const message = {
        action: 'sync',
        pack: pack
    };

    const child = spawn('node', [HOST_SCRIPT]);

    const content = Buffer.from(JSON.stringify(message));
    const header = Buffer.alloc(4);
    header.writeUInt32LE(content.length, 0);

    let output = '';
    child.stdout.on('data', (data) => {
        output += data.toString();
    });

    child.on('close', (code) => {
        console.log(`✓ Process closed with code ${code}`);
        if (output.includes('success')) {
            console.log('✓ SUCCESS: Host handled the payload.');
        } else {
            console.log('✗ FAILURE: Unexpected output or crash.');
        }
    });

    // Write header then content
    child.stdin.write(header);
    child.stdin.write(content);
    child.stdin.end();
}

console.log('Starting Synthetic Bridge Stress Tests...');
runTest(10);  // 10KB
runTest(100); // 100KB
runTest(500); // 500KB (A massive context pack)
