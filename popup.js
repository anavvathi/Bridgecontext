// BridgeContext: Popup Logic v1.4.0 (Simplified)

const packsList = document.getElementById('packs-list');
const addBtn = document.getElementById('add-pack-btn');
const redeemBtn = document.getElementById('redeem-btn');
const popupCaptureBtn = document.getElementById('popup-capture-btn');

// Toast Utility
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.className = "toast show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

async function checkBridgeStatus() {
  chrome.runtime.sendNativeMessage('com.bridgecontext.host', { action: 'ping' }, (response) => {
    window.isBridgeAvailable = !chrome.runtime.lastError;
  });
}

async function renderPacks() {
  const packs = await StorageLocal.getAllPacks();

  if (packs.length === 0) {
    packsList.innerHTML = '<div class="loading">No custom packs yet. Add one!</div>';
  } else {
    packsList.innerHTML = packs.map(pack => renderPackCard(pack)).join('');
  }

  attachCardListeners();
}

function renderPackCard(pack) {
  const isExpert = pack.id.startsWith('exp_') || pack.id.startsWith('welcome_');
  return `
    <div class="pack-card ${isExpert ? 'expert-card' : ''}" data-id="${pack.id}">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div class="pack-title">
          ${pack.name}
          ${isExpert ? '<span class="expert-badge">Built-in</span>' : ''}
        </div>
        <div style="display: flex; gap: 4px;">
          ${!isExpert ? `<button class="edit-btn-inline" data-id="${pack.id}" title="Edit">✏️</button>` : ''}
          <button class="share-btn-inline" data-id="${pack.id}">Share</button>
          <button class="sync-ide-btn-inline" data-id="${pack.id}" title="Sync Context">💻 Sync</button>
          ${!isExpert ? `<button class="delete-btn-inline" data-id="${pack.id}" title="Delete">🗑️</button>` : ''}
        </div>
      </div>
      <div class="pack-desc">${pack.desc}</div>
    </div>
  `;
}

function attachCardListeners() {
  // Share Button
  document.querySelectorAll('.share-btn-inline').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const packs = await StorageLocal.getAllPacks();
      const pack = packs.find(p => p.id === id);
      const code = `BC_SHARE:${StorageLocal.encodePack(pack)}`;
      navigator.clipboard.writeText(code);
      btn.innerText = 'Copied!';
      setTimeout(() => btn.innerText = 'Share', 2000);
    };
  });

  // Sync to IDE Button
  document.querySelectorAll('.sync-ide-btn-inline').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const packs = await StorageLocal.getAllPacks();
      const pack = packs.find(p => p.id === id);

      if (pack) {
        if (window.isBridgeAvailable === false) {
          showToast("Bridge not found. Check IDE setup.");
          return;
        }
        btn.innerText = 'Syncing...';
        chrome.runtime.sendNativeMessage('com.bridgecontext.host',
          { action: 'sync', pack: pack },
          (response) => {
            if (chrome.runtime.lastError) {
              showToast("Native Host not found.");
              btn.innerText = '💻 Sync';
            } else {
              showToast("Synced to VS Code!");
              btn.innerText = '✅ Synced';
              setTimeout(() => btn.innerText = '💻 Sync', 2000);
            }
          }
        );
      }
    };
  });

  // Delete Button
  document.querySelectorAll('.delete-btn-inline').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const packs = await StorageLocal.getAllPacks();
      const pack = packs.find(p => p.id === id);
      if (pack && confirm(`Delete "${pack.name}"?`)) {
        await StorageLocal.deletePack(id);
        showToast(`Deleted: ${pack.name}`);
        renderPacks();
      }
    };
  });

  // Edit Button
  document.querySelectorAll('.edit-btn-inline').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const packs = await StorageLocal.getAllPacks();
      const pack = packs.find(p => p.id === id);
      if (pack) openPackModal(pack);
    };
  });

  // Pack Card (Injection)
  document.querySelectorAll('.pack-card').forEach(card => {
    card.onclick = async () => {
      const id = card.getAttribute('data-id');
      const packs = await StorageLocal.getAllPacks();
      const pack = packs.find(p => p.id === id);

      if (pack) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;

        chrome.tabs.sendMessage(tab.id, { action: "inject", pack: pack }, (response) => {
          if (chrome.runtime.lastError) {
            showToast("Cannot inject on this page.");
          } else {
            showToast(`Injected: ${pack.name}`);
            window.close();
          }
        });
      }
    };
  });
}


// Web Shuttle Logic (Shuttle to other LLMs)
document.querySelectorAll('.web-shuttle-btn').forEach(btn => {
  btn.onclick = async () => {
    const target = btn.getAttribute('data-target');
    const originalText = btn.innerText;
    btn.innerText = 'Launch...';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: "capture" }, async (response) => {
        if (chrome.runtime.lastError || !response || !response.captured) {
          showToast("Unable to capture context.");
          btn.innerText = originalText;
          return;
        }

        const shuttlePack = {
          id: 'shuttle_temp',
          name: `Shuttle: ${response.captured.name}`,
          desc: `Temporary shuttle from ${response.captured.source}`,
          data: response.captured.data,
          timestamp: Date.now()
        };

        // Save to active bridge for auto-injection detection
        await StorageLocal.setActiveBridge(shuttlePack);

        const urls = {
          gpt: 'https://chatgpt.com/',
          claude: 'https://claude.ai/new',
          gemini: 'https://gemini.google.com/app'
        };

        window.open(urls[target], '_blank');
        btn.innerText = originalText;
        window.close();
      });
    }
  };
});

// Bridge Logic
if (popupCaptureBtn) {
  popupCaptureBtn.onclick = async () => {
    popupCaptureBtn.innerText = 'Bridging...';
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: "capture" }, async (response) => {
        if (chrome.runtime.lastError) {
          showToast("Cannot bridge this page");
          popupCaptureBtn.innerText = 'Bridge Context';
          return;
        }
        handleCaptureResponse(response);
      });
    }
  };
}

async function handleCaptureResponse(response) {
  if (response && response.captured) {
    const customName = prompt("Name this Context Pack:", response.captured.name);
    if (customName === null) {
      popupCaptureBtn.innerText = 'Bridge Context';
      return;
    }

    await StorageLocal.savePack({
      name: customName || response.captured.name,
      desc: `Bridged from ${response.captured.source}`,
      data: response.captured.data
    });
    showToast(`Bridged: ${customName || response.captured.name}`);
    renderPacks();
  } else {
    showToast("No active context found.");
  }
  popupCaptureBtn.innerText = 'Bridge Context';
}

// Pack Modal Logic
const packModal = document.getElementById('pack-modal');
const closePackModal = document.getElementById('close-pack-modal');
const savePackBtn = document.getElementById('save-pack-btn');
const deletePackBtnModal = document.getElementById('delete-pack-btn');
const packNameInput = document.getElementById('pack-name-input');
const packDescInput = document.getElementById('pack-desc-input');
const packDataInput = document.getElementById('pack-data-input');
const packModalTitle = document.getElementById('pack-modal-title');

let editingPackId = null;

function openPackModal(pack = null) {
  editingPackId = pack ? pack.id : null;
  packModalTitle.innerText = pack ? 'Edit Context Pack' : 'New Context Pack';
  packNameInput.value = pack ? pack.name : '';
  packDescInput.value = pack ? pack.desc : '';
  packDataInput.value = pack ? (pack.data || '') : '';
  deletePackBtnModal.style.display = pack ? 'block' : 'none';
  packModal.style.display = 'flex';
  packNameInput.focus();
}

closePackModal.onclick = () => packModal.style.display = 'none';

savePackBtn.onclick = async () => {
  const name = packNameInput.value.trim();
  const desc = packDescInput.value.trim();
  const data = packDataInput.value.trim();

  if (name && desc) {
    const packData = { name, desc, data };
    if (editingPackId) packData.id = editingPackId;
    await StorageLocal.savePack(packData);
    packModal.style.display = 'none';
    renderPacks();
    showToast(editingPackId ? 'Pack Updated' : 'New Pack Created');
  } else {
    showToast('Name and Description required.');
  }
};

deletePackBtnModal.onclick = async () => {
  if (editingPackId && confirm('Delete this context pack permanently?')) {
    await StorageLocal.deletePack(editingPackId);
    packModal.style.display = 'none';
    renderPacks();
    showToast('Pack Deleted');
  }
};

addBtn.onclick = () => openPackModal();

// Portability
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');

exportBtn.onclick = async () => {
  const packs = await StorageLocal.getAllPacks();
  const blob = new Blob([JSON.stringify(packs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bridge-context-memory.json`;
  a.click();
};

importBtn.onclick = () => importFile.click();
importFile.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const packs = JSON.parse(ev.target.result);
      for (const p of packs) await StorageLocal.savePack(p);
      renderPacks();
      showToast(`Import Successful!`);
    } catch (error) {
      showToast('Import failed');
    }
  };
  reader.readAsText(file);
};

// Initialize
checkBridgeStatus();
renderPacks();
