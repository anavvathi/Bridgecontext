const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXCHANGE_FILE = path.join(__dirname, 'exchange.json');
const HOST_SCRIPT = path.join(__dirname, 'bridge-host.js');

function simulateSync(id) {
    const pack = {
        name: `Stress Test ${id}`,
        desc: `Description for ${id}`,
        data: `Data payload for ${id}`
    };
    const message = {
        action: 'sync',
        pack: pack
    };

    // Simulate Native Messaging header (4 bytes LE length)
    const content = Buffer.from(JSON.stringify(message));
    const header = Buffer.alloc(4);
    header.writeUInt32LE(content.length, 0);

    const input = Buffer.concat([header, content]);

    // Run host script with the simulated input
    try {
        execSync(`node "${HOST_SCRIPT}"`, { input: input });
        return true;
    } catch (e) {
        console.error(`Failed at iteration ${id}:`, e.message);
        return false;
    }
}

async function runTest() {
    console.log('🚀 Starting Atomic Write Stress Test...');
    const iterations = 50;
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
        process.stdout.write(`\rProgress: ${i + 1}/${iterations}`);
        if (simulateSync(i)) {
            // Verify file integrity immediately after sync
            try {
                const content = fs.readFileSync(EXCHANGE_FILE, 'utf8');
                const parsed = JSON.parse(content);
                if (parsed.name === `Stress Test ${i}`) {
                    successCount++;
                } else {
                    console.error(`\n❌ Integrity Mismatch at ${i}: Expected "Stress Test ${i}", got "${parsed.name}"`);
                }
            } catch (e) {
                console.error(`\n❌ Read/Parse Error at ${i}:`, e.message);
            }
        }
    }

    console.log(`\n\nFinal Result: ${successCount}/${iterations} successful atomic operations.`);
    if (successCount === iterations) {
        console.log('✅ TEST PASSED: Atomic writes are robust.');
    } else {
        console.log('❌ TEST FAILED: Data corruption or race condition detected.');
        process.exit(1);
    }
}

runTest();
