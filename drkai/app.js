// Firefox Container Manager Application
// ======================================

// State Management
const STATE_KEY = 'firefox-container-state';
const ENVS_KEY = 'firefox-container-envs';
const VISIBLE_ENVS_KEY = 'firefox-container-visible-envs';

// Default environment URLs
const DEFAULT_ENVS = {
  local: 'http://localhost:3000/drkai',
  dev: 'https://app-dev.preventivehealth.ai/drkai',
  prod: 'https://app.preventivehealth.ai/drkai'
};

// Default boxes (existing setup)
const DEFAULT_BOXES = [
  { id: '1', env: 'local', containerName: 'Local:Admin', displayName: 'Admin', color: '#8b5cf6' },
  { id: '2', env: 'local', containerName: 'Local:Coordinator', displayName: 'Coordinator', color: '#10b981' },
  { id: '3', env: 'local', containerName: 'Local:Doctor', displayName: 'Doctor', color: '#3b82f6' },
  { id: '4', env: 'dev', containerName: 'Dev:Admin', displayName: 'Admin', color: '#8b5cf6' },
  { id: '5', env: 'dev', containerName: 'Dev:Coordinator', displayName: 'Coordinator', color: '#10b981' },
  { id: '6', env: 'dev', containerName: 'Dev:Doctor', displayName: 'Doctor', color: '#3b82f6' },
  { id: '7', env: 'prod', containerName: 'Prod:Admin', displayName: 'Admin', color: '#8b5cf6' },
  { id: '8', env: 'prod', containerName: 'Prod:Coordinator', displayName: 'Coordinator', color: '#10b981' },
  { id: '9', env: 'prod', containerName: 'Prod:Doctor', displayName: 'Doctor', color: '#3b82f6' }
];

// Predefined color options
const COLOR_OPTIONS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#ec4899'  // Pink
];

// Application State
let state = {
  boxes: [],
  envs: { ...DEFAULT_ENVS },
  visibleEnvs: { prod: true, dev: true, local: false },
  editingId: null
};

// ======================================
// Browser Detection
// ======================================

function isFirefox() {
  return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}

function checkBrowser() {
  const setupNotice = document.getElementById('setup-notice');
  const mainContent = document.getElementById('main-content');

  if (!isFirefox()) {
    setupNotice.classList.remove('hidden');
    mainContent.classList.add('hidden');
  } else {
    setupNotice.classList.add('hidden');
    mainContent.classList.remove('hidden');
  }
}

// ======================================
// LocalStorage Operations
// ======================================

function loadState() {
  try {
    const savedBoxes = localStorage.getItem(STATE_KEY);
    const savedEnvs = localStorage.getItem(ENVS_KEY);
    const savedVisibleEnvs = localStorage.getItem(VISIBLE_ENVS_KEY);

    if (savedBoxes) {
      state.boxes = JSON.parse(savedBoxes);
    } else {
      // First time - use defaults
      state.boxes = [...DEFAULT_BOXES];
      saveState();
    }

    if (savedEnvs) {
      state.envs = JSON.parse(savedEnvs);
    } else {
      state.envs = { ...DEFAULT_ENVS };
      saveEnvs();
    }

    if (savedVisibleEnvs) {
      state.visibleEnvs = JSON.parse(savedVisibleEnvs);
    } else {
      state.visibleEnvs = { prod: true, dev: true, local: false };
      saveVisibleEnvs();
    }
  } catch (error) {
    console.error('Error loading state:', error);
    state.boxes = [...DEFAULT_BOXES];
    state.envs = { ...DEFAULT_ENVS };
    state.visibleEnvs = { prod: true, dev: true, local: false };
  }
}

function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state.boxes));
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

function saveEnvs() {
  try {
    localStorage.setItem(ENVS_KEY, JSON.stringify(state.envs));
  } catch (error) {
    console.error('Error saving environments:', error);
  }
}

function saveVisibleEnvs() {
  try {
    localStorage.setItem(VISIBLE_ENVS_KEY, JSON.stringify(state.visibleEnvs));
  } catch (error) {
    console.error('Error saving visible environments:', error);
  }
}

// ======================================
// Box CRUD Operations
// ======================================

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function addBox(box) {
  const newBox = {
    id: generateId(),
    env: box.env,
    containerName: box.containerName,
    displayName: box.displayName,
    color: box.color
  };
  state.boxes.push(newBox);
  saveState();
  renderBoxes();
}

function updateBox(id, updates) {
  const index = state.boxes.findIndex(b => b.id === id);
  if (index !== -1) {
    state.boxes[index] = { ...state.boxes[index], ...updates };
    saveState();
    renderBoxes();
  }
}

function deleteBox(id) {
  state.boxes = state.boxes.filter(b => b.id !== id);
  saveState();
  renderBoxes();
}

function getBox(id) {
  return state.boxes.find(b => b.id === id);
}

// ======================================
// UI Rendering
// ======================================

function renderBoxes() {
  const container = document.getElementById('boxes-container');
  container.innerHTML = '';

  // Group boxes by environment and sort alphabetically by display name
  const grouped = {
    prod: state.boxes.filter(b => b.env === 'prod').sort((a, b) => a.displayName.localeCompare(b.displayName)),
    dev: state.boxes.filter(b => b.env === 'dev').sort((a, b) => a.displayName.localeCompare(b.displayName)),
    local: state.boxes.filter(b => b.env === 'local').sort((a, b) => a.displayName.localeCompare(b.displayName))
  };

  // Render each environment section (prod, dev, local order)
  Object.entries(grouped).forEach(([env, boxes]) => {
    if (boxes.length === 0) return; // Hide empty sections
    if (!state.visibleEnvs[env]) return; // Hide if environment is toggled off

    const section = document.createElement('div');
    section.className = 'section';
    section.textContent = capitalize(env);
    container.appendChild(section);

    const grid = document.createElement('div');
    grid.className = 'grid';

    boxes.forEach(box => {
      const tile = createTile(box, env);
      grid.appendChild(tile);
    });

    container.appendChild(grid);
  });
}

function createTile(box, env) {
  const a = document.createElement('a');
  a.className = `tile env-${env}`;
  a.href = `ext+container:name=${encodeURIComponent(box.containerName)}&url=${encodeURIComponent(state.envs[env])}`;
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('data-env', env.toUpperCase());
  a.setAttribute('data-color', box.color);
  a.style.borderLeftColor = box.color;

  // Actions menu
  const actions = document.createElement('div');
  actions.className = 'tile-actions';

  const menuBtn = document.createElement('button');
  menuBtn.className = 'tile-menu-btn';
  menuBtn.textContent = '⋯';
  menuBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTileMenu(box.id);
  };

  const dropdown = document.createElement('div');
  dropdown.className = 'tile-dropdown';
  dropdown.id = `menu-${box.id}`;

  const editItem = document.createElement('button');
  editItem.className = 'tile-dropdown-item';
  editItem.textContent = 'Edit';
  editItem.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeTileMenu(box.id);
    openEditModal(box.id);
  };

  const deleteItem = document.createElement('button');
  deleteItem.className = 'tile-dropdown-item danger';
  deleteItem.textContent = 'Delete';
  deleteItem.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeTileMenu(box.id);
    if (confirm('Are you sure you want to delete this box?')) {
      deleteBox(box.id);
    }
  };

  dropdown.appendChild(editItem);
  dropdown.appendChild(deleteItem);
  actions.appendChild(menuBtn);
  actions.appendChild(dropdown);

  const envLabel = document.createElement('span');
  envLabel.className = `env-label ${env}`;
  envLabel.textContent = env.toUpperCase();

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = box.displayName;

  const small = document.createElement('small');
  small.textContent = state.envs[env];

  a.appendChild(actions);
  a.appendChild(envLabel);
  a.appendChild(title);
  a.appendChild(small);

  return a;
}

function renderEnvConfig() {
  Object.entries(state.envs).forEach(([env, url]) => {
    const input = document.getElementById(`env-${env}`);
    if (input) {
      input.value = url;
    }
  });
}

// ======================================
// Tile Menu Management
// ======================================

function toggleTileMenu(id) {
  const menu = document.getElementById(`menu-${id}`);
  if (!menu) return;

  // Close all other menus
  document.querySelectorAll('.tile-dropdown.open').forEach(m => {
    if (m.id !== `menu-${id}`) {
      m.classList.remove('open');
    }
  });

  menu.classList.toggle('open');
}

function closeTileMenu(id) {
  const menu = document.getElementById(`menu-${id}`);
  if (menu) {
    menu.classList.remove('open');
  }
}

function closeAllTileMenus() {
  document.querySelectorAll('.tile-dropdown.open').forEach(m => {
    m.classList.remove('open');
  });
}

// ======================================
// Modal Management
// ======================================

function openAddModal() {
  state.editingId = null;
  const modal = document.getElementById('box-modal');
  const title = document.getElementById('modal-title');
  const deleteBtn = document.getElementById('delete-btn');

  title.textContent = 'Add New Box';
  deleteBtn.classList.add('hidden');

  // Reset form
  document.getElementById('box-env').value = 'prod';
  document.getElementById('box-container-name').value = '';
  document.getElementById('box-display-name').value = '';

  // Select first color by default
  selectColor(COLOR_OPTIONS[0]);

  modal.classList.add('open');
}

function openEditModal(id) {
  state.editingId = id;
  const box = getBox(id);
  if (!box) return;

  const modal = document.getElementById('box-modal');
  const title = document.getElementById('modal-title');
  const deleteBtn = document.getElementById('delete-btn');

  title.textContent = 'Edit Box';
  deleteBtn.classList.remove('hidden');

  // Populate form
  document.getElementById('box-env').value = box.env;
  document.getElementById('box-container-name').value = box.containerName;
  document.getElementById('box-display-name').value = box.displayName;

  selectColor(box.color);

  modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('box-modal');
  modal.classList.remove('open');
  state.editingId = null;
}

function selectColor(color) {
  const options = document.querySelectorAll('.color-option');
  options.forEach(opt => {
    if (opt.dataset.color === color) {
      opt.classList.add('selected');
    } else {
      opt.classList.remove('selected');
    }
  });
}

function getSelectedColor() {
  const selected = document.querySelector('.color-option.selected');
  return selected ? selected.dataset.color : COLOR_OPTIONS[0];
}

// ======================================
// Form Handlers
// ======================================

function handleSaveBox(e) {
  e.preventDefault();

  const env = document.getElementById('box-env').value;
  const containerName = document.getElementById('box-container-name').value.trim();
  const displayName = document.getElementById('box-display-name').value.trim();
  const color = getSelectedColor();

  if (!containerName || !displayName) {
    alert('Please fill in all fields');
    return;
  }

  const boxData = {
    env,
    containerName,
    displayName,
    color
  };

  if (state.editingId) {
    updateBox(state.editingId, boxData);
  } else {
    addBox(boxData);
  }

  closeModal();
}

function handleDeleteBox() {
  if (!state.editingId) return;

  if (confirm('Are you sure you want to delete this box?')) {
    deleteBox(state.editingId);
    closeModal();
  }
}

function handleSaveEnv(env) {
  const input = document.getElementById(`env-${env}`);
  const url = input.value.trim();

  if (!url) {
    alert('URL cannot be empty');
    return;
  }

  state.envs[env] = url;
  saveEnvs();
  renderBoxes();

  // Show feedback
  const btn = input.nextElementSibling;
  const originalText = btn.textContent;
  btn.textContent = 'Saved!';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;
  }, 1500);
}

// ======================================
// Instructions & Config Toggle
// ======================================

function toggleInstructions() {
  const content = document.getElementById('instructions-content');
  const toggle = document.getElementById('instructions-toggle');

  content.classList.toggle('open');
  toggle.classList.toggle('open');
}

function toggleEnvConfig() {
  const content = document.getElementById('env-config-content');
  const toggle = document.getElementById('env-config-toggle');

  content.classList.toggle('open');
  toggle.classList.toggle('open');
}

function setAsHomepage() {
  const currentUrl = window.location.href;

  try {
    // Try the Firefox-specific method
    if (typeof window.home !== 'undefined') {
      window.home();
    } else {
      // For modern Firefox, we need to guide the user
      alert(
        'To set this as your homepage:\n\n' +
        '1. Click the menu button (☰) in the top-right\n' +
        '2. Click "Settings" or "Preferences"\n' +
        '3. In the "Home" section, click "Custom URLs..."\n' +
        '4. Paste this URL:\n' +
        currentUrl + '\n\n' +
        'The URL has been copied to your clipboard!'
      );

      // Try to copy to clipboard
      navigator.clipboard.writeText(currentUrl).catch(() => {
        console.log('Could not copy to clipboard');
      });
    }
  } catch (e) {
    alert(
      'To set this as your homepage:\n\n' +
      '1. Go to Firefox Settings > Home\n' +
      '2. Set "Custom URLs" to:\n' +
      currentUrl
    );
  }
}

// ======================================
// Environment Filtering
// ======================================

function toggleEnvVisibility(env) {
  state.visibleEnvs[env] = !state.visibleEnvs[env];
  saveVisibleEnvs();
  updateFilterBadges();
  renderBoxes();
}

function updateFilterBadges() {
  ['prod', 'dev', 'local'].forEach(env => {
    const badge = document.getElementById(`filter-${env}`);
    if (badge) {
      if (state.visibleEnvs[env]) {
        badge.classList.add('active');
      } else {
        badge.classList.remove('active');
      }
    }
  });
}

// ======================================
// Utility Functions
// ======================================

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ======================================
// Initialization
// ======================================

function init() {
  // Check browser
  checkBrowser();

  // Load state
  loadState();

  // Render initial UI
  renderBoxes();
  renderEnvConfig();
  updateFilterBadges();

  // Render color picker
  const colorPicker = document.getElementById('color-picker');
  COLOR_OPTIONS.forEach(color => {
    const div = document.createElement('div');
    div.className = 'color-option';
    div.style.backgroundColor = color;
    div.dataset.color = color;
    div.onclick = () => selectColor(color);
    colorPicker.appendChild(div);
  });

  // Event listeners
  document.getElementById('add-box-btn').addEventListener('click', openAddModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('box-form').addEventListener('submit', handleSaveBox);
  document.getElementById('delete-btn').addEventListener('click', handleDeleteBox);
  document.getElementById('instructions-header').addEventListener('click', toggleInstructions);
  document.getElementById('env-config-header').addEventListener('click', toggleEnvConfig);
  document.getElementById('set-homepage-btn').addEventListener('click', setAsHomepage);

  // Close modal on overlay click
  document.getElementById('box-modal').addEventListener('click', (e) => {
    if (e.target.id === 'box-modal') {
      closeModal();
    }
  });

  // Environment save buttons
  ['local', 'dev', 'prod'].forEach(env => {
    const input = document.getElementById(`env-${env}`);
    if (input && input.nextElementSibling && input.nextElementSibling.tagName === 'BUTTON') {
      input.nextElementSibling.addEventListener('click', () => handleSaveEnv(env));
    }
  });

  // Environment filter badges
  ['prod', 'dev', 'local'].forEach(env => {
    const badge = document.getElementById(`filter-${env}`);
    if (badge) {
      badge.addEventListener('click', () => toggleEnvVisibility(env));
    }
  });

  // Reset buttons
  const resetBoxesBtn = document.getElementById('reset-boxes-btn');
  const resetUrlsBtn = document.getElementById('reset-urls-btn');
  const resetVisibilityBtn = document.getElementById('reset-visibility-btn');
  const resetAllBtn = document.getElementById('reset-all-btn');

  if (resetBoxesBtn) resetBoxesBtn.addEventListener('click', resetBoxes);
  if (resetUrlsBtn) resetUrlsBtn.addEventListener('click', resetURLs);
  if (resetVisibilityBtn) resetVisibilityBtn.addEventListener('click', resetVisibility);
  if (resetAllBtn) resetAllBtn.addEventListener('click', resetAll);

  // Close tile menus when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.tile-actions')) {
      closeAllTileMenus();
    }
  });

  // Fallback to force new tab even if target is ignored by the handler
  document.addEventListener('click', function(e) {
    const a = e.target.closest('a.tile');
    if (!a) return;
    // If it's a normal left-click without modifiers, open via window.open and prevent default
    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      const isMenuClick = e.target.closest('.tile-actions');
      if (isMenuClick) return; // Don't open link if clicking menu
      e.preventDefault();
      window.open(a.href, '_blank', 'noopener');
    }
  });
}

// ======================================
// Reset Functions
// ======================================

function resetBoxes() {
  if (!confirm('Are you sure you want to reset all boxes to defaults? This will delete any custom boxes you\'ve created.')) {
    return;
  }

  state.boxes = JSON.parse(JSON.stringify(DEFAULT_BOXES));
  saveState();
  window.location.reload();
}

function resetURLs() {
  if (!confirm('Are you sure you want to reset all environment URLs to defaults?')) {
    return;
  }

  state.envs = { ...DEFAULT_ENVS };
  saveEnvs();
  window.location.reload();
}

function resetVisibility() {
  if (!confirm('Are you sure you want to reset environment filter visibility to defaults?')) {
    return;
  }

  state.visibleEnvs = { prod: true, dev: true, local: false };
  saveVisibleEnvs();
  window.location.reload();
}

function resetAll() {
  if (!confirm('Are you sure you want to reset EVERYTHING to defaults? This will delete all your custom boxes, URLs, and settings. This cannot be undone!')) {
    return;
  }

  // Reset all state
  state.boxes = JSON.parse(JSON.stringify(DEFAULT_BOXES));
  state.envs = { ...DEFAULT_ENVS };
  state.visibleEnvs = { prod: true, dev: true, local: false };

  // Save all to localStorage
  saveState();
  saveEnvs();
  saveVisibleEnvs();

  // Reload page to show reset state
  window.location.reload();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
