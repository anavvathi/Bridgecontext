// BridgeContext: Popup Logic v1.3.0

const packsList = document.getElementById('packs-list');
const discoverList = document.getElementById('discover-list');
const addBtn = document.getElementById('add-pack-btn');
const redeemBtn = document.getElementById('redeem-btn');

const cloudConnectBtn = document.getElementById('cloud-connect-btn');
const loginView = document.getElementById('login-view');
const usernameInput = document.getElementById('username-input');
const loginSubmitBtn = document.getElementById('login-submit-btn');
const loginCancelBtn = document.getElementById('login-cancel-btn');

const workspaceSelect = document.getElementById('workspace-select');
let currentWorkspace = 'personal';

// Toast Utility
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.className = "toast show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

// Set default behavior immediately
cloudConnectBtn.onclick = () => {
  loginView.style.display = 'flex';
  usernameInput.focus();
};

async function checkUserStatus() {
  try {
    const user = await StorageLocal.getUser();
    const syncBtn = document.getElementById('params-sync-btn');

    if (user) {
      cloudConnectBtn.innerText = `👤 ${user.name}`;
      syncBtn.style.display = 'block';
      workspaceSelect.style.display = 'block';

      syncBtn.onclick = async () => {
        syncBtn.classList.add('spinning');
        await StorageLocal.sync();
        syncBtn.classList.remove('spinning');
        renderPacks();
        showToast('Sync complete!');
      };

      cloudConnectBtn.onclick = async () => {
        if (confirm(`Logout of ${user.name}?`)) {
          await StorageLocal.logout();
          location.reload();
        }
      };
    } else {
      // Reset to default state if not logged in
      cloudConnectBtn.innerText = '☁️ Connect';
      syncBtn.style.display = 'none';
      workspaceSelect.style.display = 'none';

      cloudConnectBtn.onclick = () => {
        loginView.style.display = 'flex';
        usernameInput.focus();
      };
    }
  } catch (e) {
    // Fallback: Ensure button works even if storage fails
    cloudConnectBtn.innerText = '☁️ Connect';
    cloudConnectBtn.onclick = () => {
      loginView.style.display = 'flex';
      usernameInput.focus();
    };
  }
}

// Login Logic
loginSubmitBtn.onclick = async () => {
  const username = usernameInput.value.trim();
  if (username) {
    await StorageLocal.login(username);
    loginView.style.display = 'none';
    checkUserStatus();

    // Auto-Sync on Login for perceived smoothness
    const syncBtn = document.getElementById('params-sync-btn');
    if (syncBtn) syncBtn.classList.add('spinning');
    await StorageLocal.sync();
    if (syncBtn) syncBtn.classList.remove('spinning');

    renderPacks();
    showToast(`Welcome, ${username}!`);
  }
};

loginCancelBtn.onclick = () => {
  loginView.style.display = 'none';
};

// Workspace Logic
workspaceSelect.onchange = (e) => {
  currentWorkspace = e.target.value;
  renderPacks();
};

async function renderPacks() {
  let packs = [];

  // Decide which packs to show based on workspace
  if (currentWorkspace === 'personal') {
    packs = await StorageLocal.getAllPacks();
  } else {
    packs = await StorageLocal.getTeamPacks();
  }

  const user = await StorageLocal.getUser();

  // Basic filtering
  const displayPacks = packs.filter(p => !p.is_team && !p.id.startsWith('exp_'));
  const teamPacks = packs.filter(p => p.is_team);
  const expertPacks = await StorageLocal.getExpertPacks();

  // Render Logic
  if (currentWorkspace === 'personal') {
    if (displayPacks.length === 0) {
      packsList.innerHTML = '<div class="loading">No custom packs yet. Add one!</div>';
    } else {
      packsList.innerHTML = displayPacks.map(pack => renderPackCard(pack, !!user)).join('');
    }
    addBtn.style.display = 'block';
  } else {
    packsList.innerHTML = teamPacks.map(pack => renderPackCard(pack, true)).join('');
    addBtn.style.display = 'none';
  }

  // Render Discovery Hub
  discoverList.innerHTML = expertPacks.map(pack => renderPackCard(pack, false)).join('');

  attachCardListeners();
}

function renderPackCard(pack, isSynced) {
  const isExpert = pack.id.startsWith('exp_');
  const isTeam = pack.is_team;

  return `
    <div class="pack-card ${isExpert ? 'expert-card' : ''}" data-id="${pack.id}" style="${isTeam ? 'border-left: 3px solid #f59e0b;' : ''}">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div class="pack-title">
            ${isTeam ? '🔒 ' : ''}${pack.name}
            ${!isTeam && isSynced && !isExpert ? '<span class="cloud-badge">CLOUD</span>' : ''}
            ${isExpert ? '⭐' : ''}
        </div>
        <div style="display: flex; gap: 4px;">
          ${isExpert ? `<button class="clone-btn-inline" data-id="${pack.id}">+ Clone</button>` : ''}
          ${!isExpert ? `<button class="edit-btn-inline" data-id="${pack.id}" title="Edit pack">✏️</button>` : ''}
          ${!isTeam && !isExpert ? `<button class="share-btn-inline" data-id="${pack.id}">Share</button>` : ''}
          ${!isTeam && !isExpert ? `<button class="delete-btn-inline" data-id="${pack.id}" title="Delete pack">🗑️</button>` : ''}
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
      // Inline feedback is good, keeping it
      btn.innerText = 'Copied!';
      setTimeout(() => btn.innerText = 'Share', 2000);
    };
  });

  // Clone Button (Top Level Replacement)
  document.querySelectorAll('.clone-btn-inline').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');

      // Search in both custom and expert packs
      const customPacks = await StorageLocal.getAllPacks();
      const expertPacks = await StorageLocal.getExpertPacks();
      const allAvailable = [...customPacks, ...expertPacks];

      const pack = allAvailable.find(p => p.id === id);
      if (pack) {
        const newPack = {
          ...pack,
          id: Date.now().toString(),
          name: `${pack.name} (Copy)`
        };
        await StorageLocal.savePack(newPack);
        showToast(`Expert "${pack.name}" added to Your Memory`);
        renderPacks();
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
      const customPacks = await StorageLocal.getAllPacks();
      const teamPacks = await StorageLocal.getTeamPacks();
      const pack = [...customPacks, ...teamPacks].find(p => p.id === id);
      if (pack) {
        openPackModal(pack);
      }
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

        // Helper to perform the actual message sending
        const sendInject = () => {
          chrome.tabs.sendMessage(tab.id, { action: "inject", pack: pack }, (response) => {
            if (chrome.runtime.lastError) {
              showToast("Cannot inject on this page.");
            } else {
              showToast(`Injected: ${pack.name}`);
              window.close();
            }
          });
        };

        // Check if script is already there
        chrome.tabs.sendMessage(tab.id, { action: "ping" }, async (ping) => {
          if (chrome.runtime.lastError) {
            // Not initialized, try to force inject
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['storage.js', 'compressor.js', 'scraper.js', 'content.js']
              });
              // Give it a moment to initialize
              setTimeout(sendInject, 100);
            } catch (e) {
              showToast("Cannot inject on this page.");
            }
          } else {
            sendInject();
          }
        });
      }
    };
  });
}

// Popup Header Capture (Bridge)
const popupCaptureBtn = document.getElementById('popup-capture-btn');
if (popupCaptureBtn) {
  popupCaptureBtn.onclick = async () => {
    popupCaptureBtn.innerText = 'Bridging...';

    // Message the content script on the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: "capture" }, async (response) => {
        // Catch "Receiving end does not exist" error
        if (chrome.runtime.lastError) {
          // Try to inject script dynamically if it's missing (fallback)
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['storage.js', 'compressor.js', 'scraper.js', 'content.js']
            });
            // Retry message once
            chrome.tabs.sendMessage(tab.id, { action: "capture" }, async (retryResponse) => {
              handleCaptureResponse(retryResponse);
            });
          } catch (e) {
            showToast("Cannot bridge this page");
            popupCaptureBtn.innerText = 'Bridge';
          }
          return;
        }

        handleCaptureResponse(response);
      });
    } else {
      popupCaptureBtn.innerText = 'Bridge';
    }
  };
}

async function handleCaptureResponse(response) {
  const popupCaptureBtn = document.getElementById('popup-capture-btn');
  if (response && response.captured) {
    const customName = prompt("Name this Context Pack:", response.captured.name);
    if (customName === null) { // User cancelled
      popupCaptureBtn.innerText = 'Bridge';
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
    showToast("No active context to bridge.");
  }
  popupCaptureBtn.innerText = 'Bridge';
}

// Tab Switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    const target = tab.getAttribute('data-tab');
    const indicator = document.getElementById('tab-indicator');

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Move Indicator
    if (target === 'discover') {
      indicator.style.transform = 'translateX(100%)';
    } else {
      indicator.style.transform = 'translateX(0)';
    }

    document.getElementById('tab-memory').style.display = target === 'memory' ? 'block' : 'none';
    document.getElementById('tab-discover').style.display = target === 'discover' ? 'block' : 'none';

    if (target === 'discover') renderPacks();
  };
});

// Redeem Logic
if (redeemBtn) {
  redeemBtn.onclick = async () => {
    const code = prompt('Paste your Context Code:'); // Prompt is okay for input
    if (!code) return;

    // v1.3: Use enhanced decoder
    const decoded = StorageLocal.decodeCode(code);
    if (decoded) {
      await StorageLocal.savePack(decoded);
      showToast(`Imported: ${decoded.name}`);
      renderPacks();
    } else {
      showToast('Invalid Code');
    }
  };
}

// Cloud Teaser & Modal Logic
const cloudTeaserLink = document.getElementById('cloud-teaser-link');
const cloudModal = document.getElementById('cloud-modal');
const closeCloudModal = document.getElementById('close-cloud-modal');
const saveApiBtn = document.getElementById('save-api-config-btn');
const apiUrlInput = document.getElementById('api-url-input');
const apiKeyInput = document.getElementById('api-key-input');

if (cloudTeaserLink) {
  cloudTeaserLink.onclick = (e) => {
    e.preventDefault();
    cloudModal.style.display = 'flex';
    loadApiConfig();
  };
}

if (closeCloudModal) {
  closeCloudModal.onclick = () => {
    cloudModal.style.display = 'none';
  };
}

// Close on outside click
window.onclick = (event) => {
  if (event.target == cloudModal) {
    cloudModal.style.display = 'none';
  }
};

async function loadApiConfig() {
  const config = await StorageLocal.get('api_config') || { url: '', key: '' };
  apiUrlInput.value = config.url;
  apiKeyInput.value = config.key;
}

if (saveApiBtn) {
  saveApiBtn.onclick = async () => {
    const url = apiUrlInput.value.trim();
    const key = apiKeyInput.value.trim();

    if (url && key) {
      await StorageLocal.set('api_config', { url, key });
      showToast('API Configuration Saved!');
      // In a real scenario, we'd verify the connection here
      setTimeout(() => {
        cloudModal.style.display = 'none';
      }, 1000);
    } else {
      showToast('Please enter both URL and Key.');
    }
  };
}

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

  // Show delete button only when editing
  deletePackBtnModal.style.display = pack ? 'block' : 'none';

  packModal.style.display = 'flex';
  packNameInput.focus();
}

closePackModal.onclick = () => {
  packModal.style.display = 'none';
};

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
  a.download = `context-remote-backup.json`;
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
      let importCount = 0;
      for (const p of packs) {
        await StorageLocal.savePack(p);
        importCount++;
      }
      renderPacks();
      showToast(`Imported ${importCount} pack${importCount !== 1 ? 's' : ''} successfully!`);
    } catch (error) {
      showToast('Import failed: Invalid file format');
    }
  };
  reader.readAsText(file);
};

// Initialize
renderPacks();
checkUserStatus();
