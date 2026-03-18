const adminToggle = document.getElementById('admin-toggle');
const menu = document.querySelector('.menu-card');
let isMenuInParent = false;
let injectedStyle = null;

/* ================= MENU CSS INJECTION ================= */
async function loadAndInjectCSS() {
    try {
        const response = await fetch('menuCSS.css');
        const cssText = await response.text();

        if (parent && parent.document) {
            injectedStyle = parent.document.createElement('style');
            injectedStyle.textContent = cssText;
            parent.document.head.appendChild(injectedStyle);
        }
    } catch (error) {
        console.error('Failed to load CSS:', error);
    }
}

/* ================= MENU SHOW / HIDE ================= */
function showMenu() {
    if (!menu) return;

    if (!injectedStyle) loadAndInjectCSS();

    if (!isMenuInParent) {
        parent.document.body.appendChild(menu);
        menu.style.position = 'fixed';
        menu.style.top = '80px';
        menu.style.right = '30px';
        menu.style.zIndex = '999999';
        isMenuInParent = true;
    }

    menu.classList.add('show');
}

function hideMenu() {
    if (!menu) return;

    menu.classList.remove('show');

    if (isMenuInParent) {
        document.querySelector('.header-right')?.appendChild(menu);
        menu.style.position = '';
        menu.style.top = '';
        menu.style.right = '';
        menu.style.zIndex = '';
        isMenuInParent = false;
    }

    if (injectedStyle && parent?.document) {
        parent.document.head.removeChild(injectedStyle);
        injectedStyle = null;
    }
}

adminToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.contains('show') ? hideMenu() : showMenu();
});

/* ================= HEADER UPDATE BASED ON CURRENT PAGE ================= */
document.addEventListener('DOMContentLoaded', () => {
    const headerTitle = document.querySelector('.header-title');
    const headerIcon = document.querySelector('.dashboard-icon');

    if (!headerTitle || !headerIcon) return;

    const currentPath = parent?.location?.pathname || window.location.pathname;

    const pageMap = {
        'Dashboard.html': { title: 'DASHBOARD', icon: 'fa-th-large' },
        'Reports.html': { title: 'REPORT', icon: 'fa-file-alt' },
        'ReportManagement.html': { title: 'REPORT MANAGEMENT', icon: 'fa-cogs' },
        'AccountManagement.html': { title: 'ACCOUNT MANAGEMENT', icon: 'fa-users' },
        'Approval.html': { title: 'APPROVAL', icon: 'fa-check-circle' },
        'Archive.html': { title: 'ARCHIVE', icon: 'fa-archive' },
        'Pending.html': { title: 'PENDING AND NEED FIXES', icon: 'fa-hourglass-half' },
        'SubmittedMonthly.html': { title: 'SUBMITTED MONTHLY', icon: 'fa-calendar-alt' },
        'cnacr.php': { title: 'Community Needs Assessment Consolidated Result Report', icon: 'fa-file-contract' },
        'cnacr.html': { title: 'Community Needs Assessment Consolidated Result', icon: 'fa-file-contract' },
        'cnacrreview.php': { title: 'Community Needs Assessment Consolidated Report Review', icon: 'fa-file-contract' },
        'needfix.html': { title: 'Needs Fix', icon: 'fa-tools' },
        'cnacrview.php': { title: 'Community Needs Assessment Consolidated Report View', icon: 'fa-file-contract' },
        '3ydpreport.php': { title: '3 Year Development Plan', icon: 'fa-file-alt' },
        '3ydpreview.php': { title: '3 Year Development Plan Review', icon: 'fa-file-alt' },
        '3ydpview.php': { title: '3 Year Development Plan View', icon: 'fa-file-alt' },
        'programdesign.php': { title: 'Program Design', icon: 'fa-file-alt' },
        'pdview.php': { title: 'Program Design View', icon: 'fa-file-alt' },
        'dpir.php': { title: 'Departmental Planned Initiative Report', icon: 'fa-file-alt' },
        'Departments.html': { title: 'Departments', icon: 'fa-building' },
        'ApprovedReports.php' : { title: 'Approved Reports', icon: 'fa-check-circle' },


    };

    const currentPage = currentPath.split('/').pop();

    if (pageMap[currentPage]) {
        headerTitle.textContent = pageMap[currentPage].title;
        headerIcon.className = `fas dashboard-icon ${pageMap[currentPage].icon}`;
    }
});

/* ================= FRONT-END LOGOUT ================= */
const logoutBtn = document.getElementById('logoutBtn');

logoutBtn?.addEventListener('click', () => {
    if (!confirm('Are you sure you want to log out?')) return;

    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });

    parent.location.href = '/login/login.html';
});

/* ================= DARK MODE TOGGLE ================= */
const modeToggle = document.getElementById('mode-toggle');

if (modeToggle) {
    // 1. Send the message when the switch is clicked
    modeToggle.addEventListener('change', () => {
        const isEnabled = modeToggle.checked;
        
        // Notify the parent window
        parent.postMessage({ type: 'toggle-dark-mode', enabled: isEnabled }, '*');
        
        // Apply locally to the header immediately for instant feedback
        if (isEnabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Save preference safely
        try {
            if (parent?.localStorage) {
                parent.localStorage.setItem('darkMode', isEnabled ? 'enabled' : 'disabled');
            }
        } catch (e) {
            console.warn("LocalStorage access denied", e);
        }
    });
}

// 2. Listen for messages FROM the parent 
// (Useful if the parent changes mode from elsewhere or on initial load)
window.addEventListener('message', (event) => {
    if (event.data.type === 'apply-dark-mode') {
        const isEnabled = event.data.enabled;
        if (modeToggle) modeToggle.checked = isEnabled;
        
        if (isEnabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
});

// 3. Initial Check: Sync state with parent's saved preference on load
window.addEventListener('DOMContentLoaded', () => {
    try {
        const savedMode = parent.localStorage.getItem('darkMode');
        if (savedMode === 'enabled') {
            document.body.classList.add('dark-mode');
            if (modeToggle) modeToggle.checked = true;
        }
    } catch (e) {
        /* Parent storage might be blocked by browser security */
    }
});

