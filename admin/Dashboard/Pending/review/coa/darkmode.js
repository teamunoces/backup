/* ================= DASHBOARD DARK MODE ================= */
function syncFrameDarkMode(frame, enable) {
    if (!frame?.contentDocument?.body) return;

    const frameDocument = frame.contentDocument;
    frameDocument.documentElement.classList.toggle('dark-mode', enable);
    frameDocument.body.classList.toggle('dark-mode', enable);
}

function applyDarkMode(enable) {
    // Apply to main dashboard
    document.documentElement.classList.toggle('dark-mode', enable);
    document.body.classList.toggle('dark-mode', enable);

    // Apply to header iframe
    const headerFrame = document.getElementById('headerFrame');
    if (headerFrame?.contentDocument?.body) {
        syncFrameDarkMode(headerFrame, enable);
        const modeToggle = headerFrame.contentDocument.getElementById('mode-toggle');
        if (modeToggle) modeToggle.checked = enable;
    }

    // Apply to sidebar iframe
    const sidebarFrame = document.getElementById('sidebarFrame');
    syncFrameDarkMode(sidebarFrame, enable);
}

// On page load: read saved preference
const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
applyDarkMode(darkModeEnabled);

document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('darkMode') === 'enabled';
    const headerFrame = document.getElementById('headerFrame');
    const sidebarFrame = document.getElementById('sidebarFrame');

    headerFrame?.addEventListener('load', () => applyDarkMode(localStorage.getItem('darkMode') === 'enabled'));
    sidebarFrame?.addEventListener('load', () => applyDarkMode(localStorage.getItem('darkMode') === 'enabled'));
    applyDarkMode(saved);
});

// Listen for toggle messages from header iframe
window.addEventListener('message', (e) => {
    if (e.data?.type === 'toggle-dark-mode') {
        const enabled = e.data.enabled;
        applyDarkMode(enabled);
        localStorage.setItem('darkMode', enabled ? 'enabled' : 'disabled');
    }
});
