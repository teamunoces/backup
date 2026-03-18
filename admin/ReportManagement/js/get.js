async function loadReports() {
    try {
        const response = await fetch("./php/get.php");
        const data = await response.json();

        // Get all table bodies
        const adminTableBody = document.getElementById("adminTableBody");
        const coordinatorApprovedBody = document.getElementById("coordinatorapprovedTableBody");
        const coordinatorRejectedBody = document.getElementById("coordinatorrejectedTableBody");

        // Clear all tables
        adminTableBody.innerHTML = "";
        coordinatorApprovedBody.innerHTML = "";
        coordinatorRejectedBody.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            adminTableBody.innerHTML = `<tr><td colspan="5">No reports found.</td></tr>`;
            coordinatorApprovedBody.innerHTML = `<tr><td colspan="5">No reports found.</td></tr>`;
            coordinatorRejectedBody.innerHTML = `<tr><td colspan="5">No reports found.</td></tr>`;
            return;
        }

        data.forEach((report, index) => {
            let formattedDate = "N/A";
            if (report.created_at) {
                formattedDate = report.created_at.split(" ")[0];
            }

            // Map table names to display names
            const typeMap = {
                "cnacr": "CNACR",
                "coordinator_cnacr": "Community Needs Assessment Consolidated Report",
                "3ydp": "3 Year Development Plan",
                "pd_main": "Program Design",
                "dpir": "Departmental Planned Initiative Report",
                "mar_header": "Monthly Accomplishment Report"
            };

            const typeName = typeMap[report.source_table] || report.source_table;

            const rowHTML = `
            <tr data-index="${index}" data-id="${report.id}" data-source-table="${report.source_table}">
                <td>${typeName}</td>
                <td>${report.title || 'N/A'}</td>
                <td>${report.department || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td class="actions">
                    <i class="far fa-eye view-icon" data-id="${report.id}"></i>
                    <i class="fas fa-archive archive-icon"></i>
                </td>
            </tr>
            `;

            // Check if report has role information
            const role = report.role || 'admin'; // Default to admin if role not specified

            if (role.toLowerCase() === 'admin') {
                // Admin reports - show all regardless of status
                adminTableBody.innerHTML += rowHTML;
            } 
            else if (role.toLowerCase() === 'coordinator') {
                // Coordinator reports - separate by status (only approved and rejected)
                const status = report.status ? report.status.toLowerCase() : '';
                
                if (status.includes('approve')) {
                    coordinatorApprovedBody.innerHTML += rowHTML;
                }
                else if (status.includes('reject')) {
                    coordinatorRejectedBody.innerHTML += rowHTML;
                }
                // Reports with 'need fix' status are not displayed in any table
            }
        });

        // Attach event listeners after table is rendered
        attachActionEvents(data);

    } catch (error) {
        console.error("Error loading reports:", error);
    }
}

// Function to get view path based on table and role/status
function getViewPath(report) {
    const type = report.source_table.toLowerCase();
    
    // Define view mappings for different tables with your actual paths
    const viewMappings = {
        // Admin table view mappings - Path: /actions/view/
        admin: {
            "cnacr": "actions/view/cnacrview/cnacrview.php",
            "coordinator_cnacr": "actions/view/cnacrview/cnacrview.php",
            "3ydp": "actions/view/3ydpview/view.php",
            "pd_main": "actions/view/pdview/view.php",
            "dpir": "actions/view/dpirview/view.php",
            "mar_header": "actions/view/marview/marview.php",
            "default": "actions/view/defaultview/view.php"
        },
        // Coordinator Approved table view mappings - Path: /actions/coordinator_view/
        coordinatorApproved: {
            "coordinator_cnacr": "actions/coordinator_view/cnacrview/cnacrview.php",
            "3ydp": "actions/coordinator_view/3ydpview/3ydpview.php",
            "pd_main": "actions/coordinator_view/pdview/pdview.php",
            "dpir": "actions/coordinator_view/dpirview/view.php",
            "mar_header": "actions/coordinator_view/marview/marview.php",
            "default": "actions/coordinator_view/defaultview/view.php"
        },
        // Coordinator Rejected table view mappings - Since you don't have a rejected folder,
        // we'll use the coordinator_view for rejected reports as well (or you can create a rejected folder)
        coordinatorRejected: {
            "coordinator_cnacr": "actions/coordinator_view/cnacrview/cnacrview.php",
            "3ydp": "actions/coordinator_view/3ydpview/view.php",
            "pd_main": "actions/coordinator_view/pdview/pdview.php",
            "dpir": "actions/coordinator_view/dpirview/view.php",
            "mar_header": "actions/coordinator_view/marview/marview.php",
            "default": "actions/coordinator_view/defaultview/view.php"
        }
    };

    // Determine which table the row belongs to by checking the parent tbody's ID
    let tableKey = 'admin'; // default
    
    // Find the row by looking for an element with data-id attribute matching the report ID
    const row = document.querySelector(`tr[data-id="${report.id}"]`);
    
    if (row) {
        // Get the parent tbody (since IDs are on tbody elements, not tables)
        const parentTbody = row.closest('tbody');
        if (parentTbody) {
            const tbodyId = parentTbody.id;
            
            console.log("Found tbody with ID:", tbodyId); // Debug log
            
            // Check based on the actual tbody IDs from your HTML
            if (tbodyId === 'coordinatorapprovedTableBody') {
                tableKey = 'coordinatorApproved';
            } 
            else if (tbodyId === 'coordinatorrejectedTableBody') {
                tableKey = 'coordinatorRejected';
            }
            else if (tbodyId === 'adminTableBody') {
                tableKey = 'admin';
            }
        }
    }

    // If we still couldn't determine the table, fall back to using role and status
    if (tableKey === 'admin' && report.role && report.role.toLowerCase() === 'coordinator') {
        const status = report.status ? report.status.toLowerCase() : '';
        
        if (status.includes('approve')) {
            tableKey = 'coordinatorApproved';
        } else if (status.includes('reject')) {
            tableKey = 'coordinatorRejected';
        }
    }

    // Get the appropriate mapping
    const mapping = viewMappings[tableKey] || viewMappings.admin;
    
    // Return the view path based on source table type, or default if not found
    const viewPath = mapping[type] || mapping.default;
    
    // Get the base URL to help with debugging
    const baseUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    
    console.log("=== VIEW PATH DEBUG ===");
    console.log("Report ID:", report.id);
    console.log("Type:", type);
    console.log("Table Key:", tableKey);
    console.log("Selected Path:", viewPath);
    console.log("Current page URL:", window.location.href);
    console.log("Base path:", baseUrl);
    console.log("Full URL that will be requested:", baseUrl + viewPath + "?id=" + report.id);
    console.log("======================");
    
    return viewPath;
}
//________________________ eye icon redirection to the view webpages
function attachActionEvents(data) {
    // Archive report
    document.querySelectorAll(".archive-icon").forEach((icon) => {
        icon.addEventListener("click", async () => {
            const row = icon.closest("tr");
            const index = row.getAttribute("data-index");
            const report = data[index];

            if (!report) return;

            if (!confirm("Archive this report?")) return;

            try {
                const response = await fetch("./php/archive.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: report.id,
                        table: report.source_table
                    })
                });

                const result = await response.json();

                if (result.success) {
                    alert("Report archived successfully.");
                    // reload table
                    loadReports();
                } else {
                    alert("Archive failed.");
                }

            } catch (error) {
                console.error("Archive error:", error);
            }
        });
    });

    // View Icon with table-specific mapping
    document.querySelectorAll(".view-icon").forEach((icon) => {
        icon.addEventListener("click", () => {
            const reportId = icon.getAttribute("data-id");
            
            // Find the correct report using ID
            const report = data.find(r => r.id == reportId);

            if (!report) return;

            // Get the appropriate view path based on which table the row is in
            const viewPath = getViewPath(report);
            
            // Redirect to the view page with report ID
            window.location.href = `${viewPath}?id=${reportId}`;
        });
    });

    // Print
    document.querySelectorAll(".print-icon").forEach((icon) => {
        icon.addEventListener("click", () => {
            const reportId = icon.closest('tr').getAttribute('data-id');
            const report = data.find(r => r.id == reportId);
            
            if (report) {
                printReport(report);
            }
        });
    });

    // Download PDF
    document.querySelectorAll(".download-icon").forEach((icon) => {
        icon.addEventListener("click", () => {
            const reportId = icon.closest('tr').getAttribute('data-id');
            const report = data.find(r => r.id == reportId);
            
            if (report) {
                downloadPDF(report);
            }
        });
    });
}

function printReport(report) {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
            <head><title>Print Report</title></head>
            <body>
                <h2>${report.title || 'Report'}</h2>
                <p><strong>Source Table:</strong> ${report.source_table}</p>
                <p><strong>Department:</strong> ${report.department}</p>
                <p><strong>Date:</strong> ${report.created_at ? report.created_at.split(" ")[0] : 'N/A'}</p>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function downloadPDF(report) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(report.title || 'Report', 20, 20);

    doc.setFontSize(12);
    doc.text(`Source Table: ${report.source_table}`, 20, 40);
    doc.text(`Department: ${report.department || 'N/A'}`, 20, 50);
    doc.text(`Date: ${report.created_at ? report.created_at.split(" ")[0] : 'N/A'}`, 20, 60);

    doc.save(`${report.title || 'report'}.pdf`);
}

document.addEventListener("DOMContentLoaded", loadReports);