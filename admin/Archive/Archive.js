$(document).ready(function () {
    const typeMap = {
        "cnacr": "CNACR",
        "3ydp": "3 Year Development Plan",
        "pd_main": "Program Design",
        "dpir": "Departmental Planned Initiative Report"
    };

    function loadArchiveData() {
        $.getJSON('Archive.php', function (data) {
            // Render Inactive Accounts
            const userBody = $('#inactiveAccountsBody');
            userBody.empty();

            if (data.inactive_users.length === 0) {
                userBody.append('<tr><td colspan="6">No inactive accounts found.</td></tr>');
            } else {
                data.inactive_users.forEach(user => {
                    userBody.append(`
                        <tr>
                            <td>User Account</td>
                            <td>${escapeHtml(user.username)}</td>
                            <td>${escapeHtml(user.department)}</td>
                            <td>${escapeHtml(user.created_at)}</td>
                            <td><span class="badge badge-inactive">Inactive</span></td>
                            <td><i class="fas fa-sync-alt restore-btn" data-id="${user.id}" data-type="user"></i></td>
                        </tr>
                    `);
                });
            }

            // Render Archived Reports
            const reportBody = $('#archivedReportsBody');
            reportBody.empty();

            if (data.archived_reports.length === 0) {
                reportBody.append('<tr><td colspan="6">No archived reports found.</td></tr>');
            } else {
                data.archived_reports.forEach(report => {
                    const typeName = typeMap[report.source_table] || report.source_table;
                    reportBody.append(`
                        <tr>
                            <td>${escapeHtml(typeName.toUpperCase())}</td>
                            <td>${escapeHtml(report.title)}</td>
                            <td>${escapeHtml(report.department)}</td>
                            <td>${escapeHtml(report.created_at)}</td>
                            <td><span class="badge badge-archived">Archived</span></td>
                            <td>
                                <i class="far fa-eye view-icon" data-id="${report.id}" data-table="${report.source_table}"></i>
                                <i class="fas fa-sync-alt restore-btn" data-id="${report.id}" data-table="${report.source_table}" data-type="report"></i>
                            </td>
                        </tr>
                    `);
                });
            }
        }).fail(function() {
            console.error("Could not fetch data from Archive.php");
        });
    }

    // Unified Restore Button Click Handler
    $(document).on('click', '.restore-btn', function () {
        const id = $(this).data('id');
        const type = $(this).data('type');
        const table = $(this).data('table');
        
        let confirmMessage = type === 'user' 
            ? 'Are you sure you want to restore this user account?' 
            : 'Are you sure you want to restore this report?';
        
        if (confirm(confirmMessage)) {
            $.post('Archive.php', { 
                action: 'restore',
                id: id, 
                type: type,
                table: table 
            }, function (response) {
                if (response.success) {
                    alert(response.message || 'Item restored successfully!');
                    loadArchiveData(); // Refresh table
                } else {
                    alert('Failed to restore: ' + (response.message || 'Unknown error'));
                }
            }, 'json').fail(function(xhr) {
                alert('Error connecting to server: ' + xhr.statusText);
            });
        }
    });

    // View Report Handler
    $(document).on('click', '.view-icon', function () {
        const reportId = $(this).data('id');
        const tableName = $(this).data('table');
        
        // You can implement view functionality here
        // For example, redirect to a view page or open a modal
        window.location.href = `view_report.php?id=${reportId}&table=${tableName}`;
    });

    function escapeHtml(unsafe) {
        if (!unsafe) return "N/A";
        return unsafe.toString().replace(/[&<>"']/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m]));
    }

    // Initial load
    loadArchiveData();
});