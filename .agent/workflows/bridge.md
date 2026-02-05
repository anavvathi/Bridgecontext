---
description: Sync with browser context using BridgeContext
---

Use this workflow to ingest research context captured from the user's browser via the BridgeContext extension.

### Steps:
1. **Read Exchange File**: Read the contents of `native-host/exchange.json`.
2. **Validate Context**: Check if the context is recent and relevant to the current task.
3. **Apply Context**: Acknowledge the context to the user and use the data to guide your code Generation/Implementation.

### Implementation:
// turbo
1. Use `view_file` on `native-host/exchange.json` (absolute path).
2. Summarize the context back to the user to confirm synchronization.
