function applyDarkMode(enable) {
    // Toggle dark mode on main document
    document.body.classList.toggle('dark-mode', enable);

    // Toggle dark mode for iframes if accessible
    const frames = ['headerFrame', 'sidebarFrame'];
    frames.forEach(id => {
        const frame = document.getElementById(id);
        if (!frame) return;

        // Wait until iframe content is ready
        if (frame.contentDocument?.body) {
            frame.contentDocument.body.classList.toggle('dark-mode', enable);
        } else {
            frame.addEventListener('load', () => {
                if (frame.contentDocument?.body) {
                    frame.contentDocument.body.classList.toggle('dark-mode', enable);
                }
            });
        }
    });
}

// Load saved dark mode preference
document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem('darkMode') === 'enabled';
    applyDarkMode(saved);
});

// Listen for toggle events
window.addEventListener('message', (e) => {
    if (e.data?.type === 'toggle-dark-mode') {
        applyDarkMode(e.data.enabled);
        localStorage.setItem('darkMode', e.data.enabled ? 'enabled' : 'disabled');
    }
});