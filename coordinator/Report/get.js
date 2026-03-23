// ======================== MOCK DATA FOR NEED FIX REPORTS ========================
const needFixReports = [
    {
        id: 1,
        type: "3 Year Development Plan",
        title: "Annual Strategic Alignment Review 2025-2027",
        department: "Office of the Planning Director",
        date: "2025-02-10",
        status: "need_fix"
    },
    {
        id: 2,
        type: "Community Needs Assessment Consolidated Report",
        title: "Barangay Health & Livelihood Assessment 2024",
        department: "Community Development Unit",
        date: "2025-01-28",
        status: "need_fix"
    },
    {
        id: 3,
        type: "Monthly Accomplishment Report",
        title: "January 2025 Accomplishments - incomplete metrics",
        department: "Extension Services",
        date: "2025-02-05",
        status: "need_fix"
    },
    {
        id: 4,
        type: "Program Design",
        title: "Digital Literacy for Youth (Revision Required)",
        department: "Information Technology Center",
        date: "2025-02-01",
        status: "need_fix"
    },
    {
        id: 5,
        type: "Departmental Planned Initiative Report",
        title: "Research Dissemination Plan Q1 2025",
        department: "Research & Development",
        date: "2025-01-20",
        status: "need_fix"
    },
    {
        id: 6,
        type: "Monthly Accomplishment Report",
        title: "December 2024 - missing annexures",
        department: "Student Affairs",
        date: "2025-01-12",
        status: "need_fix"
    },
    {
        id: 7,
        type: "3 Year Development Plan",
        title: "Infrastructure Masterplan 2025-2027",
        department: "Engineering & Maintenance",
        date: "2025-02-14",
        status: "need_fix"
    },
    {
        id: 8,
        type: "Program Design",
        title: "Entrepreneurship Bootcamp Design Doc",
        department: "Business Incubation Unit",
        date: "2025-01-30",
        status: "need_fix"
    }
];

// Helper: format date to readable
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

// Helper: escape HTML to prevent XSS
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Render table based on selected type filter
function renderNeedFixTable() {
    const filterValue = document.getElementById('reportTypeFilter').value;
    let filtered = [...needFixReports];
    
    if (filterValue !== 'all') {
        filtered = filtered.filter(report => report.type === filterValue);
    }

    const tbody = document.getElementById('needfixTableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="no-data"><i class="fas fa-info-circle"></i> No "Need Fix" reports for this category</td></tr>`;
        return;
    }

    let html = '';
    for (let report of filtered) {
        html += `
            <tr>
                <td><span style="background: var(--badge-bg); padding: 4px 12px; border-radius: 30px; font-size: 0.75rem; font-weight:600;">${escapeHtml(report.type)}</span></td>
                <td><strong>${escapeHtml(report.title)}</strong></td>
                <td>${escapeHtml(report.department)}</td>
                <td>${formatDate(report.date)}</td>
                <td class="action-buttons">
                    <button class="btn-view" data-id="${report.id}" data-action="view"><i class="fas fa-eye"></i> View</button>
                    <button class="btn-fix" data-id="${report.id}" data-action="fix"><i class="fas fa-edit"></i> Resolve</button>
                </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;

    // Attach event listeners to buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            const report = needFixReports.find(r => r.id === id);
            if (report) {
                alert(`📄 VIEW REPORT\n\nType: ${report.type}\nTitle: ${report.title}\nDepartment: ${report.department}\nDate: ${report.date}\n\nAction: Redirect to detailed revision page.`);
                // Uncomment for actual navigation:
                // window.location.href = `./viewReport.php?id=${report.id}`;
            }
        });
    });

    document.querySelectorAll('.btn-fix').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            const report = needFixReports.find(r => r.id === id);
            if (report) {
                alert(`🔧 FIX / REVISE REPORT\n\n"${report.title}"\n\nRedirecting to revision editor (simulated).`);
                // Uncomment for actual navigation:
                // window.location.href = `./editReport.php?id=${report.id}&type=${encodeURIComponent(report.type)}`;
            }
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
    renderNeedFixTable();
    
    const filterSelect = document.getElementById('reportTypeFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', renderNeedFixTable);
    }
    
    // Initial frame background sync
    setTimeout(syncFrameBackgrounds, 100);
});