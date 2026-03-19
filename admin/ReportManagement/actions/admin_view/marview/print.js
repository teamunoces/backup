/**
 * print.js - Handles printing functionality for Monthly Accomplishment Report
 * Ensures proper layout, preserves all colors, and hides iframes/buttons during print
 */

function printReport() {
    // Store original title
    const originalTitle = document.title;
    
    // Set print-specific title
    document.title = "Monthly_Accomplishment_Report";
    
    // Add a print-specific stylesheet to ensure colors are preserved
    addPrintStyles();
    
    // Trigger browser print dialog
    window.print();
    
    // Restore original title and remove temporary styles after print dialog closes
    setTimeout(() => {
        document.title = originalTitle;
        removePrintStyles();
    }, 100);
}

/**
 * Add comprehensive print styles that preserve all colors
 */
function addPrintStyles() {
    // Remove any existing print style to avoid conflicts
    removePrintStyles();
    
    // Create comprehensive print stylesheet
    const style = document.createElement('style');
    style.id = 'print-preserve-colors';
    style.textContent = `
        @media print {
            /* Hide iframes and buttons */
            #headerFrame,
            #sidebarFrame,
            .buttons,
            #downloadPDF {
                display: none !important;
            }
            
            /* Reset body margins for print */
            body {
                margin-left: 0 !important;
                margin-top: 0 !important;
                background-color: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            
            /* Ensure report container uses full width with proper colors */
            .report-container {
                max-width: 90% !important;
                margin: 0 auto !important;
                box-shadow: none !important;
                padding: 20px !important;
                background-color: white !important;
            }
            
            /* Preserve ALL colors - THIS IS CRITICAL FOR DOCUMENT INFO SECTION */
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            
            /* Header colors */
            .college-info h1 { 
                color: #4f81bd !important; 
            }
            
            .office-title { 
                color: #595959 !important; 
            }
            
            .double-line { 
                border-top: 4px double #4f81bd !important; 
            }
            .input_cell{
                width: 50% !important;
            }
            
            /* Table header colors */
            .main-table th { 
                background-color: #e0e0e0 !important; 
                color: #333 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            /* DOCUMENT INFO SECTION - NAVY BLUE BACKGROUND */
            .doc-header td.label {
                background-color: #002060 !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .doc-header td:nth-child(2) {
                background-color: white !important;
                color: black !important;
            }
            
            .doc-header td.value {
                background-color: white !important;
                color: #333 !important;
            }
            
            /* Ensure the document info section maintains its styling */
            .document-info {
                width: 30% !important;
                margin-top: 50px !important;
            }
            
            .doc-header {
                border-collapse: collapse !important;
                border: 1px solid #d1d1d1 !important;
            }
            
            /* Signature lines and underlines */
            .signature-line {
                border-bottom: 1.5px solid black !important;
            }
            
            .name-underlined {
                text-decoration: underline !important;
            }
            
            /* Input fields - remove borders for cleaner print */
            input[type="text"] {
                border: none !important;
                background: transparent !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            /* Preserve any background colors in tables */
            .header-table td {
                background-color: white !important;
            }
            
            /* Ensure all borders are visible */
            table, th, td {
                border-color: #000 !important;
            }
            
            /* Page break handling */
            .approvals-container {
                page-break-inside: avoid;
            }
            
            .document-info {
                page-break-inside: avoid;
            }
            
            /* Ensure tables don't break awkwardly */
            table {
                page-break-inside: auto;
            }
            
            tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            
            thead {
                display: table-header-group;
            }
            
            tfoot {
                display: table-footer-group;
            }
            
            /* Footer logos */
            .footer-logos img {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
        
        @page {
            size: A4;
            margin: 20mm;
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Remove temporary print styles
 */
function removePrintStyles() {
    const existingStyle = document.getElementById('print-preserve-colors');
    if (existingStyle) {
        existingStyle.remove();
    }
}

// Make function globally available
window.printReport = printReport;