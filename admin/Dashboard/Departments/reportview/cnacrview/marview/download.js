/**
 * download.js - Handles PDF download functionality for Monthly Accomplishment Report
 * Uses html2pdf library to convert the report to PDF while maintaining ALL colors
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if html2pdf is available, if not load it dynamically
    if (typeof html2pdf === 'undefined') {
        loadHtml2PdfLibrary();
    }
    
    // Add event listener to download button
    const downloadBtn = document.getElementById('downloadPDF');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadAsPDF);
    }
});

/**
 * Dynamically load html2pdf library if not present
 */
function loadHtml2PdfLibrary() {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.html2pdf) {
            resolve();
            return;
        }
        
        // Create script element
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.integrity = 'sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==';
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';
        
        script.onload = () => {
            console.log('html2pdf library loaded successfully');
            resolve();
        };
        
        script.onerror = () => {
            console.error('Failed to load html2pdf library');
            reject(new Error('Failed to load html2pdf'));
        };
        
        document.head.appendChild(script);
    });
}

/**
 * Main function to download report as PDF with ALL colors preserved
 */
async function downloadAsPDF() {
    try {
        // Show loading indicator
        showLoadingIndicator();
        
        // Ensure html2pdf is loaded
        await loadHtml2PdfLibrary();
        
        // Get the report container element
        const element = document.querySelector('.report-container');
        
        if (!element) {
            throw new Error('Report container not found');
        }
        
        // Clone the element to avoid modifying the original during PDF generation
        const clonedElement = element.cloneNode(true);
        
        // Remove any buttons or unwanted elements from clone
        removeUnwantedElements(clonedElement);
        
        // Apply PDF-specific styling to preserve ALL colors
        applyPDFStyles(clonedElement);
        
        // Create a temporary container for the clone
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.zIndex = '-1';
        tempContainer.appendChild(clonedElement);
        document.body.appendChild(tempContainer);
        
        // Configure PDF options with color preservation
        const opt = {
            margin:        [0.5, 0.5, 0.5, 0.5], // top, right, bottom, left margins in inches
            filename:      generateFileName(),
            image:         { type: 'jpeg', quality: 1.0 },
            html2canvas:   { 
                scale: 2,
                letterRendering: true,
                useCORS: true,
                logging: false,
                backgroundColor: '#FFFFFF',
                allowTaint: false,
                foreignObjectRendering: false, // Better color preservation
                onclone: function(clonedDoc) {
                    // Ensure colors are preserved in the cloned document
                    const clonedElement = clonedDoc.querySelector('.report-container');
                    if (clonedElement) {
                        // Force color preservation
                        clonedElement.style.setProperty('-webkit-print-color-adjust', 'exact', 'important');
                        clonedElement.style.setProperty('print-color-adjust', 'exact', 'important');
                        clonedElement.style.setProperty('color-adjust', 'exact', 'important');
                    }
                }
            },
            jsPDF:         { 
                unit: 'in', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true,
                precision: 16
            },
            pagebreak:     { 
                mode: ['css', 'legacy'],
                before: '.page-break-before',
                after: '.page-break-after',
                avoid: ['tr', 'thead', 'tfoot']
            }
        };
        
        // Prepare element for PDF (handle inputs, etc.)
        prepareElementForPDF(clonedElement);
        
        // Generate PDF with color preservation
        await html2pdf()
            .from(clonedElement)
            .set(opt)
            .save();
        
        // Clean up
        document.body.removeChild(tempContainer);
        
        // Hide loading indicator
        hideLoadingIndicator();
        
    } catch (error) {
        console.error('PDF generation failed:', error);
        hideLoadingIndicator();
        alert('Failed to generate PDF. Please try again.');
    }
}

/**
 * Apply PDF-specific styles to preserve ALL colors
 */
function applyPDFStyles(element) {
    // Add a style element to the cloned document
    const style = document.createElement('style');
    style.textContent = `
        /* Force color preservation for all elements */
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        
        /* Ensure navy blue background in document info section */
        .doc-header td.label {
            background-color: #002060 !important;
            color: white !important;
        }
        
        /* Preserve header colors */
        .college-info h1 {
            color: #4f81bd !important;
        }
        
        .office-title {
            color: #595959 !important;
        }
        
        .double-line {
            border-top: 4px double #4f81bd !important;
        }
        
        /* Table header colors */
        .main-table th {
            background-color: #e0e0e0 !important;
            color: #333 !important;
        }
        
        /* Ensure borders are visible */
        table, th, td {
            border: 1px solid #000 !important;
        }
        
        /* Signature lines */
        .signature-line {
            border-bottom: 1.5px solid black !important;
        }
        
        .name-underlined {
            text-decoration: underline !important;
        }
    `;
    
    element.appendChild(style);
}

/**
 * Remove elements that shouldn't appear in PDF
 */
function removeUnwantedElements(container) {
    // Remove buttons if they were cloned
    const buttons = container.querySelectorAll('.buttons');
    buttons.forEach(btn => btn.remove());
    
    // Remove any download buttons
    const downloadBtns = container.querySelectorAll('#downloadPDF');
    downloadBtns.forEach(btn => btn.remove());
    
    // Remove any iframes
    const iframes = container.querySelectorAll('iframe');
    iframes.forEach(iframe => iframe.remove());
    
    // Add PDF-specific class
    container.classList.add('pdf-version');
}

/**
 * Prepare element for PDF generation
 */
function prepareElementForPDF(element) {
    // Ensure all inputs show their values
    const inputs = element.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        if (input.value && !input.disabled) {
            // Create a span with the input value
            const span = document.createElement('span');
            span.className = 'pdf-text-value';
            span.textContent = input.value;
            span.style.fontFamily = 'Arial, sans-serif';
            span.style.fontSize = window.getComputedStyle(input).fontSize;
            span.style.padding = '0 5px';
            input.parentNode.replaceChild(span, input);
        }
    });
    
    // Preserve contenteditable content
    const editableCells = element.querySelectorAll('td[contenteditable="true"]');
    editableCells.forEach(cell => {
        cell.setAttribute('contenteditable', 'false');
    });
    
    // Force color preservation on the container
    element.style.setProperty('-webkit-print-color-adjust', 'exact', 'important');
    element.style.setProperty('print-color-adjust', 'exact', 'important');
    element.style.setProperty('color-adjust', 'exact', 'important');
}

/**
 * Generate filename with current date
 */
function generateFileName() {
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const month = document.getElementById('month')?.value || 'Month';
    const department = document.getElementById('department')?.value || 'Department';
    
    // Clean filename (remove special characters)
    const cleanMonth = month.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanDept = department.replace(/[^a-zA-Z0-9]/g, '_');
    
    return `MAR_${cleanDept}_${cleanMonth}_${formattedDate}.pdf`;
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
    if (!document.getElementById('pdf-loading-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'pdf-loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        const loader = document.createElement('div');
        loader.style.cssText = `
            background: white;
            padding: 20px 40px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            color: #002060;
            border-left: 4px solid #002060;
        `;
        loader.textContent = 'Generating PDF...';
        
        overlay.appendChild(loader);
        document.body.appendChild(overlay);
    }
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
    const overlay = document.getElementById('pdf-loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Make functions globally available
window.downloadAsPDF = downloadAsPDF;