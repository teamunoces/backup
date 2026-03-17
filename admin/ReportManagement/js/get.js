async function loadReports() {
    try {
        const response = await fetch("./php/get.php");
        const data = await response.json();

        const approvedTable = document.getElementById("adminTableBody");
        const rejectedTable = document.getElementById("rejectedTableBody");

        approvedTable.innerHTML = "";
        rejectedTable.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            approvedTable.innerHTML = `<tr><td colspan="5">No reports found.</td></tr>`;
            rejectedTable.innerHTML = `<tr><td colspan="5">No reports found.</td></tr>`;
            return;
        }

        data.forEach((report, index) => {

            let formattedDate = "N/A";
            if (report.created_at) {
                formattedDate = report.created_at.split(" ")[0];
            }

           const typeMap = {
                "cnacr": "CNACR",
                "3ydp": "3 Year Development Plan",
                "pd_main": "Program Design",
                "dpir": "Departmental Planned Initiative Report"
            };

            const typeName = typeMap[report.source_table] || report.source_table;

            const rowHTML = `
            <tr data-index="${index}">
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

              if (report.status && report.status.toLowerCase().includes("approve")) {
                  approvedTable.innerHTML += rowHTML;
              }

              if (report.status && report.status.toLowerCase().includes("reject")) {
                  rejectedTable.innerHTML += rowHTML;
              }
        });

        // Attach event listeners after table is rendered
        attachActionEvents(data);

    } catch (error) {
        console.error("Error loading reports:", error);
    }
}

           //________________________ eye icon redirection to the view webpages

        function attachActionEvents(data) {

            // Archive report---------------------------------------------------------------------------------
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

        //View Icon   -------------------------------------------------------------------------     

        document.querySelectorAll(".view-icon").forEach((icon) => {

            icon.addEventListener("click", () => {

                const reportId = icon.getAttribute("data-id");

                // Find the correct report using ID
                const report = data.find(r => r.id == reportId);

                if (!report) return;

                const type = report.source_table.toLowerCase();

                let viewPath = "";

                switch(type) {

                    case "cnacr":
                        viewPath = "./actions/view/cnacrview/cnacrview.php";
                        break;

                    case "3ydp":
                        viewPath = "./actions/view/3ydpview/view.php";
                        break;

                    case "pd_main":
                        viewPath = "./actions/view/pdview/view.php";
                        break;

                    default:
                        viewPath = "./actions/view/dpirview/view.php";
                }

                window.location.href = `${viewPath}?id=${reportId}`;

            });

        });



  // Print
    // Print Function (Silent Load)
      document.querySelectorAll(".print-icon").forEach((icon, i) => {
          icon.addEventListener("click", () => {
              const report = data[i];
              const printUrl = `./actions/view/view.php?id=${report.id}&action=print`;

              // Create a hidden iframe
              let printFrame = document.getElementById("printFrame");
              if (!printFrame) {
                  printFrame = document.createElement("iframe");
                  printFrame.id = "printFrame";
                  printFrame.style.display = "none";
                  document.body.appendChild(printFrame);
              }

              printFrame.src = printUrl;

              // Trigger print when the PHP content is loaded
              printFrame.onload = function() {
                  printFrame.contentWindow.focus();
                  printFrame.contentWindow.print();
              };
          });
      });

      // Download PDF
      // Download PDF (Background Trigger)
      document.querySelectorAll(".download-icon").forEach((icon, i) => {
          icon.addEventListener("click", () => {
              const report = data[i];
              const downloadUrl = `./actions/Print_Download/cnacrprint.php?id=${report.id}&action=download`;

              const link = document.createElement("a");
              link.href = downloadUrl;
              link.download = ""; // This hints to the browser to download
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
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