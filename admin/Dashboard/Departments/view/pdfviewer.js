// PDF Viewer functionality
let currentPDFPath = '';
let currentPDFName = '';

function openPDFViewer(pdfPath, pdfName) {
    currentPDFPath = pdfPath;
    currentPDFName = pdfName;
    
    // Update modal title
    document.getElementById('pdfModalTitle').textContent = pdfName;
    
    // Get the iframe
    const pdfViewer = document.getElementById('pdfViewer');
    
    // For PDFs, we can use Google's PDF viewer as fallback
    // This often works better than direct embedding
    if (pdfPath.toLowerCase().endsWith('.pdf')) {
        // Try direct first, but have fallback ready
        pdfViewer.src = pdfPath;
        
        // Add error handler
        pdfViewer.onerror = function() {
            console.log('Direct PDF viewing failed, trying Google Viewer...');
            pdfViewer.src = 'https://docs.google.com/viewer?url=' + encodeURIComponent(pdfPath) + '&embedded=true';
        };
    } else {
        pdfViewer.src = pdfPath;
    }
    
    // Show modal
    document.getElementById('pdfModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closePDFViewer() {
    document.getElementById('pdfModal').style.display = 'none';
    document.getElementById('pdfViewer').src = ''; // Clear iframe
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function downloadPDF() {
    if (currentPDFPath) {
        // Use fetch to handle CORS and download properly
        fetch(currentPDFPath)
            .then(response => response.blob())
            .then(blob => {
                // Create blob link to download
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = currentPDFName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Download failed:', error);
                // Fallback to traditional method
                const link = document.createElement('a');
                link.href = currentPDFPath;
                link.download = currentPDFName;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    }
}

function printPDF() {
    if (currentPDFPath) {
        // Open PDF in new window and print
        const printWindow = window.open(currentPDFPath, '_blank');
        if (printWindow) {
            printWindow.onload = function() {
                setTimeout(function() {
                    printWindow.print();
                }, 500);
            };
        } else {
            alert('Popup blocker prevented opening print window. Please allow popups for this site.');
        }
    }
}

function openInNewTab() {
    if (currentPDFPath) {
        window.open(currentPDFPath, '_blank');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('pdfModal');
    if (event.target == modal) {
        closePDFViewer();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closePDFViewer();
    }
});

// Filter functionality for reports
function filterReports() {
    const reportType = document.getElementById('reportTypeFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '';
    const endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '';
    
    const reportCards = document.querySelectorAll('.report-card');
    let visibleCount = 0;
    
    reportCards.forEach(card => {
        // Get data attributes from the card
        const cardType = card.dataset.reportType;
        const cardDate = card.dataset.reportDate;
        
        let typeMatch = reportType === 'all' || cardType === reportType;
        let dateMatch = true;
        
        // Apply date filter if not 'all'
        if (dateFilter !== 'all') {
            if (dateFilter === 'custom' && startDate && endDate) {
                // Custom date range
                dateMatch = cardDate >= startDate && cardDate <= endDate;
            } else {
                // Predefined date ranges
                dateMatch = checkDateFilter(cardDate, dateFilter);
            }
        }
        
        // Show/hide based on filters
        if (typeMatch && dateMatch) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update results count
    const totalReports = reportCards.length;
    document.getElementById('resultsCount').textContent = `Showing ${visibleCount} of ${totalReports} reports`;
    
    // Show/hide no results message
    updateNoResultsMessage(visibleCount);
}

function checkDateFilter(cardDate, filter) {
    if (!cardDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const cardDateObj = new Date(cardDate);
    cardDateObj.setHours(0, 0, 0, 0);
    
    switch(filter) {
        case 'today':
            return cardDateObj.getTime() === today.getTime();
            
        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return cardDateObj >= weekAgo;
            
        case 'month':
            return cardDateObj.getMonth() === today.getMonth() && 
                   cardDateObj.getFullYear() === today.getFullYear();
            
        case 'year':
            return cardDateObj.getFullYear() === today.getFullYear();
            
        default:
            return true;
    }
}

function handleDateFilterChange() {
    const dateFilter = document.getElementById('dateFilter');
    const customDateRow = document.getElementById('customDateRow');
    
    if (dateFilter.value === 'custom') {
        customDateRow.style.display = 'flex';
    } else {
        customDateRow.style.display = 'none';
        filterReports();
    }
}

function applyCustomDate() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }
    
    if (startDate > endDate) {
        alert('Start date cannot be after end date');
        return;
    }
    
    filterReports();
}

function clearFilters() {
    // Reset selects
    document.getElementById('reportTypeFilter').value = 'all';
    document.getElementById('dateFilter').value = 'all';
    
    // Clear date inputs
    if (document.getElementById('startDate')) {
        document.getElementById('startDate').value = '';
    }
    if (document.getElementById('endDate')) {
        document.getElementById('endDate').value = '';
    }
    
    // Hide custom date range
    document.getElementById('customDateRow').style.display = 'none';
    
    // Apply filters
    filterReports();
}

function updateNoResultsMessage(visibleCount) {
    let noResultsMsg = document.querySelector('.no-results-message');
    const reportsContainer = document.querySelector('.reports-container');
    
    if (visibleCount === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.innerHTML = `
                <div class="no-reports">
                    <p>No reports match your filter criteria.</p>
                    <button class="back-button" onclick="clearFilters()">Clear Filters</button>
                </div>
            `;
            reportsContainer.appendChild(noResultsMsg);
        }
    } else {
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Make sure all report cards have data attributes
    const reportCards = document.querySelectorAll('.report-card');
    reportCards.forEach(card => {
        // Get report type from the span inside
        const typeElement = card.querySelector('.report-type');
        if (typeElement && !card.dataset.reportType) {
            card.dataset.reportType = typeElement.textContent.trim();
        }
        
        // Get date from the report-date span
        const dateElement = card.querySelector('.report-date');
        if (dateElement && !card.dataset.reportDate) {
            // Try to extract date from the formatted string
            const dateText = dateElement.textContent.trim();
            // You might need to parse this based on your date format
            // For now, we'll use a simple approach
            const dateMatch = dateText.match(/\d{4}-\d{2}-\d{2}/);
            if (dateMatch) {
                card.dataset.reportDate = dateMatch[0];
            }
        }
    });
});