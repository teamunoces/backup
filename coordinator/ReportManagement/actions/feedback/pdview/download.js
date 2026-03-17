/**
 * download.js - Optimized for Saint Michael College of Caraga
 */

function downloadPDF() {
    const element = document.querySelector('.form-container');

    const options = {
        margin:       [0.5, 0.5], // Top/Bottom, Left/Right in inches
        filename:     'Program_Design_Form.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2,           // Increases resolution/clarity
            useCORS: true, 
            letterRendering: true,
            scrollY: 0          // Prevents clipping if the page is scrolled
        },
        jsPDF:        { 
            unit: 'in', 
            format: 'A4', 
            orientation: 'portrait' 
        }
    };

    // Style cleanup before generation
    const originalBoxShadow = element.style.boxShadow;
    element.style.boxShadow = 'none';

    // Generate
    html2pdf().set(options).from(element).save().then(() => {
        element.style.boxShadow = originalBoxShadow;
    });
}

// Optional: Attach event listener if not using inline onclick
document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.querySelector('.btn-download'); // Add this class to your button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            downloadPDF();
        });
    }
});