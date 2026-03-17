$(document).ready(function () {
    const typeMap = {
        "cnacr": "CNACR",
        "3ydp": "3 Year Development Plan",
        "pd_main": "Program Design",
        "dpir": "Departmental Planned Initiative Report",
        "mar_header": "Monthly Accomplishment Report"
    };

    function loadArchiveData() {
        console.log("Loading archive data..."); // Debug log
        
        $.getJSON('Archive.php', function (data) {
            console.log("Data received:", data); // Debug log
            
            // Check if there's an error
            if (data.error) {
                console.error("Server error:", data.error);
                $('#archivedReportsBody').html(`<tr><td colspan="6">Error: ${data.error}</td></tr>`);
                return;
            }

            // Render Archived Reports
            const reportBody = $('#archivedReportsBody');
            reportBody.empty();

            if (!data.archived_reports || data.archived_reports.length === 0) {
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
                            <td>
                                
                                <i class="fas fa-sync-alt restore-btn" data-id="${report.id}" data-table="${report.source_table}" style="cursor: pointer; color: #28a745;"></i>
                            </td>
                        </tr>
                    `);
                });
            }
        }).fail(function(xhr, status, error) {
            console.error("AJAX Error:", {
                status: status,
                error: error,
                response: xhr.responseText
            });
            $('#archivedReportsBody').html(`<tr><td colspan="6">Error loading data: ${error}</td></tr>`);
        });
    }

    // Restore Button Click Handler
    $(document).on('click', '.restore-btn', function () {
        const id = $(this).data('id');
        const table = $(this).data('table');
        
        if (confirm('Are you sure you want to restore this report?')) {
            console.log("Restoring:", {id: id, table: table}); // Debug log
            
            $.post('Archive.php', { 
                action: 'restore',
                id: id, 
                table: table 
            }, function (response) {
                console.log("Restore response:", response); // Debug log
                
                if (response.success) {
                    alert(response.message || 'Report restored successfully!');
                    loadArchiveData(); // Refresh table
                } else {
                    alert('Failed to restore: ' + (response.message || 'Unknown error'));
                }
            }, 'json').fail(function(xhr, status, error) {
                console.error("Restore error:", {status: status, error: error, response: xhr.responseText});
                alert('Error connecting to server: ' + error);
            });
        }
    });

    // View Report Handler
    $(document).on('click', '.view-icon', function () {
        const reportId = $(this).data('id');
        const tableName = $(this).data('table');
        window.location.href = `view_report.php?id=${reportId}&table=${tableName}`;
    });

    function escapeHtml(unsafe) {
        if (!unsafe) return "N/A";
        return unsafe.toString().replace(/[&<>"']/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            if (m === "'") return '&#039;';
            return m;
        });
    }

    // Initial load
    loadArchiveData();
});