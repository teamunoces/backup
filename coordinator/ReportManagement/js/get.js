// Store reports separately for each section
let approvedReports = [];
let needFixReports = [];
let rejectedReports = [];

// Add these variables at the top with other global variables
let currentUploadReportId = null;
let currentUploadTable = null;
let currentExistingFiles = []; // Track existing files
const MAX_FILES = 4; // Maximum number of files allowed

async function loadReports() {
    try {
        
        const response = await fetch("/coordinator/ReportManagement/php/get.php");
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            displayNoReportsMessage();
            return;
        }

        const typeNameMap = {
            "coordinator_cnacr": "Community Needs Assessment Consolidated Report",
            "3ydp": "3 Year Development Plan",
            "pd_main": "Program Design",
            "dpir": "Departmental Planned Initiative Report",
            "mar_header": "Monthly Accomplishment Report"
        };

        // Clear previous data
        approvedReports = [];
        needFixReports = [];
        rejectedReports = [];

        // Categorize reports by status
        data.forEach((report, index) => {
            const status = (report.status || "").toLowerCase().trim();
            const reportWithMeta = {
                ...report,
                displayType: typeNameMap[report.source_table] || report.source_table,
                index: index
            };

            if (status === "approve" || status === "approved") {
                approvedReports.push(reportWithMeta);
            } else if (status === "need fix") {
                needFixReports.push(reportWithMeta);
            } else if (status === "reject" || status === "rejected") {
                rejectedReports.push(reportWithMeta);
            }
        });

        // Initialize filter event listeners
        initFilterListeners();

        // Render all tables with current filter values
        renderApprovedTable();
        renderNeedFixTable();
        renderRejectedTable();

    } catch (error) {
        console.error("Error loading reports:", error);
    }
}

// Display no reports message in all tables
function displayNoReportsMessage() {
    const approvedTable = document.getElementById("approvedTableBody");
    const needfixTable = document.getElementById("needfixTableBody");
    const rejectedTable = document.getElementById("rejectedTableBody");
    
    const noDataRow = `<tr><td colspan="5" style="text-align:center;">No reports found.</td></tr>`;
    if (approvedTable) approvedTable.innerHTML = noDataRow;
    if (needfixTable) needfixTable.innerHTML = noDataRow;
    if (rejectedTable) rejectedTable.innerHTML = noDataRow;
}

// Render Approved table with its own filter
function renderApprovedTable() {
    const tableBody = document.getElementById("approvedTableBody");
    if (!tableBody) return;
    
    const filterSelect = document.querySelector('.section-green .filter-row select');
    const selectedType = filterSelect ? filterSelect.value : 'All type';
    
    tableBody.innerHTML = "";
    
    // Filter reports based on selected type
    let filteredReports = approvedReports;
    if (selectedType !== 'All type') {
        filteredReports = approvedReports.filter(report => report.displayType === selectedType);
    }
    
    if (filteredReports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No approved reports found.</td></tr>`;
        return;
    }
    
    // Build HTML for filtered reports
    let html = "";
    filteredReports.forEach(report => {
        const formattedDate = report.created_at?.split(" ")[0] || "N/A";
        
        html += `
            <tr data-report-id="${report.id}" data-table="${report.source_table}">
                <td>${report.displayType}</td>
                <td>${report.title || 'N/A'}</td>
                <td>${report.department || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td class="actions">
                    <i class="far fa-eye view-icon" data-id="${report.id}" data-table="${report.source_table}"></i>
                    <i class="fas fa-cloud-upload-alt upload-icon" data-id="${report.id}" data-table="${report.source_table}" title="Upload/Manage PDFs"></i>
                    <i class="fas fa-archive archive-icon" data-id="${report.id}" data-table="${report.source_table}"></i>
                </td>
            </tr>`;
    });
    
    tableBody.innerHTML = html;
    
    // Attach events only to this section's icons
    attachSectionEvents(tableBody);
}

// Render Need Fix table with its own filter
function renderNeedFixTable() {
    const tableBody = document.getElementById("needfixTableBody");
    if (!tableBody) return;
    
    const filterSelect = document.querySelector('.section-Orange .filter-row select');
    const selectedType = filterSelect ? filterSelect.value : 'All type';
    
    tableBody.innerHTML = "";
    
    // Filter reports based on selected type
    let filteredReports = needFixReports;
    if (selectedType !== 'All type') {
        filteredReports = needFixReports.filter(report => report.displayType === selectedType);
    }
    
    if (filteredReports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No reports needing fix found.</td></tr>`;
        return;
    }
    
    // Build HTML for filtered reports
    let html = "";
    filteredReports.forEach(report => {
        const formattedDate = report.created_at?.split(" ")[0] || "N/A";
        
        html += `
            <tr data-report-id="${report.id}" data-table="${report.source_table}">
                <td>${report.displayType}</td>
                <td>${report.title || 'N/A'}</td>
                <td>${report.department || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td class="actions">
                    <i class="far fa-eye view-icon" data-id="${report.id}" data-table="${report.source_table}"></i>
                    <i class="fas fa-archive archive-icon" data-id="${report.id}" data-table="${report.source_table}"></i>
                </td>
            </tr>`;
    });
    
    tableBody.innerHTML = html;
    
    // Attach events only to this section's icons
    attachSectionEvents(tableBody);
}

// Render Rejected table with its own filter
function renderRejectedTable() {
    const tableBody = document.getElementById("rejectedTableBody");
    if (!tableBody) return;
    
    const filterSelect = document.querySelector('.section-red .filter-row select');
    const selectedType = filterSelect ? filterSelect.value : 'All type';
    
    tableBody.innerHTML = "";
    
    // Filter reports based on selected type
    let filteredReports = rejectedReports;
    if (selectedType !== 'All type') {
        filteredReports = rejectedReports.filter(report => report.displayType === selectedType);
    }
    
    if (filteredReports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No rejected reports found.</td></tr>`;
        return;
    }
    
    // Build HTML for filtered reports
    let html = "";
    filteredReports.forEach(report => {
        const formattedDate = report.created_at?.split(" ")[0] || "N/A";
        
        html += `
            <tr data-report-id="${report.id}" data-table="${report.source_table}">
                <td>${report.displayType}</td>
                <td>${report.title || 'N/A'}</td>
                <td>${report.department || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td class="actions">
                    <i class="far fa-eye view-icon" data-id="${report.id}" data-table="${report.source_table}"></i>
                    <i class="fas fa-archive archive-icon" data-id="${report.id}" data-table="${report.source_table}"></i>
                </td>
            </tr>`;
    });
    
    tableBody.innerHTML = html;
    
    // Attach events only to this section's icons
    attachSectionEvents(tableBody);
}

// Attach events to icons within a specific section
function attachSectionEvents(container) {
    if (!container) return;
    
    // Archive icon events
    container.querySelectorAll(".archive-icon").forEach((icon) => {
        icon.addEventListener("click", async (e) => {
            e.stopPropagation();
            const reportId = icon.getAttribute("data-id");
            const reportTable = icon.getAttribute("data-table");

            if (!confirm("Archive this report?")) return;

            try {
                const response = await fetch("/coordinator/ReportManagement/php/archive.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: reportId, table: reportTable })
                });
                const result = await response.json();

                if (result.success) {
                    alert("Report archived successfully.");
                    loadReports(); // Reload all reports
                } else {
                    alert("Archive failed.");
                }

            } catch (error) {
                console.error("Archive error:", error);
            }
        });
    });

    // Upload icon events (only in approved section)
    container.querySelectorAll(".upload-icon").forEach((icon) => {
        icon.addEventListener("click", (e) => {
            e.stopPropagation();
            const reportId = icon.getAttribute("data-id");
            const reportTable = icon.getAttribute("data-table");
            
            // Set current report info for upload
            currentUploadReportId = reportId;
            currentUploadTable = reportTable;
            currentExistingFiles = []; // Reset existing files array
            
            // Show upload modal
            showUploadModal(reportId, reportTable);
        });
    });

    // View icon events
    container.querySelectorAll(".view-icon").forEach((icon) => {
        icon.addEventListener("click", (e) => {
            e.stopPropagation();
            const reportId = icon.getAttribute("data-id");
            const reportTable = icon.getAttribute("data-table");

            // Find the report in the appropriate array
            let report = null;
            
            if (container.id === "approvedTableBody") {
                report = approvedReports.find(r => r.id == reportId && r.source_table === reportTable);
            } else if (container.id === "needfixTableBody") {
                report = needFixReports.find(r => r.id == reportId && r.source_table === reportTable);
            } else if (container.id === "rejectedTableBody") {
                report = rejectedReports.find(r => r.id == reportId && r.source_table === reportTable);
            }
            
            if (!report) return;

            const status = (report.status || "").toLowerCase().trim();

            if (status === "rejected" || status === "reject") {
                // Show feedback modal for rejected reports
                showFeedbackModal(reportId, reportTable, report);
                return;
            }

            // Existing view logic for approved and need fix
            let viewMap;

            if (status === "approve" || status === "approved") {
                // DIFFERENT PATHS for approved
                viewMap = {
                    "coordinator_cnacr": "./actions/view/cnacrview/cnacrview.php",
                    "3ydp": "./actions/view/3ydpview/3ydpview.php",
                    "pd_main": "./actions/view/pdview/pdview.php",
                    "mar_header": "./actions/view/marview/marview.php",
                    "dpir": "./actions/view/dpirview/view.php"
                };
            } else {
                // NORMAL VIEW (need fix)
                viewMap = {
                    "coordinator_cnacr": "./actions/feedback/cnacrview/cnacrview.php",
                    "3ydp": "./actions/feedback/3ydpview/view.php",
                    "pd_main": "./actions/feedback/pdview/view.php",
                    "mar_header": "./actions/feedback/marview/marview.php",
                    "dpir": "./actions/fix/dpirfix/view.php"
                };
            }

            const viewPath = viewMap[report.source_table];
            if (viewPath) {
                window.location.href = `${viewPath}?id=${reportId}`;
            } else {
                console.error("No view path defined for table: " + report.source_table);
            }
        });
    });
}

// Show feedback modal for rejected reports
function showFeedbackModal(reportId, reportTable, report) {
    // Create modal if it doesn't exist
    let feedbackModal = document.getElementById("feedbackModal");
    
    if (!feedbackModal) {
        feedbackModal = document.createElement("div");
        feedbackModal.id = "feedbackModal";
        feedbackModal.className = "modal";
        feedbackModal.innerHTML = `
            <div class="modal-content feedback-modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-comment"></i> Feedback for Rejected Report</h2>
                    <span class="close" onclick="closeFeedbackModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="report-info-feedback">
                        <p><strong>Report Type:</strong> <span id="feedbackReportType"></span></p>
                        <p><strong>Title:</strong> <span id="feedbackReportTitle"></span></p>
                        <p><strong>Department:</strong> <span id="feedbackReportDepartment"></span></p>
                    </div>
                    <div class="feedback-section">
                        <h3><i class="fas fa-file-alt"></i> Feedback Details</h3>
                        <div id="feedbackContent" class="feedback-content">
                            <p class="loading-feedback"><i class="fas fa-spinner fa-spin"></i> Loading feedback...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(feedbackModal);
        
        // Add CSS for feedback modal
        const style = document.createElement("style");
        style.textContent = `
            .feedback-modal-content {
                max-width: 600px;
            }
            
            .report-info-feedback {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .report-info-feedback p {
                margin: 8px 0;
                font-size: 14px;
            }
            
            .report-info-feedback strong {
                color: #495057;
                width: 120px;
                display: inline-block;
            }
            
            .feedback-section {
                background: #fff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 20px;
            }
            
            .feedback-section h3 {
                color: #dc3545;
                margin-top: 0;
                margin-bottom: 15px;
                font-size: 16px;
                border-bottom: 1px solid #ffcdd2;
                padding-bottom: 10px;
            }
            
            .feedback-content {
                max-height: 300px;
                overflow-y: auto;
                padding: 15px;
                background: #fff5f5;
                border-radius: 6px;
                border-left: 4px solid #dc3545;
            }
            
            .feedback-content p {
                margin: 10px 0;
                line-height: 1.6;
                color: #333;
            }
            
            .feedback-content .feedback-label {
                color: #dc3545;
                font-weight: bold;
                margin-right: 10px;
            }
            
            .feedback-content .loading-feedback {
                color: #666;
                font-style: italic;
                text-align: center;
                padding: 20px;
            }
            
            .feedback-content .no-feedback {
                color: #666;
                font-style: italic;
                text-align: center;
                padding: 20px;
            }
            
            .feedback-content .feedback-item {
                border-bottom: 1px solid #ffcdd2;
                padding: 10px 0;
            }
            
            .feedback-content .feedback-item:last-child {
                border-bottom: none;
            }
            
            .feedback-timestamp {
                color: #888;
                font-size: 12px;
                display: block;
                margin-top: 5px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Set report info
    document.getElementById("feedbackReportType").textContent = report.displayType || 'N/A';
    document.getElementById("feedbackReportTitle").textContent = report.title || 'N/A';
    document.getElementById("feedbackReportDepartment").textContent = report.department || 'N/A';
    
    // Show modal
    feedbackModal.style.display = "block";
    
    // Load feedback with correct path
    loadFeedback(reportId, reportTable);
}

// Function to close feedback modal
function closeFeedbackModal() {
    const modal = document.getElementById("feedbackModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Function to load feedback - UPDATED WITH CORRECT PATH
async function loadFeedback(reportId, reportTable) {
    const feedbackContent = document.getElementById("feedbackContent");
    if (!feedbackContent) return;
    
    feedbackContent.innerHTML = '<p class="loading-feedback"><i class="fas fa-spinner fa-spin"></i> Loading feedback...</p>';
    
    try {
        // Use the correct path based on your structure
        const url = `/coordinator/ReportManagement/php/get_feedback.php?report_id=${reportId}&table=${encodeURIComponent(reportTable)}`;
        console.log("Fetching feedback from:", url);
        
        const response = await fetch(url);
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get the response text first for debugging
        const responseText = await response.text();
        console.log("Raw response:", responseText.substring(0, 200)); // Log first 200 chars
        
        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse JSON. Full response:", responseText);
            feedbackContent.innerHTML = '<p class="no-feedback">Error: Server returned invalid response. Please check console for details.</p>';
            return;
        }
        
        if (data.success && data.feedback && data.feedback.length > 0) {
            let html = '';
            data.feedback.forEach(feedback => {
                const feedbackText = feedback.feedback_text || feedback.feedback || 'No feedback text provided';
                const timestamp = feedback.created_at || feedback.updated_at || null;
                
                html += `
                    <div class="feedback-item">
                        <p><span class="feedback-label">Feedback:</span> ${feedbackText}</p>
                        ${timestamp ? `<span class="feedback-timestamp">${new Date(timestamp).toLocaleString()}</span>` : ''}
                    </div>
                `;
            });
            feedbackContent.innerHTML = html;
        } else {
            feedbackContent.innerHTML = '<p class="no-feedback">No feedback available for this report.</p>';
        }
    } catch (error) {
        console.error("Error loading feedback:", error);
        feedbackContent.innerHTML = '<p class="no-feedback">Error loading feedback. Please try again.</p>';
    }
}

// Show upload modal
function showUploadModal(reportId, reportTable) {
    const modal = document.getElementById("uploadModal");
    if (!modal) {
        console.error("Upload modal not found in the DOM");
        return;
    }
    
    const reportTitleSpan = document.getElementById("modalReportTitle");
    
    // Find report details
    const report = approvedReports.find(r => r.id == reportId && r.source_table === reportTable);
    
    // Safely set text content only if elements exist
    if (reportTitleSpan) reportTitleSpan.textContent = report ? (report.title || 'N/A') : 'N/A';
    
    // Clear file list
    const fileList = document.getElementById("fileList");
    if (fileList) {
        fileList.innerHTML = "";
    }
    
    // Reset file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.value = "";
        fileInput.disabled = false;
    }
    
    // Reset selected files list
    const selectedFilesList = document.getElementById("selectedFilesList");
    if (selectedFilesList) {
        selectedFilesList.innerHTML = "";
    }
    
    // Update file count display
    updateFileCount();
    
    // Show modal
    modal.style.display = "block";
    
    // Load existing files for this report
    loadReportFiles(reportId, reportTable);
}

// Close upload modal
function closeUploadModal() {
    const modal = document.getElementById("uploadModal");
    if (modal) {
        modal.style.display = "none";
    }
    currentUploadReportId = null;
    currentUploadTable = null;
    currentExistingFiles = [];
    
    // Clear the file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";
}

// Update file count display
function updateFileCount() {
    const fileCount = document.getElementById("fileCount");
    if (fileCount) {
        const remaining = MAX_FILES - currentExistingFiles.length;
        fileCount.textContent = `${currentExistingFiles.length}/${MAX_FILES} files`;
        fileCount.className = remaining > 0 ? "file-count-ok" : "file-count-full";
    }
}

// Handle file selection
function handleFileSelect(input) {
    const selectedFilesList = document.getElementById("selectedFilesList");
    if (!selectedFilesList) return;
    
    if (input.files && input.files.length > 0) {
        // Clear previous file list
        selectedFilesList.innerHTML = "";
        
        // Check total files (existing + new)
        const totalFiles = currentExistingFiles.length + input.files.length;
        if (totalFiles > MAX_FILES) {
            alert(`You can only have up to ${MAX_FILES} files total. You already have ${currentExistingFiles.length} file(s). Please select fewer files.`);
            input.value = "";
            return;
        }
        
        // Check each file
        let validFiles = true;
        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            
            // Validate file type
            if (file.type !== "application/pdf") {
                alert(`"${file.name}" is not a PDF file. Please select only PDF files.`);
                input.value = "";
                validFiles = false;
                break;
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert(`"${file.name}" is larger than 10MB. Please select smaller files.`);
                input.value = "";
                validFiles = false;
                break;
            }
        }
        
        if (!validFiles) {
            selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
            const uploadBtn = document.querySelector(".upload-btn");
            if (uploadBtn) uploadBtn.style.display = "none";
            return;
        }
        
        // Display all selected files
        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            
            const fileItem = document.createElement("div");
            fileItem.className = "selected-file-item";
            fileItem.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <span class="file-status">Pending</span>
            `;
            selectedFilesList.appendChild(fileItem);
        }
        
        // Show upload button
        const uploadBtn = document.querySelector(".upload-btn");
        if (uploadBtn) {
            uploadBtn.style.display = "block";
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
            uploadBtn.onclick = uploadFiles;
        }
    } else {
        selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
        const uploadBtn = document.querySelector(".upload-btn");
        if (uploadBtn) uploadBtn.style.display = "none";
    }
}

// Upload files
async function uploadFiles() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput) {
        alert("File input not found");
        return;
    }
    
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert("Please select files to upload.");
        return;
    }
    
    if (!currentUploadReportId || !currentUploadTable) {
        alert("Report information missing.");
        return;
    }
    
    // Check if we'll exceed the maximum
    if (currentExistingFiles.length + files.length > MAX_FILES) {
        alert(`Cannot upload ${files.length} file(s). You can only have ${MAX_FILES} files total. Current: ${currentExistingFiles.length}, Remaining: ${MAX_FILES - currentExistingFiles.length}`);
        return;
    }
    
    // Disable upload button and show progress
    const uploadBtn = document.querySelector(".upload-btn");
    const originalBtnText = uploadBtn.innerHTML;
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading... 0/' + files.length;
    
    let successCount = 0;
    let failCount = 0;
    let failedFiles = [];
    
    // Upload files one by one
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("report_id", currentUploadReportId);
        formData.append("report_table", currentUploadTable);
        
        try {
            // Update status
            uploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading... ${i+1}/${files.length}`;
            
            const fileItems = document.querySelectorAll(".selected-file-item");
            if (fileItems[i]) {
                fileItems[i].querySelector(".file-status").innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            }
            
            const response = await fetch("/coordinator/ReportManagement/php/upload.php", {
                method: "POST",
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                successCount++;
                if (fileItems[i]) {
                    fileItems[i].className = "selected-file-item success";
                    fileItems[i].querySelector(".file-status").innerHTML = '<i class="fas fa-check-circle"></i> Uploaded';
                }
            } else {
                failCount++;
                failedFiles.push(file.name);
                if (fileItems[i]) {
                    fileItems[i].className = "selected-file-item error";
                    fileItems[i].querySelector(".file-status").innerHTML = `<i class="fas fa-exclamation-circle"></i> Failed: ${result.error || 'Error'}`;
                }
            }
        } catch (error) {
            console.error("Upload error:", error);
            failCount++;
            failedFiles.push(file.name);
            const fileItems = document.querySelectorAll(".selected-file-item");
            if (fileItems[i]) {
                fileItems[i].className = "selected-file-item error";
                fileItems[i].querySelector(".file-status").innerHTML = '<i class="fas fa-exclamation-circle"></i> Upload failed';
            }
        }
    }
    
    // Show summary
    if (successCount > 0) {
        alert(`${successCount} out of ${files.length} file(s) uploaded successfully! ${failCount > 0 ? failCount + ' failed.' : ''}`);
        // Refresh file list
        loadReportFiles(currentUploadReportId, currentUploadTable);
        // Clear file input and selected files list
        fileInput.value = "";
        document.getElementById("selectedFilesList").innerHTML = "<p class='no-files'>No files selected</p>";
    } else {
        alert("All files failed to upload. Please try again.\nFailed files: " + failedFiles.join(", "));
    }
    
    // Re-enable upload button
    uploadBtn.disabled = false;
    uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
    uploadBtn.style.display = "none";
}

// Reupload file (replace existing)
async function reuploadFile(fileId, oldFileName) {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput) {
        alert("File input not found");
        return;
    }
    
    // Check if a file is selected
    if (fileInput.files.length === 0) {
        alert("Please select a file to reupload.");
        return;
    }
    
    if (fileInput.files.length > 1) {
        alert("Please select only one file for reupload.");
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validate file type
    if (file.type !== "application/pdf") {
        alert("Please select a PDF file.");
        return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB.");
        return;
    }
    
    if (!confirm(`Replace "${oldFileName}" with "${file.name}"?`)) {
        return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("report_id", currentUploadReportId);
    formData.append("report_table", currentUploadTable);
    formData.append("existing_file_id", fileId);
    
    try {
        const response = await fetch("/coordinator/ReportManagement/php/upload.php", {
            method: "POST",
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert("File reuploaded successfully!");
            // Refresh file list
            loadReportFiles(currentUploadReportId, currentUploadTable);
            // Clear file input
            fileInput.value = "";
            document.getElementById("selectedFilesList").innerHTML = "<p class='no-files'>No files selected</p>";
        } else {
            alert("Reupload failed: " + (result.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Reupload error:", error);
        alert("Error reuploading file.");
    }
}

// Load existing files for a report
async function loadReportFiles(reportId, reportTable) {
    const fileListDiv = document.getElementById("fileList");
    if (!fileListDiv) return;
    
    fileListDiv.innerHTML = "<p>Loading files...</p>";
    
    try {
        const url = `/coordinator/ReportManagement/php/get_report_files.php?report_id=${reportId}`;
        console.log("Fetching files from:", url);
        
        const response = await fetch(url);
        const responseText = await response.text();
        
        // Try to parse as JSON
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse JSON. Response:", responseText.substring(0, 200));
            fileListDiv.innerHTML = `<p>Error: Server returned invalid response</p>`;
            return;
        }
        
        if (result.success) {
            currentExistingFiles = result.files || [];
            updateFileCount();
            
            if (currentExistingFiles.length > 0) {
                let html = "<div class='files-grid'>";
                html += "<h4>Current Files:</h4>";
                
                currentExistingFiles.forEach(file => {
                    // Handle the date properly
                    let uploadDate = 'Unknown date';
                    if (file.uploaded_at) {
                        try {
                            uploadDate = new Date(file.uploaded_at).toLocaleString();
                        } catch (e) {
                            console.warn("Date parsing error:", e);
                        }
                    }
                    
                    // Fix the file path
                    const filePath = file.file_path.startsWith('/') ? file.file_path : `/coordinator/ReportManagement/${file.file_path}`;
                    html += `
                        <div class="file-item existing" id="file-${file.id}">
                            <i class="fas fa-file-pdf"></i>
                            <div class="file-details">
                                <a href="${filePath}" target="_blank" class="file-name">${file.file_name}</a>
                                <span class="file-date">Uploaded: ${uploadDate}</span>
                            </div>
                            <button onclick="prepareReupload(${file.id}, '${file.file_name}')" class="reupload-btn" title="Replace this file">
                                <i class="fas fa-sync-alt"></i> Replace
                            </button>
                        </div>
                    `;
                });
                html += "</div>";
                
                // Show remaining slots
                const remaining = MAX_FILES - currentExistingFiles.length;
                if (remaining > 0) {
                    html += `<p class='remaining-slots'><i class='fas fa-info-circle'></i> You can upload ${remaining} more file(s). Maximum ${MAX_FILES} files total.</p>`;
                } else {
                    html += `<p class='max-files-reached'><i class='fas fa-exclamation-triangle'></i> Maximum files (${MAX_FILES}) reached. Replace existing files to update them.</p>`;
                }
                
                fileListDiv.innerHTML = html;
            } else {
                fileListDiv.innerHTML = `
                    <p>No files uploaded yet.</p>
                    <p class='remaining-slots'><i class='fas fa-info-circle'></i> You can upload up to ${MAX_FILES} PDF files.</p>
                `;
            }
        } else {
            console.error("Server returned error:", result.error);
            fileListDiv.innerHTML = `<p>Error: ${result.error || 'Failed to load files'}</p>`;
        }
    } catch (error) {
        console.error("Error loading files:", error);
        fileListDiv.innerHTML = "<p>Error loading files. Please try again.</p>";
    }
}

// Prepare for reupload
function prepareReupload(fileId, fileName) {
    // Highlight the file to be replaced
    const fileElement = document.getElementById(`file-${fileId}`);
    if (fileElement) {
        fileElement.style.backgroundColor = "#fff3e0";
        fileElement.style.borderLeft = "4px solid #ff9800";
    }
    
    // Scroll to file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    
    // Change upload button to show reupload mode
    const uploadBtn = document.querySelector(".upload-btn");
    uploadBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Replace File';
    uploadBtn.onclick = function() { reuploadFile(fileId, fileName); };
    uploadBtn.style.display = "inline-block";
    
    // Show message
    const selectedFilesList = document.getElementById("selectedFilesList");
    selectedFilesList.innerHTML = `<p class='reupload-mode'><i class='fas fa-info-circle'></i> Reupload mode: Select one file to replace "${fileName}"</p>`;
}

// Initialize filter event listeners for each section independently
function initFilterListeners() {
    // Approved section filter
    const approvedFilter = document.querySelector('.section-green .filter-row select');
    if (approvedFilter) {
        approvedFilter.addEventListener('change', function() {
            renderApprovedTable();
        });
    }
    
    // Need Fix section filter
    const needFixFilter = document.querySelector('.section-Orange .filter-row select');
    if (needFixFilter) {
        needFixFilter.addEventListener('change', function() {
            renderNeedFixTable();
        });
    }
    
    // Rejected section filter
    const rejectedFilter = document.querySelector('.section-red .filter-row select');
    if (rejectedFilter) {
        rejectedFilter.addEventListener('change', function() {
            renderRejectedTable();
        });
    }
}

// Reset filter for a specific section
function resetSectionFilter(section) {
    if (section === 'approved') {
        const filter = document.querySelector('.section-green .filter-row select');
        if (filter) filter.value = 'All type';
        renderApprovedTable();
    } else if (section === 'needfix') {
        const filter = document.querySelector('.section-Orange .filter-row select');
        if (filter) filter.value = 'All type';
        renderNeedFixTable();
    } else if (section === 'rejected') {
        const filter = document.querySelector('.section-red .filter-row select');
        if (filter) filter.value = 'All type';
        renderRejectedTable();
    }
}

// Reset all filters
function resetAllFilters() {
    document.querySelectorAll('.filter-row select').forEach(select => {
        if (select) select.value = 'All type';
    });
    renderApprovedTable();
    renderNeedFixTable();
    renderRejectedTable();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const uploadModal = document.getElementById("uploadModal");
    const feedbackModal = document.getElementById("feedbackModal");
    
    if (event.target == uploadModal) {
        closeUploadModal();
    }
    
    if (event.target == feedbackModal) {
        closeFeedbackModal();
    }
}

document.addEventListener("DOMContentLoaded", loadReports);