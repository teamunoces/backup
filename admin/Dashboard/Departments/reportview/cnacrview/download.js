function downloadPDF() {
    // Get the report container element
    const reportContainer = document.querySelector('.report-container');
    const buttons = document.querySelector('.buttons');
    const iframes = document.querySelectorAll('iframe');
    const removedIframes = [];
    
    // Store original display values
    const originalButtonDisplay = buttons ? buttons.style.display : '';
    const originalIframeDisplays = [];
    
    // Hide buttons and iframes temporarily
    if (buttons) buttons.style.display = 'none';
    
      iframes.forEach((frame) => {
        removedIframes.push({
            parent: frame.parentNode,
            element: frame,
            nextSibling: frame.nextSibling
        });
        frame.parentNode.removeChild(frame);
    });
        
    // Get the current date for filename
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `CNA_Consolidated_Report_${dateStr}.pdf`;
    
    // Options for HTML2PDF
    const options = {
       margin: [0.0, 0.0, 0.0, 0.0], // smaller margins
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
    
    // Show loading indicator
    showLoadingIndicator();

    
    
    // Use html2pdf to generate PDF
    html2pdf().set(options).from(reportContainer).save().then(() => {
        // Restore buttons and iframes
        if (buttons) buttons.style.display = originalButtonDisplay;
        
        iframes.forEach((frame, index) => {
            frame.style.display = originalIframeDisplays[index] || '';
        });
        
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
        
        hideLoadingIndicator();
    });
}

// Loading indicator functions
function showLoadingIndicator() {
    // Create loading overlay if it doesn't exist
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

// Alternative method using window.print with PDF printer
function printAsPDF() {
    // This will open the print dialog where user can select "Save as PDF"
    const buttons = document.querySelectorAll('.buttons');
    const iframes = document.querySelectorAll('iframe');
    
    buttons.forEach(btn => btn.style.display = 'none');
    iframes.forEach(frame => frame.style.display = 'none');
    
    window.print();
    
    // Restore after a short delay
    setTimeout(() => {
        buttons.forEach(btn => btn.style.display = '');
        iframes.forEach(frame => frame.style.display = '');
    }, 1000);
}

// Initialize PDF download button when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadPDF');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPDF);
    }
});

// Make functions globally available
window.downloadPDF = downloadPDF;
window.printAsPDF = printAsPDF;