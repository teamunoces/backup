/**
 * Print functionality for SMCC Program Design Form
 * Hides iframes and buttons when printing, maintains layout and colors
 */

function printReport() {
    // Store original display values
    const sidebarFrame = document.getElementById('sidebarFrame');
    const headerFrame = document.getElementById('headerFrame');
    const buttons = document.querySelector('.buttons');
    
    // Hide elements for printing
    if (sidebarFrame) sidebarFrame.style.display = 'none';
    if (headerFrame) headerFrame.style.display = 'none';
    if (buttons) buttons.style.display = 'none';
    
    // Adjust main container margin for print
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.style.marginTop = '20px';
        formContainer.style.marginLeft = '0';
        formContainer.style.width = '100%';
    }
    
    // Create a style element for print-specific adjustments
    const printStyle = document.createElement('style');
    printStyle.innerHTML = `
        @media print {
            @page {
                size: landscape;
                margin: 0.5in;
            }
            
            body {
                background-color: white;
                padding: 0;
                margin: 0;
                display: block;
            }
            
            #sidebarFrame, #headerFrame, .buttons {
                display: none !important;
            }
            
            .form-container {
                margin-top: 0 !important;
                margin-left: 0 !important;
                padding: 20px !important;
                width: 100% !important;
                max-width: 100% !important;
                box-shadow: none !important;
                background-color: white !important;
            }
            
            /* Preserve all colors and styles */
            .program-table th {
                background-color: #d9d9d9 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .doc-header td.label {
                background-color: #002060 !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            /* Ensure borders and lines are printed */
            .signature-line {
                border-bottom: 1.5px solid black !important;
            }
            
            .name-underlined {
                text-decoration: underline !important;
            }
            
            .double-line {
                border-top: 4px double #4f81bd !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            /* Keep all text colors */
            .college-info h1 {
                color: #4f81bd !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            /* Ensure all content is visible */
            .program-table td[contenteditable="true"] {
                background-color: white !important;
            }
            
            /* Prevent page breaks inside important elements */
            .approvals-container, .document-info, footer {
                page-break-inside: avoid;
            }
            
            /* Ensure table rows don't break awkwardly */
            tr {
                page-break-inside: avoid;
            }
        }
    `;
    
    document.head.appendChild(printStyle);
    
    // Trigger print
    window.print();
    
    // Restore original display after printing (with a small delay)
    setTimeout(() => {
        if (sidebarFrame) sidebarFrame.style.display = '';
        if (headerFrame) headerFrame.style.display = '';
        if (buttons) buttons.style.display = '';
        if (formContainer) formContainer.style.marginTop = '';
        if (printStyle) printStyle.remove();
    }, 500);
}

// Make function globally available
window.printReport = printReport;