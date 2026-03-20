// feedback.js - Handles all feedback-related functionality for rejected reports

// Store reference to the feedback modal
let feedbackModal = null;

// Initialize feedback modal when the page loads
document.addEventListener('DOMContentLoaded', function() {
    createFeedbackModal();
});

// Create the feedback modal and add it to the DOM
function createFeedbackModal() {
    // Check if modal already exists
    if (document.getElementById("feedbackModal")) {
        feedbackModal = document.getElementById("feedbackModal");
        return;
    }
    
    // Create modal element
    feedbackModal = document.createElement("div");
    feedbackModal.id = "feedbackModal";
    feedbackModal.className = "modal";
    feedbackModal.innerHTML = `
        <div class="modal-content feedback-modal-content">
            <div class="modal-header">
                <h2 style="color: #ffffff;"><i class="fas fa-comment" style="color: #ffffff;"></i></i> Feedback for Rejected Report</h2>
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
    
    // Add CSS styles for the feedback modal
    addFeedbackStyles();
}

// Add CSS styles for the RED REJECTION feedback modal
function addFeedbackStyles() {
    if (document.getElementById('feedback-styles')) return;
    
    const style = document.createElement("style");
    style.id = 'feedback-styles';
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
// Show feedback modal for rejected reports
function showFeedbackModal(reportId, reportTable, report) {
    // Ensure modal exists
    if (!feedbackModal) {
        createFeedbackModal();
        feedbackModal = document.getElementById("feedbackModal");
    }
    
    // Set report info
    const typeSpan = document.getElementById("feedbackReportType");
    const titleSpan = document.getElementById("feedbackReportTitle");
    const deptSpan = document.getElementById("feedbackReportDepartment");
    
    if (typeSpan) typeSpan.textContent = report.displayType || 'N/A';
    if (titleSpan) titleSpan.textContent = report.title || 'N/A';
    if (deptSpan) deptSpan.textContent = report.department || 'N/A';
    
    // Show modal
    feedbackModal.style.display = "block";
    
    // Load feedback
    loadFeedback(reportId, reportTable);
}

// Function to close feedback modal
function closeFeedbackModal() {
    if (feedbackModal) {
        feedbackModal.style.display = "none";
    }
}

// Function to load feedback
async function loadFeedback(reportId, reportTable) {
    const feedbackContent = document.getElementById("feedbackContent");
    if (!feedbackContent) return;
    
    feedbackContent.innerHTML = '<p class="loading-feedback"><i class="fas fa-spinner fa-spin"></i> Loading feedback...</p>';
    
    try {
        // Use the correct absolute path
        const url = `/admin/ReportManagement/php/get_feedback.php?report_id=${reportId}&table=${encodeURIComponent(reportTable)}`;
        console.log("Fetching feedback from:", url);
        
        const response = await fetch(url);
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        // Get the response text
        const responseText = await response.text();
        
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
        feedbackContent.innerHTML = `<p class="no-feedback">Error loading feedback: ${error.message}</p>`;
    }
}

// Make functions globally available
window.showFeedbackModal = showFeedbackModal;
window.closeFeedbackModal = closeFeedbackModal;