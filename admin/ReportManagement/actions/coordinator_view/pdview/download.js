/**
 * Download PDF functionality for SMCC Program Design Form
 * Uses html2pdf library to generate PDF with proper formatting
 */

document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadPDF');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPDF);
    }
});

function downloadPDF() {
    // Show loading state
    const downloadBtn = document.getElementById('downloadPDF');
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = 'Generating PDF...';
    downloadBtn.disabled = true;
    
    // Get the form container
    const element = document.querySelector('.form-container');
    
    // Store original display values
    const sidebarFrame = document.getElementById('sidebarFrame');
    const headerFrame = document.getElementById('headerFrame');
    const buttons = document.querySelector('.buttons');
    
    // Hide elements for PDF generation
    if (sidebarFrame) sidebarFrame.style.display = 'none';
    if (headerFrame) headerFrame.style.display = 'none';
    if (buttons) buttons.style.display = 'none';
    
    // Adjust main container for PDF
    const formContainer = document.querySelector('.form-container');
    const originalMargin = formContainer.style.marginTop;
    formContainer.style.marginTop = '20px';
    
    // Get the title for the PDF filename
    const titleInput = document.getElementById('title_of_activity');
    const reportId = document.getElementById('currentReportId')?.value || '';
    const fileName = titleInput && titleInput.value ? 
        `Program_Design_${titleInput.value.replace(/\s+/g, '_')}` : 
        `Program_Design_${reportId || 'form'}`;
    
    // Configure PDF options
    const opt = {
        margin:        [0.5, 0.5, 0.5, 0.5], // top, right, bottom, left margins in inches
        filename:      `${fileName}.pdf`,
        image:         { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2,
            letterRendering: true,
            useCORS: true,
            logging: false,
            allowTaint: false,
            backgroundColor: '#ffffff'
        },
        jsPDF:        { 
            unit: 'in', 
            format: 'letter', 
            orientation: 'landscape' 
        },
        pagebreak:    { 
            mode: ['css', 'legacy'],
            before: '.page-break',
            after: ['footer'],
            avoid: ['tr', 'img', '.signature-group', '.approval-centered']
        }
    };
    
    // Ensure all styles are preserved in PDF
    const preserveStyles = () => {
        // Force color preservation
        const style = document.createElement('style');
        style.id = 'pdf-color-preserve';
        style.innerHTML = `
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .program-table th {
                background-color: #d9d9d9 !important;
            }
            .doc-header td.label {
                background-color: #002060 !important;
                color: white !important;
            }
            .double-line {
                border-top: 4px double #4f81bd !important;
            }
            .college-info h1 {
                color: #4f81bd !important;
            }
        `;
        document.head.appendChild(style);
        return style;
    };
    
    const colorStyle = preserveStyles();
    
    // Generate PDF
    html2pdf().set(opt).from(element).save()
        .then(() => {
            // Restore original display
            if (sidebarFrame) sidebarFrame.style.display = '';
            if (headerFrame) headerFrame.style.display = '';
            if (buttons) buttons.style.display = '';
            formContainer.style.marginTop = originalMargin;
            if (colorStyle) colorStyle.remove();
            
            // Reset button state
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        })
        .catch(error => {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
            
            // Restore original display
            if (sidebarFrame) sidebarFrame.style.display = '';
            if (headerFrame) headerFrame.style.display = '';
            if (buttons) buttons.style.display = '';
            formContainer.style.marginTop = originalMargin;
            if (colorStyle) colorStyle.remove();
            
            // Reset button state
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        });
}

// Add page break helper class if needed
document.addEventListener('DOMContentLoaded', function() {
    // Add page break before document info if content is long
    const documentInfo = document.querySelector('.document-info');
    if (documentInfo) {
        const pageBreak = document.createElement('div');
        pageBreak.className = 'page-break';
        pageBreak.style.pageBreakBefore = 'always';
        documentInfo.parentNode.insertBefore(pageBreak, documentInfo);
    }
});