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

// Search functionality
let allPacks = [];
let searchDebounceTimer = null;

const searchInput = document.getElementById('search-input');
const searchResultsCount = document.getElementById('search-results-count');

function debounce(func, delay) {
  return function (...args) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

function performSearch(searchTerm) {
  const term = searchTerm.toLowerCase().trim();

  if (!term) {
    // Show all packs
    document.querySelectorAll('.pack-card').forEach(card => {
      card.classList.remove('search-hidden', 'search-highlight');
    });
    searchResultsCount.textContent = '';
    return;
  }

  let visibleCount = 0;
  document.querySelectorAll('.pack-card').forEach(card => {
    const packId = card.getAttribute('data-id');
    const pack = allPacks.find(p => p.id === packId);

    if (pack) {
      const tags = pack.tags ? pack.tags.join(' ') : '';
      const searchableText = `${pack.name} ${pack.desc} ${pack.data || ''} ${tags}`.toLowerCase();
      const matches = searchableText.includes(term);

      if (matches) {
        card.classList.remove('search-hidden');
        card.classList.add('search-highlight');
        visibleCount++;
      } else {
        card.classList.add('search-hidden');
        card.classList.remove('search-highlight');
      }
    }
  });

  searchResultsCount.textContent = visibleCount === 0
    ? 'No results found'
    : `${visibleCount} result${visibleCount !== 1 ? 's' : ''} found`;
}

if (searchInput) {
  searchInput.addEventListener('input', debounce((e) => {
    performSearch(e.target.value);
  }, 300));
}

async function renderPacks() {
  allPacks = await StorageLocal.getAllPacks();

  if (allPacks.length === 0) {
    packsList.innerHTML = '<div class="loading">No custom packs yet. Add one!</div>';
  } else {
    packsList.innerHTML = allPacks.map(pack => renderPackCard(pack)).join('');
  }

  attachCardListeners();

  // Reset search when packs are re-rendered
  if (searchInput && searchInput.value) {
    performSearch(searchInput.value);
  }
}

function renderPackCard(pack) {
  const isExpert = pack.id.startsWith('exp_') || pack.id.startsWith('welcome_');
  const tagsHtml = pack.tags && pack.tags.length > 0
    ? `<div class="pack-tags">${pack.tags.map(tag => `<span class="pack-tag">${tag}</span>`).join('')}</div>`
    : '';

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
      ${tagsHtml}
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

    const packData = {
      name: customName || response.captured.name,
      desc: `Bridged from ${response.captured.source}`,
      data: response.captured.data,
      tags: [] // Could add auto-tagging based on source
    };

    await StorageLocal.savePack(packData);

    // Track analytics
    if (window.BridgeAnalytics) {
      await window.BridgeAnalytics.trackContextSaved(packData);
    }

    showToast(`Bridged: ${customName || response.captured.name}`);
    renderPacks();
    renderUsageStats();
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

// Tagging System
const packTagsInput = document.getElementById('pack-tags-input');
const selectedTagsContainer = document.getElementById('selected-tags');
const tagSuggestionsContainer = document.getElementById('tag-suggestions');

const PREDEFINED_TAGS = [
  'React', 'Python', 'JavaScript', 'TypeScript', 'Work', 'Personal',
  'Tutorial', 'Bug Fix', 'Feature', 'Documentation', 'API', 'Database',
  'Frontend', 'Backend', 'DevOps', 'Testing', 'Security', 'Performance'
];

let selectedTags = [];

function renderSelectedTags() {
  if (selectedTags.length === 0) {
    selectedTagsContainer.innerHTML = '';
    return;
  }

  selectedTagsContainer.innerHTML = selectedTags.map(tag => `
    <div class="tag-chip">
      ${tag}
      <span class="remove-tag" data-tag="${tag}">×</span>
    </div>
  `).join('');

  // Attach remove listeners
  selectedTagsContainer.querySelectorAll('.remove-tag').forEach(btn => {
    btn.onclick = () => {
      const tag = btn.getAttribute('data-tag');
      selectedTags = selectedTags.filter(t => t !== tag);
      renderSelectedTags();
      updateTagSuggestions(packTagsInput.value);
    };
  });
}

function updateTagSuggestions(input) {
  const term = input.toLowerCase().trim();

  if (!term) {
    tagSuggestionsContainer.classList.remove('show');
    return;
  }

  const suggestions = PREDEFINED_TAGS.filter(tag =>
    tag.toLowerCase().includes(term) && !selectedTags.includes(tag)
  );

  if (suggestions.length === 0) {
    tagSuggestionsContainer.classList.remove('show');
    return;
  }

  tagSuggestionsContainer.innerHTML = suggestions.map(tag => `
    <div class="tag-suggestion-item" data-tag="${tag}">${tag}</div>
  `).join('');

  tagSuggestionsContainer.classList.add('show');

  // Attach click listeners
  tagSuggestionsContainer.querySelectorAll('.tag-suggestion-item').forEach(item => {
    item.onclick = () => {
      const tag = item.getAttribute('data-tag');
      addTag(tag);
    };
  });
}

function addTag(tag) {
  if (!selectedTags.includes(tag)) {
    selectedTags.push(tag);
    renderSelectedTags();
  }
  packTagsInput.value = '';
  tagSuggestionsContainer.classList.remove('show');
  packTagsInput.focus();
}

if (packTagsInput) {
  packTagsInput.addEventListener('input', (e) => {
    updateTagSuggestions(e.target.value);
  });

  packTagsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && packTagsInput.value.trim()) {
      e.preventDefault();
      const customTag = packTagsInput.value.trim();
      addTag(customTag);
    }
  });

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!tagSuggestionsContainer.contains(e.target) && e.target !== packTagsInput) {
      tagSuggestionsContainer.classList.remove('show');
    }
  });
}

let editingPackId = null;

function openPackModal(pack = null) {
  editingPackId = pack ? pack.id : null;
  packModalTitle.innerText = pack ? 'Edit Context Pack' : 'New Context Pack';
  packNameInput.value = pack ? pack.name : '';
  packDescInput.value = pack ? pack.desc : '';
  packDataInput.value = pack ? (pack.data || '') : '';
  selectedTags = pack && pack.tags ? pack.tags : [];
  renderSelectedTags();
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
    const packData = { name, desc, data, tags: selectedTags };
    if (editingPackId) packData.id = editingPackId;
    await StorageLocal.savePack(packData);

    // Track analytics for new packs
    if (!editingPackId && window.BridgeAnalytics) {
      await window.BridgeAnalytics.trackContextSaved(packData);
    }

    packModal.style.display = 'none';
    selectedTags = [];
    renderPacks();
    renderUsageStats();
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

// Usage Stats Display
async function renderUsageStats() {
  const statsContainer = document.getElementById('usage-stats');
  if (!statsContainer || !window.BridgeAnalytics) return;

  try {
    const summary = await window.BridgeAnalytics.getUsageSummary();

    let html = '<div class="stats-grid">';
    html += `
      <div class="stat-item">
        <span class="stat-value">${summary.totalContexts}</span>
        <span class="stat-label">Total Saved</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${summary.thisMonth}</span>
        <span class="stat-label">This Month</span>
      </div>
    `;
    html += '</div>';

    if (summary.mostUsedTags.length > 0) {
      html += '<div class="stats-tags">';
      html += '<div class="stats-tags-title">Top Tags</div>';
      html += '<div class="stats-tags-list">';
      summary.mostUsedTags.forEach(({ tag, count }) => {
        html += `<span class="stat-tag">${tag} (${count})</span>`;
      });
      html += '</div></div>';
    }

    statsContainer.innerHTML = html;
  } catch (error) {
    console.error('Failed to render stats:', error);
    statsContainer.innerHTML = '<div class="stats-loading">Stats unavailable</div>';
  }
}

// Render stats on load
renderUsageStats();
