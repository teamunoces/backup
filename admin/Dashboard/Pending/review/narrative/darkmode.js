/* ================= DASHBOARD DARK MODE ================= */
function applyDarkMode(enable) {
    // Apply to main dashboard
    document.body.classList.toggle('dark-mode', enable);

    // Apply to header iframe
    const headerFrame = document.getElementById('headerFrame');
    if (headerFrame?.contentDocument?.body) {
        headerFrame.contentDocument.body.classList.toggle('dark-mode', enable);
        const modeToggle = headerFrame.contentDocument.getElementById('mode-toggle');
        if (modeToggle) modeToggle.checked = enable;
    }

    // Apply to sidebar iframe
    const sidebarFrame = document.getElementById('sidebarFrame');
    if (sidebarFrame?.contentDocument?.body) {
        sidebarFrame.contentDocument.body.classList.toggle('dark-mode', enable);
    }
}

// On page load: read saved preference
const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
applyDarkMode(darkModeEnabled);

// Listen for toggle messages from header iframe
window.addEventListener('message', (e) => {
    if (e.data?.type === 'toggle-dark-mode') {
        const enabled = e.data.enabled;
        applyDarkMode(enabled);
        localStorage.setItem('darkMode', enabled ? 'enabled' : 'disabled');
    }
});
