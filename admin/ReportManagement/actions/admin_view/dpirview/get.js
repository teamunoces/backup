/**
 * Report Fetcher - Handles fetching and displaying report data
 */

// Auto-expand function for textareas
function autoExpand(element) {
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight) + 'px';
}

// Initialize auto-expand for all textareas
function initializeAutoExpand() {
    document.querySelectorAll('textarea').forEach(textarea => {
        autoExpand(textarea);
        textarea.addEventListener('input', function() {
            autoExpand(this);
        });
    });
}

// Populate form fields with data
function populateForm(data) {
    if (!data || typeof data !== 'object') {
        console.error('Invalid data provided to populateForm');
        return;
    }

    // Loop through all input and textarea elements
    const elements = document.querySelectorAll('input, textarea');
    
    elements.forEach(element => {
        const fieldName = element.id || element.name;
        if (fieldName && data[fieldName] !== undefined) {
            element.value = data[fieldName];
            
            // Trigger auto-expand for textareas
            if (element.tagName === 'TEXTAREA') {
                autoExpand(element);
            }
        }
    });
}

// Fetch report by ID
async function fetchReportById(reportId) {
    if (!reportId) {
        throw new Error('No report ID provided');
    }
    
    try {
        const response = await fetch(`get.php?id=${encodeURIComponent(reportId)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching report:', error);
        throw error;
    }
}

// Fetch latest report
async function fetchLatestReport() {
    try {
        const response = await fetch('get.php');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching latest report:', error);
        throw error;
    }
}

// Clear all form fields
function clearForm() {
    const elements = document.querySelectorAll('input, textarea');
    elements.forEach(element => {
        element.value = '';
        if (element.tagName === 'TEXTAREA') {
            autoExpand(element);
        }
    });
}

// Show loading state
function showLoading(show = true) {
    if (show) {
        document.body.style.cursor = 'wait';
        // You can also show a loading spinner if you have one
        const loader = document.getElementById('loading-indicator');
        if (loader) loader.style.display = 'block';
    } else {
        document.body.style.cursor = 'default';
        const loader = document.getElementById('loading-indicator');
        if (loader) loader.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    // You can customize this to show errors in a specific element
    console.error(message);
    alert('Error: ' + message);
}

// Main function to load and display report by ID
async function loadReportById(reportId) {
    try {
        showLoading(true);
        const result = await fetchReportById(reportId);
        
        if (result.success && result.data) {
            populateForm(result.data);
        } else {
            showError('No data found for ID: ' + reportId);
        }
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Main function to load and display latest report
async function loadLatestReport() {
    try {
        showLoading(true);
        const result = await fetchLatestReport();
        
        if (result.success && result.data) {
            populateForm(result.data);
            // Optionally update the report ID input if it exists
            const reportIdInput = document.getElementById('report_id');
            if (reportIdInput && result.data.id) {
                reportIdInput.value = result.data.id;
            }
        } else {
            showError('No records found');
        }
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Initialize the module when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAutoExpand();
    
    // Optional: Automatically load the latest report when page loads
    // Uncomment the line below if you want to load the latest report automatically
    // loadLatestReport();
});

// Export functions for use in HTML (if using modules)
// For non-module usage, these functions are available globally