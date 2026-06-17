let needFixReports = [];

function normalizeStatus(status) {
    return (status || '').toString().trim().toLowerCase().replace(/[_-]+/g, ' ');
}

// Helper: format date to readable
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Helper: escape HTML to prevent XSS
function escapeHtml(value) {
    const str = value === null || value === undefined || value === '' ? 'N/A' : value.toString();
    return str.replace(/[&<>"']/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        if (m === "'") return '&#039;';
        return m;
    });
}

function getReportType(report) {
    return report.type || 'N/A';
}

async function loadNeedFixReports() {
    const tbody = document.getElementById('needfixTableBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" class="no-data"><i class="fas fa-spinner fa-spin"></i> Loading reports...</td></tr>`;
    }

    try {
        const response = await fetch('get.php', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || 'Failed to load reports');
        }

        needFixReports = Array.isArray(data)
            ? data.filter(report => normalizeStatus(report.status) === 'need fix')
            : [];

        renderNeedFixTable();
    } catch (error) {
        console.error('Could not fetch need fix reports:', error);
        needFixReports = [];

        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="5" class="no-data"><i class="fas fa-exclamation-circle"></i> Error loading reports</td></tr>`;
        }
    }
}

// Render table based on selected type filter
function renderNeedFixTable() {
    const filterSelect = document.getElementById('reportTypeFilter');
    const filterValue = filterSelect ? filterSelect.value : 'all';
    let filtered = [...needFixReports];

    if (filterValue !== 'all') {
        filtered = filtered.filter(report => getReportType(report) === filterValue);
    }

    const tbody = document.getElementById('needfixTableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="no-data"><i class="fas fa-info-circle"></i> No "Need Fix" reports for this category</td></tr>`;
        return;
    }

    let html = '';
    for (let report of filtered) {
        const type = getReportType(report);
        const date = report.created_at || report.date || '';

        html += `
            <tr>
                <td><span style="background: var(--badge-bg); padding: 4px 12px; border-radius: 30px; font-size: 0.75rem; font-weight:600;">${escapeHtml(type)}</span></td>
                <td><strong>${escapeHtml(report.title)}</strong></td>
                <td>${escapeHtml(report.department)}</td>
                <td>${escapeHtml(formatDate(date))}</td>
                <td class="action-buttons">
                    <button class="btn-view" data-id="${escapeHtml(report.id)}" data-table="${escapeHtml(report.source_table)}" data-action="view"><i class="fas fa-eye"></i> View</button>
                    <button class="btn-fix" data-id="${escapeHtml(report.id)}" data-table="${escapeHtml(report.source_table)}" data-action="fix"><i class="fas fa-edit"></i> Resolve</button>
                </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;

    // Attach event listeners to buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const table = btn.getAttribute('data-table');
            window.location.href = `./viewReport.php?id=${encodeURIComponent(id)}&table=${encodeURIComponent(table)}`;
        });
    });

    document.querySelectorAll('.btn-fix').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const table = btn.getAttribute('data-table');
            window.location.href = `./editReport.php?id=${encodeURIComponent(id)}&table=${encodeURIComponent(table)}`;
        });
    });
}

// ======================== DARK MODE SYNC ========================
function syncFrameBackgrounds() {
    const headerFrame = document.getElementById('headerFrame');
    const sidebarFrame = document.getElementById('sidebarFrame');
    const bgColor = getComputedStyle(document.body).getPropertyValue('--frame-bg').trim();
    if (headerFrame) headerFrame.style.backgroundColor = bgColor;
    if (sidebarFrame) sidebarFrame.style.backgroundColor = bgColor;
}

// Listen for dark mode toggle messages from iframe
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'toggleDarkMode') {
        if (event.data.dark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        setTimeout(syncFrameBackgrounds, 20);
    }
});

// Also sync via storage event (if dark mode is stored in localStorage)
window.addEventListener('storage', (e) => {
    if (e.key === 'darkMode') {
        const isDark = e.newValue === 'true';
        if (isDark) document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
        setTimeout(syncFrameBackgrounds, 20);
    }
});

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    loadNeedFixReports();

    const filterSelect = document.getElementById('reportTypeFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', renderNeedFixTable);
    }

    // Initial frame background sync
    setTimeout(syncFrameBackgrounds, 100);
});
