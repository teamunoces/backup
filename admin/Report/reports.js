// Global variables for upload functionality
let currentUploadReportId = null;
let currentUploadTable = null;
let currentExistingFiles = [];
let pendingReuploadFileId = null;
let pendingReuploadFileName = null;
const MAX_FILES = 4;

// Debug function to check if elements exist
function debugElement(id) {
    const element = document.getElementById(id);
    console.log(`Element #${id}:`, element ? 'Found' : 'NOT FOUND');
    return element;
}

async function loadReports() {
    console.log("loadReports started for Reports.html");
    try {
        const response = await fetch("./php/get.php");
        const data = await response.json();
        console.log("Reports data loaded:", data);

        const adminTableBody = document.getElementById("adminTableBody");

        // Debug: Check if table body exists
        console.log("adminTableBody:", adminTableBody ? 'Found' : 'NOT FOUND');

        adminTableBody.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            adminTableBody.innerHTML = `<tr><td colspan="5">No reports found.</td></tr>`;
            return;
        }

        data.forEach((report, index) => {
            let formattedDate = report.created_at 
                ? new Date(report.created_at).toLocaleDateString() 
                : "N/A";

            const typeMap = {
                "cnacr": "CNACR",
                "coordinator_cnacr": "Community Needs Assessment Consolidated Report",
                "3ydp": "3 Year Development Plan",
                "pd_main": "Program Design",
                "mar_header": "Monthly Accomplishment Report"
            };

            const typeName = typeMap[report.source_table] || report.source_table;

            // Role and status handling
            const role = report.role ? report.role.toLowerCase() : 'unknown';
            const status = report.status ? report.status.toLowerCase() : '';

            if (role === 'admin') {
                // Admin table with upload icon
                const rowHTML = `
                <tr data-index="${index}" data-id="${report.id}" data-source-table="${report.source_table}">
                    <td>${typeName}</td>
                    <td>${report.title || 'N/A'}</td>
                    <td>${report.department || 'N/A'}</td>
                    <td>${formattedDate}</td>
                    <td class="actions">
                        <i class="far fa-eye view-icon" data-id="${report.id}" data-source-table="${report.source_table}" style="cursor: pointer; margin-right: 10px;"></i>
                        <i class="fas fa-upload upload-icon" data-id="${report.id}" data-table="${report.source_table}" style="cursor: pointer; margin-right: 10px; color: #2e7d32;"></i>
                        <i class="fas fa-archive archive-icon" style="cursor: pointer; color: #f44336;"></i>
                    </td>
                </tr>
                `;
                adminTableBody.innerHTML += rowHTML;
            }
        });

        if (adminTableBody.innerHTML === "") {
            adminTableBody.innerHTML = `<tr><td colspan="5">No admin reports found.</td></tr>`;
        }

        attachActionEvents(data);
        console.log("Action events attached");

    } catch (error) {
        console.error("Error loading reports:", error);
        showNotification("Error loading reports. Please refresh the page.", "error");
    }
}

function attachActionEvents(data) {
    console.log("attachActionEvents called");
    
    // Upload icon events (only in admin table)
    const uploadIcons = document.querySelectorAll("#adminTableBody .upload-icon");
    console.log("Found upload icons:", uploadIcons.length);
    
    uploadIcons.forEach((icon, index) => {
        console.log(`Attaching event to upload icon ${index}`);
        icon.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Upload icon clicked");
            
            const reportId = icon.getAttribute("data-id");
            const reportTable = icon.getAttribute("data-table");
            
            console.log("Report ID:", reportId, "Table:", reportTable);
            
            // Find the report details for display
            const report = data.find(r => r.id == reportId && r.source_table === reportTable);
            console.log("Found report:", report);
            
            // Show upload modal
            showUploadModal(reportId, reportTable, report);
        });
    });

    // Archive icon events
    document.querySelectorAll(".archive-icon").forEach((icon) => {
        icon.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const row = icon.closest("tr");
            const index = row.getAttribute("data-index");
            const report = data[index];

            if (!confirm("Are you sure you want to archive this report?")) return;

            try {
                const response = await fetch("./php/archive.php", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        id: report.id,
                        table: report.source_table
                    })
                });

                const result = await response.json();
                if (result.success) {
                    showNotification("Report archived successfully!", "success");
                    loadReports();
                } else {
                    showNotification("Failed to archive report: " + (result.error || "Unknown error"), "error");
                }
            } catch (error) {
                console.error("Archive error:", error);
                showNotification("Error archiving report", "error");
            }
        });
    });

    // View icon events
    document.querySelectorAll(".view-icon").forEach((icon) => {
        icon.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const reportId = icon.getAttribute("data-id");
            const sourceTable = icon.getAttribute("data-source-table");
            
            // Find the report that matches BOTH id and source_table
            const report = data.find(r => r.id == reportId && r.source_table === sourceTable);

            if (!report) {
                console.error("Report not found in data array");
                showNotification("Report not found", "error");
                return;
            }

            // Navigate to view page
            const viewPath = getViewPath(report);
            if (viewPath) {
                window.location.href = `${viewPath}?id=${reportId}`;
            }
        });
    });
}

function getViewPath(report) {
    const type = report.source_table.toLowerCase().trim();

    const viewMappings = {
        "cnacr": "actions/admin_view/resultview/cnacrview.php",
        "coordinator_cnacr": "actions/admin_view/coor_cnacrview/cnacrview.php",
        "3ydp": "actions/admin_view/3ydpview/3ydpview.php",
        "pd_main": "actions/admin_view/pdview/view.php",
        "mar_header": "actions/admin_view/marview/marview.php",
        "default": "actions/admin_view/defaultview/view.php"
    };

    return viewMappings[type] || viewMappings.default;
}

// Show upload modal
function showUploadModal(reportId, reportTable, report = null) {
    console.log("showUploadModal called with:", reportId, reportTable, report);
    
    const modal = document.getElementById("uploadModal");
    if (!modal) {
        console.error("Upload modal not found in the DOM");
        alert("Error: Upload modal not found. Please check the HTML.");
        return;
    }
    
    console.log("Modal found, setting display to block");
    modal.style.display = "block";
    
    const reportTitleSpan = document.getElementById("modalReportTitle");
    const fileCountSpan = document.getElementById("fileCount");
    
    // Type mapping for display
    const typeMap = {
        "cnacr": "CNACR",
        "coordinator_cnacr": "Community Needs Assessment Consolidated Report",
        "3ydp": "3 Year Development Plan",
        "pd_main": "Program Design",
        "mar_header": "Monthly Accomplishment Report"
    };
    
    const displayType = report ? (typeMap[report.source_table] || report.source_table) : 'N/A';
    const displayTitle = report ? (report.title || 'N/A') : 'N/A';
    
    // Set report title with type
    if (reportTitleSpan) {
        reportTitleSpan.textContent = `${displayTitle} (${displayType})`;
    }
    
    // Initialize file count
    if (fileCountSpan) {
        fileCountSpan.textContent = `0/${MAX_FILES} files`;
        fileCountSpan.className = "file-count-ok";
    }
    
    // Clear file list
    const fileList = document.getElementById("fileList");
    if (fileList) {
        fileList.innerHTML = "<p class='loading'><i class='fas fa-spinner fa-spin'></i> Loading files...</p>";
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
        selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
    }
    
    // Reset upload button
    const uploadBtn = document.querySelector(".upload-btn");
    if (uploadBtn) {
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
        uploadBtn.onclick = uploadFiles;
        uploadBtn.style.display = "none";
        uploadBtn.disabled = false;
    }
    
    // Reset reupload mode
    clearReuploadMode();
    
    // Store current report info
    currentUploadReportId = reportId;
    currentUploadTable = reportTable;
    
    // Load existing files for this report
    loadReportFiles(reportId, reportTable);
}

// Close upload modal
function closeUploadModal() {
    console.log("closeUploadModal called");
    const modal = document.getElementById("uploadModal");
    if (modal) {
        modal.style.display = "none";
    }
    currentUploadReportId = null;
    currentUploadTable = null;
    currentExistingFiles = [];
    
    // Clear reupload mode
    clearReuploadMode();
    
    // Clear the file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";
    
    // Reset selected files list
    const selectedFilesList = document.getElementById("selectedFilesList");
    if (selectedFilesList) {
        selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
    }
    
    // Reset upload button
    const uploadBtn = document.querySelector(".upload-btn");
    if (uploadBtn) {
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
        uploadBtn.onclick = uploadFiles;
        uploadBtn.style.display = "none";
        uploadBtn.disabled = false;
    }
}

// Handle file selection
function handleFileSelect(input) {
    console.log("handleFileSelect called with files:", input.files.length);
    
    const selectedFilesList = document.getElementById("selectedFilesList");
    if (!selectedFilesList) return;
    
    if (input.files && input.files.length > 0) {
        // Check if we're in reupload mode
        if (pendingReuploadFileId) {
            // Reupload mode - only allow one file
            if (input.files.length > 1) {
                showNotification("Please select only one file for replacement.", "warning");
                input.value = "";
                return;
            }
            
            const file = input.files[0];
            
            // Validate file type
            if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
                showNotification("Please select a PDF file.", "error");
                input.value = "";
                return;
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showNotification("File size must be less than 10MB.", "error");
                input.value = "";
                return;
            }
            
            // Clear selected files list
            selectedFilesList.innerHTML = "";
            
            // Display selected file for reupload
            const fileItem = document.createElement("div");
            fileItem.className = "selected-file-item";
            fileItem.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <span class="file-status">Ready to replace</span>
                <button type="button" class="remove-file-btn" onclick="clearReuploadMode()" title="Cancel replacement">
                    <i class="fas fa-times"></i>
                </button>
            `;
            selectedFilesList.appendChild(fileItem);
            
            // Make sure upload button is visible and configured for reupload
            const uploadBtn = document.querySelector(".upload-btn");
            if (uploadBtn) {
                uploadBtn.style.display = "inline-block";
                uploadBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Replace File';
                uploadBtn.onclick = function() { 
                    reuploadFile(pendingReuploadFileId, pendingReuploadFileName); 
                };
                uploadBtn.disabled = false;
            }
            
            return;
        }
        
        // Normal upload mode - clear previous selection
        selectedFilesList.innerHTML = "";
        
        // Check total files (existing + new)
        const totalFiles = currentExistingFiles.length + input.files.length;
        if (totalFiles > MAX_FILES) {
            showNotification(`You can only have up to ${MAX_FILES} files total. You already have ${currentExistingFiles.length} file(s).`, "warning");
            input.value = "";
            selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
            document.querySelector(".upload-btn").style.display = "none";
            return;
        }
        
        // Check each file
        let validFiles = true;
        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            
            // Validate file type
            if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
                showNotification(`"${file.name}" is not a PDF file. Please select only PDF files.`, "error");
                input.value = "";
                validFiles = false;
                break;
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showNotification(`"${file.name}" is larger than 10MB. Please select smaller files.`, "error");
                input.value = "";
                validFiles = false;
                break;
            }
        }
        
        if (!validFiles) {
            selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
            document.querySelector(".upload-btn").style.display = "none";
            return;
        }
        
        // Display all selected files
        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            
            const fileItem = document.createElement("div");
            fileItem.className = "selected-file-item";
            fileItem.setAttribute("data-file-index", i);
            fileItem.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <span class="file-name">${escapeHtml(file.name)}</span>
                <span class="file-size">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <span class="file-status">Pending</span>
                <button type="button" class="remove-file-btn" onclick="removeSelectedFile(${i})" title="Remove file">
                    <i class="fas fa-times"></i>
                </button>
            `;
            selectedFilesList.appendChild(fileItem);
        }
        
        // Show upload button
        const uploadBtn = document.querySelector(".upload-btn");
        if (uploadBtn) {
            uploadBtn.style.display = "inline-block";
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
            uploadBtn.onclick = uploadFiles;
            uploadBtn.disabled = false;
        }
    } else {
        selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
        document.querySelector(".upload-btn").style.display = "none";
    }
}

// Remove selected file
function removeSelectedFile(index) {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput) return;
    
    // Create new FileList without the removed file
    const dt = new DataTransfer();
    const files = fileInput.files;
    
    for (let i = 0; i < files.length; i++) {
        if (i !== index) {
            dt.items.add(files[i]);
        }
    }
    
    fileInput.files = dt.files;
    
    // Re-render the selected files list
    handleFileSelect(fileInput);
}

// Upload files
async function uploadFiles() {
    console.log("uploadFiles called");
    
    const fileInput = document.getElementById("fileInput");
    if (!fileInput) {
        showNotification("File input not found", "error");
        return;
    }
    
    const files = fileInput.files;
    
    if (files.length === 0) {
        showNotification("Please select files to upload.", "warning");
        return;
    }
    
    if (!currentUploadReportId || !currentUploadTable) {
        showNotification("Report information missing.", "error");
        return;
    }
    
    // Check if we'll exceed the maximum
    if (currentExistingFiles.length + files.length > MAX_FILES) {
        showNotification(`Cannot upload ${files.length} file(s). You can only have ${MAX_FILES} files total.`, "warning");
        return;
    }
    
    // Disable upload button and show progress
    const uploadBtn = document.querySelector(".upload-btn");
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    
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
            uploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading ${i+1}/${files.length}...`;
            
            const fileItems = document.querySelectorAll(".selected-file-item");
            if (fileItems[i]) {
                fileItems[i].querySelector(".file-status").innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            }
            
            const response = await fetch("./php/upload.php", {
                method: "POST",
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
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
        showNotification(`${successCount} out of ${files.length} file(s) uploaded successfully!`, "success");
        // Refresh file list
        await loadReportFiles(currentUploadReportId, currentUploadTable);
        // Clear file input and selected files list
        fileInput.value = "";
        document.getElementById("selectedFilesList").innerHTML = "<p class='no-files'>No files selected</p>";
    } else {
        showNotification("All files failed to upload. Please try again.", "error");
    }
    
    // Re-enable upload button
    uploadBtn.disabled = false;
    uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
    uploadBtn.style.display = failCount > 0 && successCount === 0 ? "inline-block" : "none";
}

// Reupload file (replace existing)
async function reuploadFile(fileId, oldFileName) {
    console.log("reuploadFile called with:", fileId, oldFileName);
    
    const fileInput = document.getElementById("fileInput");
    if (!fileInput) {
        showNotification("File input not found", "error");
        return;
    }
    
    // Check if a file is selected
    if (fileInput.files.length === 0) {
        showNotification("Please select a file to replace the current one.", "warning");
        return;
    }
    
    if (fileInput.files.length > 1) {
        showNotification("Please select only one file for replacement.", "warning");
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validate file type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
        showNotification("Please select a PDF file.", "error");
        fileInput.value = "";
        return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification("File size must be less than 10MB.", "error");
        fileInput.value = "";
        return;
    }
    
    if (!confirm(`Replace "${oldFileName}" with "${file.name}"? This action cannot be undone.`)) {
        return;
    }
    
    // Disable upload button and show loading state
    const uploadBtn = document.querySelector(".upload-btn");
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Replacing...';
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("report_id", currentUploadReportId);
    formData.append("report_table", currentUploadTable);
    formData.append("existing_file_id", fileId);
    formData.append("replace", "true");
    
    try {
        const response = await fetch("./php/upload.php", {
            method: "POST",
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`File replaced successfully!\nNew file: ${file.name}`, "success");
            
            // Clear reupload mode
            clearReuploadMode();
            
            // Refresh file list
            await loadReportFiles(currentUploadReportId, currentUploadTable);
            
            // Clear file input and selected files list
            fileInput.value = "";
            const selectedFilesList = document.getElementById("selectedFilesList");
            if (selectedFilesList) {
                selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
            }
            
            // Reset upload button
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
            uploadBtn.onclick = uploadFiles;
            uploadBtn.style.display = "none";
            
        } else {
            showNotification("Replacement failed: " + (result.error || "Unknown error"), "error");
        }
    } catch (error) {
        console.error("Reupload error:", error);
        showNotification("Error replacing file. Please try again.", "error");
    } finally {
        uploadBtn.disabled = false;
    }
}

// Clear reupload mode
function clearReuploadMode() {
    console.log("clearReuploadMode called");
    
    // Reset pending reupload variables
    pendingReuploadFileId = null;
    pendingReuploadFileName = null;
    
    // Remove highlight from all file items
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('reupload-target');
    });
    
    // Clear selected files list if it contains reupload mode message
    const selectedFilesList = document.getElementById("selectedFilesList");
    if (selectedFilesList && selectedFilesList.innerHTML.includes('Reupload mode')) {
        selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
    }
    
    // Reset file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.value = "";
        fileInput.disabled = false;
    }
    
    // Reset upload button
    const uploadBtn = document.querySelector(".upload-btn");
    if (uploadBtn) {
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
        uploadBtn.onclick = uploadFiles;
        uploadBtn.style.display = "none";
        uploadBtn.disabled = false;
    }
    
    // Remove reupload mode message from file list if exists
    const reuploadMessage = document.querySelector('.reupload-active-message');
    if (reuploadMessage) {
        reuploadMessage.remove();
    }
}

// Load report files
async function loadReportFiles(reportId, reportTable) {
    console.log("loadReportFiles called for report:", reportId);
    
    const fileListDiv = document.getElementById("fileList");
    if (!fileListDiv) return;
    
    fileListDiv.innerHTML = "<p class='loading'><i class='fas fa-spinner fa-spin'></i> Loading files...</p>";
    
    try {
        const url = `./php/get_report_files.php?report_id=${reportId}`;
        console.log("Fetching files from:", url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Files response:", result);
        
        if (result.success) {
            currentExistingFiles = result.files || [];
            updateFileCount();
            
            if (currentExistingFiles.length > 0) {
                let html = "<div class='files-grid'>";
                
                currentExistingFiles.forEach(file => {
                    // Format date
                    let uploadDate = 'Unknown date';
                    if (file.uploaded_at) {
                        try {
                            uploadDate = new Date(file.uploaded_at).toLocaleString();
                        } catch (e) {
                            console.warn("Date parsing error:", e);
                        }
                    }
                    
                    // Format file size
                    let fileSize = '';
                    if (file.file_size) {
                        fileSize = ` (${(file.file_size / 1024 / 1024).toFixed(2)} MB)`;
                    }
                    
                    // Build file path for viewing
                    const viewPath = file.file_path;
                    
                    html += `
                        <div class="file-item" id="file-${file.id}">
                            <i class="fas fa-file-pdf"></i>
                            <div class="file-details">
                                <a href="${escapeHtml(viewPath)}" target="_blank" class="file-name">${escapeHtml(file.file_name)}${fileSize}</a>
                                <span class="file-date">Uploaded: ${escapeHtml(uploadDate)}</span>
                            </div>
                            <button onclick="prepareReupload(${file.id}, '${escapeHtml(file.file_name).replace(/'/g, "\\'")}')" class="reupload-btn" title="Replace this file">
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
                    // Enable file input
                    const fileInput = document.getElementById("fileInput");
                    if (fileInput) fileInput.disabled = false;
                } else {
                    html += `<p class='max-files-reached'><i class='fas fa-exclamation-triangle'></i> Maximum files (${MAX_FILES}) reached. Replace existing files to update them.</p>`;
                    // Disable file input if max reached
                    const fileInput = document.getElementById("fileInput");
                    if (fileInput) fileInput.disabled = true;
                }
                
                fileListDiv.innerHTML = html;
            } else {
                fileListDiv.innerHTML = `
                    <p class='no-files'>No files uploaded yet.</p>
                    <p class='remaining-slots'><i class='fas fa-info-circle'></i> You can upload up to ${MAX_FILES} PDF files.</p>
                `;
                // Enable file input
                const fileInput = document.getElementById("fileInput");
                if (fileInput) fileInput.disabled = false;
            }
        } else {
            console.error("Server returned error:", result.error);
            fileListDiv.innerHTML = `<p class='error'>Error: ${escapeHtml(result.error || 'Failed to load files')}</p>`;
        }
    } catch (error) {
        console.error("Error loading files:", error);
        fileListDiv.innerHTML = "<p class='error'>Error loading files. Please try again.</p>";
    }
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

// Prepare for reupload
function prepareReupload(fileId, fileName) {
    console.log("prepareReupload called for file:", fileId, fileName);
    
    // Clear any existing reupload mode first
    clearReuploadMode();
    
    // Set pending reupload variables
    pendingReuploadFileId = fileId;
    pendingReuploadFileName = fileName;
    
    // Highlight the file to be replaced
    const fileElement = document.getElementById(`file-${fileId}`);
    if (fileElement) {
        fileElement.classList.add('reupload-target');
        fileElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    
    // Show reupload mode message in selected files list
    const selectedFilesList = document.getElementById("selectedFilesList");
    if (selectedFilesList) {
        selectedFilesList.innerHTML = `<div class='reupload-mode'>
            <i class='fas fa-info-circle'></i> 
            <strong>Reupload mode active:</strong> Select a PDF file to replace "${escapeHtml(fileName)}"
            <br><small style="color: #666;">Maximum file size: 10MB</small>
            <button type="button" class="cancel-reupload-btn" onclick="clearReuploadMode()" style="margin-left: 10px; padding: 2px 8px; background: #ff9800; color: white; border: none; border-radius: 3px; cursor: pointer;">
                Cancel
            </button>
        </div>`;
    }
    
    // Update upload button for reupload mode
    const uploadBtn = document.querySelector(".upload-btn");
    if (uploadBtn) {
        uploadBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Replace File';
        uploadBtn.onclick = function() { 
            reuploadFile(pendingReuploadFileId, pendingReuploadFileName); 
        };
        uploadBtn.style.display = "inline-block";
        uploadBtn.disabled = false;
    }
    
    // Enable and focus file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.value = "";
        fileInput.disabled = false;
        fileInput.focus();
    }
    
    // Add a message in the file list area
    const fileListDiv = document.getElementById("fileList");
    if (fileListDiv) {
        // Remove existing message if any
        const existingMessage = fileListDiv.querySelector('.reupload-active-message');
        if (existingMessage) existingMessage.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'reupload-active-message';
        messageDiv.style.cssText = 'background: #fff3e0; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #ff9800;';
        messageDiv.innerHTML = '<i class="fas fa-sync-alt"></i> Ready to replace file. Select a new PDF and click "Replace File".';
        fileListDiv.insertBefore(messageDiv, fileListDiv.firstChild);
    }
    
    showNotification(`Ready to replace "${fileName}". Select a new PDF file.`, "info");
}

// Show notification
function showNotification(message, type = "info") {
    console.log("Notification:", type, message);
    
    // Check if notification container exists, create if not
    let container = document.getElementById("notification-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "notification-container";
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(container);
    }
    
    // Create notification
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
        color: white;
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        min-width: 300px;
    `;
    
    // Add icon
    const icon = document.createElement("i");
    icon.className = `fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}`;
    notification.appendChild(icon);
    
    // Add message
    const text = document.createElement("span");
    text.textContent = message;
    notification.appendChild(text);
    
    // Add close button
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: auto;
        padding: 0 5px;
    `;
    closeBtn.onclick = () => notification.remove();
    notification.appendChild(closeBtn);
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = "slideOut 0.3s ease";
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add CSS animations and styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        overflow-y: auto;
    }
    
    .modal-content {
        background-color: #fff;
        margin: 50px auto;
        padding: 0;
        width: 90%;
        max-width: 800px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
    
    .modal-header {
        padding: 20px;
        background-color: #2e7d32;
        color: white;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
    }
    
    .modal-header .close {
        color: white;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
    }
    
    .modal-header .close:hover {
        color: #ffeb3b;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .file-item {
        display: flex;
        align-items: center;
        padding: 10px;
        margin: 5px 0;
        background: #f5f5f5;
        border-radius: 4px;
        transition: all 0.3s ease;
    }
    
    .file-item.reupload-target {
        background-color: #fff3e0;
        border-left: 4px solid #ff9800;
    }
    
    .reupload-btn {
        background: #ff9800;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        margin-left: auto;
        transition: background 0.3s ease;
    }
    
    .reupload-btn:hover {
        background: #f57c00;
    }
    
    .reupload-mode {
        background: #fff3e0;
        padding: 12px;
        border-radius: 5px;
        border-left: 4px solid #ff9800;
        margin: 10px 0;
    }
    
    .remove-file-btn {
        background: #f44336;
        color: white;
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 12px;
        cursor: pointer;
        margin-left: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    
    .remove-file-btn:hover {
        background: #d32f2f;
    }
    
    .selected-file-item {
        display: flex;
        align-items: center;
        padding: 8px;
        margin: 5px 0;
        background: #e3f2fd;
        border-radius: 4px;
    }
    
    .selected-file-item.success {
        background: #c8e6c9;
    }
    
    .selected-file-item.error {
        background: #ffcdd2;
    }
    
    .file-status {
        margin-left: 10px;
        font-size: 12px;
    }
    
    .upload-btn {
        background: #2e7d32;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
    }
    
    .upload-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded for Reports.html");
    
    // Check if modal exists
    debugElement("uploadModal");
    debugElement("fileInput");
    debugElement("fileList");
    debugElement("adminTableBody");
    
    // Load reports
    loadReports();
    
    // Add file input change event listener
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.addEventListener("change", function() {
            handleFileSelect(this);
        });
        console.log("File input change event attached");
    }
});

// Make functions available globally for onclick handlers
window.closeUploadModal = closeUploadModal;
window.handleFileSelect = handleFileSelect;
window.prepareReupload = prepareReupload;
window.reuploadFile = reuploadFile;
window.removeSelectedFile = removeSelectedFile;
window.showNotification = showNotification;
window.clearReuploadMode = clearReuploadMode;