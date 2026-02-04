const { spawn } = require('child_process');
const path = require('path');

const HOST_SCRIPT = path.join(__dirname, 'bridge-host.js');

function runChaosTest() {
    console.log(`\n--- Chaos Test: Complex Unicode ---`);

    const chaosData = 'UTF-8 Chaos: 🚀🔥 ⚡ 🌉 日本語 (Japanese) 中文 (Chinese) 한국어 (Korean) 𝛑 (Math) <html><body>"Quotes" & \'Ticks\'</body></html>';
    const pack = {
        name: `CHAOS_TEST_🌈`,
        desc: 'Testing Emojis & Global Scripts',
        data: chaosData
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
            console.log('✓ SUCCESS: Host handled CHAOS payload.');
        }
    });

    child.stdin.write(header);
    child.stdin.write(content);
    child.stdin.end();
}

runChaosTest();
