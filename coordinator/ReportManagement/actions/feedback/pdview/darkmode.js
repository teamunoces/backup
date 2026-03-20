/* ================= DASHBOARD DARK MODE ================= */

function applyDarkMode(enable) {
    document.body.classList.toggle('dark-mode', enable);

    const headerFrame = document.getElementById('headerFrame');
    const sidebarFrame = document.getElementById('sidebarFrame');

    if (headerFrame?.contentDocument?.body) {
        headerFrame.contentDocument.body.classList.toggle('dark-mode', enable);
    }

    if (sidebarFrame?.contentDocument?.body) {
        sidebarFrame.contentDocument.body.classList.toggle('dark-mode', enable);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem('darkMode') === 'enabled';

    const headerFrame = document.getElementById('headerFrame');
    const sidebarFrame = document.getElementById('sidebarFrame');

    headerFrame?.addEventListener("load", () => applyDarkMode(saved));
    sidebarFrame?.addEventListener("load", () => applyDarkMode(saved));

    applyDarkMode(saved);
});

window.addEventListener('message', (e) => {
    if (e.data?.type === 'toggle-dark-mode') {
        applyDarkMode(e.data.enabled);
        localStorage.setItem('darkMode', e.data.enabled ? 'enabled' : 'disabled');
    }
});