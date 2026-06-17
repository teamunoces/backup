/* ================= DASHBOARD DARK MODE ================= */

function applyDarkMode(enable) {
    document.body.classList.toggle('dark-mode', enable);
    document.documentElement.style.backgroundColor = enable ? '#1a1a1a' : '';
    document.body.style.backgroundColor = enable ? '#1a1a1a' : '';
    document.querySelectorAll('.admin-comment-label, .admin-comment label[for="admincomment"]').forEach((label) => {
        label.style.setProperty('color', enable ? '#ffffff' : '', 'important');
    });

    const headerFrame = document.getElementById('headerFrame');
    const sidebarFrame = document.getElementById('sidebarFrame');
    const frameBackground = enable ? '#1a1a1a' : '';

    [headerFrame, sidebarFrame].forEach((frame) => {
        if (frame) {
            frame.style.backgroundColor = frameBackground;
        }
    });

    if (headerFrame?.contentDocument?.body) {
        headerFrame.contentDocument.body.classList.toggle('dark-mode', enable);
        headerFrame.contentDocument.documentElement.style.backgroundColor = frameBackground;
        headerFrame.contentDocument.body.style.backgroundColor = frameBackground;

        const antiFouc = headerFrame.contentDocument.getElementById('anti-fouc');

        if (antiFouc) {
            antiFouc.textContent = enable
                ? 'html, body { margin: 0; min-height: 100%; background-color: #1a1a1a !important; }'
                : 'html, body { margin: 0; min-height: 100%; background-color: #ffffff; }';
        }
    }

    if (sidebarFrame?.contentDocument?.body) {
        sidebarFrame.contentDocument.body.classList.toggle('dark-mode', enable);
        sidebarFrame.contentDocument.documentElement.style.backgroundColor = frameBackground;
        sidebarFrame.contentDocument.body.style.backgroundColor = frameBackground;
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
