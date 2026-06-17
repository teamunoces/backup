const adminToggle = document.getElementById('admin-toggle');
const menu = document.querySelector('.menu-card');
let isMenuInParent = false;
let injectedStyle = null;
let injectedFontAwesome = null;

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

/* ================= FONT AWESOME INJECTION ================= */
function injectFontAwesome() {
    try {
        if (parent && parent.document) {
            // Check if Font Awesome is already loaded in parent
            const existingFA = parent.document.querySelector('link[href*="font-awesome"], link[href*="fa.min.css"], link[href*="fontawesome"]');
            
            if (!existingFA) {
                console.log('Injecting Font Awesome into parent document');
                injectedFontAwesome = parent.document.createElement('link');
                injectedFontAwesome.rel = 'stylesheet';
                injectedFontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
                parent.document.head.appendChild(injectedFontAwesome);
            } else {
                console.log('Font Awesome already exists in parent');
            }
        }
    } catch (error) {
        console.error('Failed to inject Font Awesome:', error);
    }
}

/* ================= MENU SHOW / HIDE ================= */
function showMenu() {
    if (!menu) return;

    if (!injectedStyle) loadAndInjectCSS();
    
    // CRITICAL: Inject Font Awesome before moving menu to parent
    injectFontAwesome();

    if (!isMenuInParent) {
        parent.document.body.appendChild(menu);
        menu.style.position = 'fixed';
        menu.style.top = '80px';
        menu.style.right = '30px';
        menu.style.zIndex = '999999';
        isMenuInParent = true;
        
        // Force re-render of icons after moving to parent
        setTimeout(() => {
            const icons = menu.querySelectorAll('i');
            icons.forEach(icon => {
                // This forces the browser to re-render the icon
                icon.style.display = 'none';
                icon.offsetHeight; // Force reflow
                icon.style.display = '';
            });
        }, 10);
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
    
    // Optional: Remove Font Awesome when menu hides
    // Uncomment if you want to clean up
    if (injectedFontAwesome && parent?.document) {
  parent.document.head.removeChild(injectedFontAwesome);
        injectedFontAwesome = null;
    }
}

function isMenuOpen() {
    return menu?.classList.contains('show');
}

function isClickInsideMenu(target) {
    return !!(menu && target && menu.contains(target));
}

function isClickOnToggle(target) {
    return !!(adminToggle && target && adminToggle.contains(target));
}

function handleOutsideMenuClick(e) {
    if (!isMenuOpen()) return;
    if (isClickInsideMenu(e.target) || isClickOnToggle(e.target)) return;

    hideMenu();
}

adminToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.contains('show') ? hideMenu() : showMenu();
});

menu?.addEventListener('click', (e) => {
    e.stopPropagation();
});

document.addEventListener('click', handleOutsideMenuClick);

try {
    if (parent?.document && parent.document !== document) {
        parent.document.addEventListener('click', handleOutsideMenuClick);
    }
} catch (error) {
    console.warn('Unable to bind parent outside-click handler', error);
}

/* ================= HEADER UPDATE BASED ON CURRENT PAGE ================= */
function updateHeaderBasedOnPage() {
    const headerTitle = document.querySelector('.header-title');
    const headerIcon = document.querySelector('.dashboard-icon');

    if (!headerTitle || !headerIcon) return;

    // Get the current page from parent, referrer, or current window.
    // The referrer fallback matters when iframe parent access is blocked.
    let currentPath;
    try {
        // Try to get from parent first (if in iframe)
        currentPath = parent?.location?.pathname || window.location.pathname;
    } catch (e) {
        try {
            currentPath = document.referrer ? new URL(document.referrer).pathname : window.location.pathname;
        } catch (referrerError) {
            currentPath = window.location.pathname;
        }
    }

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
        'cnacr_coordinator.php': { title: 'Community Needs Assessment Consolidated Result Review', icon: 'fa-file-contract' },
        'cnacrreview.php': { title: 'Community Needs Assessment Consolidated Report Review', icon: 'fa-file-contract' },
        '3ydpneedfix.html': { title: ' 3 Year Development Plan Needs Fix', icon: 'fa-tools' },
        'pdneedfix.html': { title: 'Program Design Needs Fix', icon: 'fa-tools' },
        'marneedfix.php':{ title: 'Monthly Accomplishment Report Needs Fix', icon: 'fa-tools' },
        'cnacrview.php': { title: 'Community Needs Assessment Consolidated Report View', icon: 'fa-file-contract' },
        '3ydpreport.php': { title: '3 Year Development Plan', icon: 'fa-file-alt' },
        '3ydpreview.php': { title: '3 Year Development Plan Review', icon: 'fa-file-alt' },
        '3ydpview.php': { title: '3 Year Development Plan View', icon: 'fa-file-alt' },
        'programdesign.php': { title: 'Program Design', icon: 'fa-file-alt' },
        'pdview.php': { title: 'Program Design View', icon: 'fa-file-alt' },
        'dpir.php': { title: 'Departmental Planned Initiative Report', icon: 'fa-file-alt' },
        'Departments.html': { title: 'Departments', icon: 'fa-building' },
        'ApprovedReports.php' : { title: 'Approved Report Attachments', icon: 'fa-check-circle' },
        'marview.php': { title: 'Monthly Accomplishment Report', icon: 'fa-file-alt'},
        'marreport.php': {title: 'Monthly Accomplishment Report', icon: 'fa-file-alt'},
        'monitoringreview.php': {title: 'Program Monitoring Form Review', icon: 'fa-file-alt'},
        'evaluationreview.php': {title: 'Evaluation Sheet for Extension Services Review', icon: 'fa-file-alt'},
        'evaluation_sheetview.php': {title: 'Evaluation Sheet for Extension Services', icon: 'fa-file-alt'},
        'reflectionreview.php': {title: 'Reflection Sheet for Extension Services Review', icon: 'fa-file-alt'},
        'coareview.php': {title: 'Certificate of Appearance Review', icon: 'fa-file-alt'},
        'coaneedfix.php': {title: 'Certificate of Appearance Needs Fix', icon: 'fa-file-alt'},
        'coaview.php': {title: 'Certificate of Appearance View', icon: 'fa-file-alt'},
        'reflectionneedfix.php': {title: 'Reflection Paper Needs Fix', icon: 'fa-file-alt'},
        'narrativeview.php': {title: 'Narrative Report Review', icon: 'fa-file-alt'},
        'narrativeneedfix.php': {title: 'Narrative Report Needs Fix', icon: 'fa-file-alt'},
        'narrative_reportview.php': {title: 'Narrative Report View', icon: 'fa-file-alt'},
        'pmfreport.php': {title: 'Program Monitoring Form', icon: 'fa-file-alt'},
        'program_monitoring_formview.php': {title: 'Program Monitoring Form', icon: 'fa-file-alt'},
        'evaluation.php': {title: 'Evaluation Sheet for Extension Services', icon: 'fa-file-alt'},
        'reflection.php': {title: 'Reflection Sheet for Extension Services', icon: 'fa-file-alt'},
        'certificate.php': {title: 'Certificate of Appearance', icon: 'fa-file-alt'},
        'narrative.php': {title: 'Narrative Report', icon: 'fa-file-alt'},
        'reflection_paperview.php': {title: 'Reflection Paper View', icon: 'fa-file-alt'},
        'mar.php': {title: 'Monthly Accomplishment Report Review', icon: 'fa-file-alt'},
        'evaluationneedfix.php': {title: 'Evaluation Sheet for Extension Services Needs Fix', icon: 'fa-file-alt'},





        
    }
    if (!currentPath || currentPath.endsWith('profile.html')) {
        try {
            currentPath = document.referrer ? new URL(document.referrer).pathname : currentPath;
        } catch (e) {
            // Keep the existing path if referrer parsing fails.
        }
    }

    const currentPage = currentPath.split('/').pop();
    const matchingPage = pageMap[currentPage] ? currentPage : Object.keys(pageMap).find(page => page.toLowerCase() === currentPage.toLowerCase());
    
    console.log('Current page:', currentPage); // For debugging

    if (matchingPage) {
        headerTitle.textContent = pageMap[matchingPage].title;
        headerIcon.className = `fas dashboard-icon ${pageMap[matchingPage].icon}`;
    } else {
        // Optional: Set a default title for unknown pages
        headerTitle.textContent = 'DASHBOARD';
        headerIcon.className = 'fas dashboard-icon fa-th-large';
    }
}

// Function to listen for iframe navigation changes
function setupIframeNavigationListener() {
    try {
        // Check if we're in an iframe
        if (window.self !== window.top) {
            // Listen for messages from the parent about iframe navigation
            window.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'iframe-navigation') {
                    // Update header when iframe navigates
                    updateHeaderBasedOnPage();
                }
            });
            
            // Also try to observe iframe src changes if possible
            let lastPath = '';
            const checkForNavigation = setInterval(() => {
                try {
                    const currentPath = parent?.location?.href || window.location.href;
                    if (currentPath !== lastPath) {
                        lastPath = currentPath;
                        updateHeaderBasedOnPage();
                    }
                } catch (e) {
                    // Cross-origin error - clear interval to stop trying
                    clearInterval(checkForNavigation);
                }
            }, 500);
        }
    } catch (e) {
        console.log('Not in iframe or cross-origin restrictions');
    }
}

// Initialize header update on page load and when iframe changes
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderBasedOnPage();
    setupIframeNavigationListener();
});

// Also update when the page becomes visible (user returns to tab)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateHeaderBasedOnPage();
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

    parent.location.href = '/SYSTEM_VERSION_!/coordinator/Profile/logout.php';
});

/* ================= DARK MODE TOGGLE ================= */
const modeToggle = document.getElementById('mode-toggle');

if (modeToggle) {
    modeToggle.addEventListener('change', () => {
        const isEnabled = modeToggle.checked;
        
        parent.postMessage({ type: 'toggle-dark-mode', enabled: isEnabled }, '*');
        
        if (isEnabled) {
            document.documentElement.classList.add('dark-mode');
            document.body.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
            document.body.classList.remove('dark-mode');
        }

        try {
            if (parent?.localStorage) {
                parent.localStorage.setItem('darkMode', isEnabled ? 'enabled' : 'disabled');
            }
        } catch (e) {
            console.warn("LocalStorage access denied", e);
        }
    });
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'apply-dark-mode') {
        const isEnabled = event.data.enabled;
        if (modeToggle) modeToggle.checked = isEnabled;
        
        if (isEnabled) {
            document.documentElement.classList.add('dark-mode');
            document.body.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
            document.body.classList.remove('dark-mode');
        }
    }
});

window.addEventListener('DOMContentLoaded', () => {
    try {
        const savedMode = parent.localStorage.getItem('darkMode');
        if (savedMode === 'enabled') {
            document.documentElement.classList.add('dark-mode');
            document.body.classList.add('dark-mode');
            if (modeToggle) modeToggle.checked = true;
        } else {
            document.documentElement.classList.remove('dark-mode');
            document.body.classList.remove('dark-mode');
        }
    } catch (e) {
        /* Parent storage might be blocked by browser security */
    }
});
