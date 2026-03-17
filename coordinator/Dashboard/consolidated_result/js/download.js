document.getElementById('downloadPdf').addEventListener('click', function () {
    const element = document.querySelector('.container'); 
    
    const opt = {
        margin:       10,
        filename:     'Barangay_Consiladated_Result.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            width: 1100 // Increased width for landscape aspect ratio
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }, // Changed to landscape
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
});

