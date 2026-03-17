document.getElementById('downloadPDF').addEventListener('click', function () {
    const element = document.querySelector('.container');
    const reportType = document.getElementById('currentReportType').value || 'Report';

    // 1. Create a clone to fix layout issues without affecting the browser view
    const clone = element.cloneNode(true);
    
    // 2. Remove the 400px margin and sidebar gap [cite: 1, 2]
    clone.style.margin = "0";
    clone.style.padding = "20px";
    clone.style.width = "1000px"; // Set a fixed width for the "canvas" to prevent table squishing
    clone.style.boxShadow = "none";

    // 3. CRITICAL: Convert textareas to static text
    // html2pdf struggles to wrap text inside textareas
    const originalTextareas = element.querySelectorAll('textarea');
    const clonedTextareas = clone.querySelectorAll('textarea');
    
    originalTextareas.forEach((txt, index) => {
        const parent = clonedTextareas[index].parentNode;
        const replacement = document.createElement('div');
        
        // Copy the content and preserve line breaks
        replacement.innerText = txt.value;
        replacement.style.whiteSpace = "pre-wrap";
        replacement.style.wordBreak = "break-word";
        replacement.style.fontSize = "12px";
        replacement.style.lineHeight = "1.5";
        replacement.style.padding = "5px";
        
        // Restore notebook lines for top fields ONLY
        if (clonedTextareas[index].classList.contains('paper-lines')) {
            replacement.style.backgroundImage = "linear-gradient(transparent 29px, #000 30px)";
            replacement.style.backgroundSize = "100% 30px";
        }

        parent.replaceChild(replacement, clonedTextareas[index]);
    });

    // 4. PDF Configuration
    const opt = {
        margin:       [0.5, 0.3, 0.5, 0.3], // [top, left, bottom, right]
        filename:     `${reportType}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            width: 1000 // Force canvas width to prevent cropping
        },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // 5. Run generation
    html2pdf().set(opt).from(clone).save();
});