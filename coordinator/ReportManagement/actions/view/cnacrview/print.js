function downloadPDF() {
    // Get the report container element
    const reportContainer = document.querySelector('.report-container');
    const buttons = document.querySelector('.buttons');
    const iframes = document.querySelectorAll('iframe');
    
    // Store original display values
    const originalButtonDisplay = buttons ? buttons.style.display : '';
    const originalIframeDisplays = [];
    
    // Hide buttons and iframes temporarily
    if (buttons) buttons.style.display = 'none';
    
    iframes.forEach((frame, index) => {
        originalIframeDisplays[index] = frame.style.display;
        frame.style.display = 'none';
    });
    
    // Get the current date for filename
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `CNA_Consolidated_Report_${dateStr}.pdf`;
    
    // Create a style element for PDF styling (matching the print styles)
    const pdfStyle = document.createElement('style');
    pdfStyle.innerHTML = `
        /* Tighter spacing for PDF */
        .report-container {
            box-shadow: none;
            margin-top: 0;
            width: 100%;
            max-width: 850px;
            padding: 20px 30px !important;
            background-color: white;
        }
        
        .header-content {
            margin-bottom: 5px !important;
        }
        
        .college-info h1 {
            font-size: 22px !important;
            margin-bottom: 2px !important;
            font-family: "Times New Roman", Times, serif;
            color: #4f81bd !important;
        }
        
        .college-info p {
            font-size: 9px !important;
            margin: 0 !important;
            line-height: 1.2 !important;
            color: #333 !important;
        }
        
        .college-info a {
            font-size: 10px !important;
            color: #0000EE !important;
        }
        
        .office-title {
            font-size: 14px !important;
            margin: 5px 0 2px 0 !important;
            color: #595959 !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
        }
        
        .double-line {
            border-top: 3px double #4f81bd !important;
            margin-bottom: 10px !important;
        }
        
        h1 {
            font-size: 16px !important;
            margin: 5px 0 10px 0 !important;
            text-align: center !important;
        }
        
        .header-grid {
            display: grid !important;
            grid-template-columns: 120px 1fr 120px 1fr !important;
            border: 1px solid #000 !important;
            margin-bottom: 10px !important;
        }
        
        .label-box {
            padding: 4px 6px !important;
            font-weight: bold !important;
            font-size: 12px !important;
            border-right: 1px solid #000 !important;
        }
        
        .header-grid input {
            padding: 4px 6px !important;
            font-size: 12px !important;
            border: none !important;
            outline: none !important;
            width: 100% !important;
        }
        
        .bg-gray {
            background-color: #b3b3b3 !important;
        }
        
        .section-header {
            background-color: #b3b3b3 !important;
            border: 1px solid #000 !important;
            padding: 4px 10px !important;
            font-weight: bold !important;
            font-size: 13px !important;
            margin-top: 10px !important;
            display: flex !important;
        }
        
        .roman-num {
            width: 30px !important;
        }
        
        .section-content {
            padding: 5px 0 2px 20px !important;
        }
        
        .form-group {
            margin-bottom: 3px !important;
            display: flex !important;
            flex-direction: column !important;
        }
        
        .form-group label {
            font-weight: bold !important;
            font-size: 12px !important;
            margin-bottom: 0 !important;
            color: #333 !important;
        }
        
        /* Paper lines styling */
        .paper-lines {
            width: 100% !important;
            border: none !important;
            outline: none !important;
            resize: none !important;
            font-size: 12px !important;
            line-height: 25px !important;
            padding: 0 2px !important;
            background-attachment: local !important;
            background-image: linear-gradient(to bottom, transparent 24px, #000 24px) !important;
            background-size: 100% 25px !important;
            background-repeat: repeat-y !important;
            background-color: transparent !important;
            font-family: Arial, sans-serif !important;
            overflow: hidden !important;
            min-height: 25px !important;
            color: #000 !important;
        }
        
        .paper-lines::placeholder {
            color: #ccc !important;
            font-style: italic !important;
        }
        
        /* Preserve all colors and backgrounds */
        .label-box.bg-gray,
        .section-header {
            background-color: #b3b3b3 !important;
        }
        
        /* Approval section spacing */
        .approvals-container {
            font-family: Arial, sans-serif !important;
            width: 100% !important;
            max-width: 900px !important;
            margin: 10px auto 5px auto !important;
            color: #000 !important;
        }
        
        .approval-row {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 5px !important;
        }
        
        .signature-group {
            width: 35% !important;
        }
        
        .label {
            font-weight: bold !important;
            margin-bottom: 8px !important;
            font-size: 12px !important;
        }
        
        .signature-line {
            border-bottom: 1.5px solid black !important;
            min-height: 20px !important;
            font-size: 12px !important;
            margin-bottom: 2px !important;
        }
        
        .title {
            font-size: 11px !important;
            font-weight: bold !important;
        }
        
        .bold {
            font-weight: bold !important;
        }
        
        .left-align {
            text-align: left !important;
            width: 100% !important;
        }
        
        .approval-centered {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            margin-top: 5px !important;
        }
        
        .admin-block {
            text-align: center !important;
            margin-top: 8px !important;
            margin-bottom: 2px !important;
        }
        
        .name-underlined {
            font-weight: bold !important;
            text-decoration: underline !important;
            text-transform: uppercase !important;
            font-size: 12px !important;
            min-height: 20px !important;
            display: inline-block !important;
            margin-bottom: 2px !important;
        }
        
        /* Document info table */
        .document-info {
            margin-top: 15px !important;
            width: 40% !important;
        }
        
        .doc-header {
            border-collapse: collapse !important;
            font-family: Arial, sans-serif !important;
            font-size: 10px !important;
            border: 1px solid #d1d1d1 !important;
            width: 100% !important;
        }
        
        .doc-header td {
            border: 1px solid #000 !important;
            padding: 2px 4px !important;
        }
        
        .doc-header td.label {
            background-color: #002060 !important;
            color: white !important;
            font-weight: bold !important;
            white-space: nowrap !important;
            width: 100px !important;
        }
        
        .doc-header td:nth-child(2) {
            width: 15px !important;
            text-align: center !important;
            font-weight: bold !important;
        }
        
        .doc-header td.value {
            padding: 2px 4px !important;
        }
        
        .doc-header td.value input,
        .doc-header td.value p {
            border: none !important;
            background: transparent !important;
            font-family: inherit !important;
            font-size: 10px !important;
            color: #333 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }
        
        .doc-header td.value input:disabled {
            color: black !important;
            cursor: default !important;
        }
        
        .document_type {
            margin: 0 !important;
            font-size: 10px !important;
        }
        
        /* Footer */
        footer {
            margin-top: 15px !important;
            width: 100% !important;
        }
        
        .footer-bottom {
            display: flex !important;
            align-items: flex-end !important;
            justify-content: flex-end !important;
            padding-bottom: 5px !important;
            width: 100% !important;
        }
        
        .footer-logos {
            display: flex !important;
            align-items: center !important;
            gap: 15px !important;
            margin-left: 30px !important;
        }
        
        .footer-logos img {
            height: 25px !important;
            width: auto !important;
        }
        
        /* Page break preferences */
        .section-content,
        .approvals-container,
        header {
            page-break-inside: avoid !important;
        }
    `;
    
    // Add the style to the document temporarily
    document.head.appendChild(pdfStyle);
    
    // Show loading indicator
    showLoadingIndicator();
    
    // Options for HTML2PDF
    const options = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            letterRendering: true,
            useCORS: true,
            logging: false,
            allowTaint: false,
            backgroundColor: '#ffffff'
        },
        jsPDF: { 
            unit: 'in', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
        },
        pagebreak: { mode: ['css', 'legacy'] }
    };
    
    // Ensure all images are loaded before generating PDF
    waitForImages(reportContainer).then(() => {
        // Use html2pdf to generate PDF
        html2pdf().set(options).from(reportContainer).save().then(() => {
            // Restore buttons and iframes
            if (buttons) buttons.style.display = originalButtonDisplay;
            
            iframes.forEach((frame, index) => {
                frame.style.display = originalIframeDisplays[index] || '';
            });
            
            // Remove the temporary style
            document.head.removeChild(pdfStyle);
            
            // Hide loading indicator
            hideLoadingIndicator();
        }).catch(error => {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
            
            // Restore buttons and iframes on error
            if (buttons) buttons.style.display = originalButtonDisplay;
            
            iframes.forEach((frame, index) => {
                frame.style.display = originalIframeDisplays[index] || '';
            });
            
            // Remove the temporary style
            document.head.removeChild(pdfStyle);
            
            hideLoadingIndicator();
        });
    });
}

// Loading indicator functions
function showLoadingIndicator() {
    if (!document.getElementById('pdf-loading-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'pdf-loading-overlay';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    text-align: center;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                ">
                    <div style="
                        border: 5px solid #f3f3f3;
                        border-top: 5px solid #254911;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px auto;
                    "></div>
                    <p style="
                        font-family: Arial, sans-serif;
                        font-size: 16px;
                        color: #333;
                        margin: 10px 0;
                    ">Generating PDF...</p>
                    <p style="
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                        color: #666;
                        margin: 5px 0;
                    ">Please wait while we prepare your document.</p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(overlay);
    }
}

function hideLoadingIndicator() {
    const overlay = document.getElementById('pdf-loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Function to ensure all images are loaded before PDF generation
function waitForImages(element) {
    const images = element.getElementsByTagName('img');
    const imagePromises = [];
    
    for (let img of images) {
        if (!img.complete) {
            const promise = new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
            imagePromises.push(promise);
        }
    }
    
    return Promise.all(imagePromises);
}

// Initialize PDF download button when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadPDF');
    if (downloadBtn) {
        // Remove any existing event listeners
        downloadBtn.replaceWith(downloadBtn.cloneNode(true));
        document.getElementById('downloadPDF').addEventListener('click', downloadPDF);
    }
});

// Make functions globally available
window.downloadPDF = downloadPDF;