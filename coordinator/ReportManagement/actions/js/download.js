document.getElementById("downloadPDF").addEventListener("click", async () => {
    const element = document.querySelector(".container");
    
    // Temporarily add print-specific class
    element.classList.add('for-pdf-generation');
    
    // Create a clone to avoid modifying the original
    const cloneElement = element.cloneNode(true);
    
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5], // top, right, bottom, left in inches
        filename: 'Barangay_Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            letterRendering: true,
            useCORS: true,
            logging: true
        },
        jsPDF: { 
            unit: 'in', 
            format: 'letter', 
            orientation: 'portrait' 
        },
        pagebreak: { 
            mode: ['css', 'legacy'],
            before: '.page-break',
            after: '.page-break-after',
            avoid: 'tr'
        }
    };

    try {
        // Remove the temporary class
        element.classList.remove('for-pdf-generation');
        
        // Generate PDF
        await html2pdf().set(opt).from(element).save();
        
        console.log('PDF generated successfully');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
});