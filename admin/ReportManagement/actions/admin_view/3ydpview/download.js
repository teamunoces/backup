document.getElementById('downloadPDF').addEventListener('click', function () {
    const element = document.querySelector('.container');
    const reportType = document.getElementById('currentReportType').value || 'Report';

    // 1. Create a clone and strip web-only layout constraints 
    const clone = element.cloneNode(true);
    
    // Reset layout for PDF flow
    clone.style.margin = "0";
    clone.style.padding = "0";
    clone.style.width = "792px"; // Standard Letter width (8.25in) to prevent empty space 
    clone.style.boxShadow = "none";
    clone.style.display = "block";

    // 2. Fix Table Responsiveness & Content Clipping 
    const originalTextareas = element.querySelectorAll('textarea');
    const clonedTextareas = clone.querySelectorAll('textarea');
    
    originalTextareas.forEach((txt, index) => {
        const parent = clonedTextareas[index].parentNode;
        const replacement = document.createElement('div');
        
        // Preserve text content and force responsive wrapping
        replacement.innerText = txt.value;
        replacement.style.whiteSpace = "pre-wrap";
        replacement.style.wordBreak = "break-word";
        replacement.style.fontSize = "11px"; // Balanced size for table density 
        replacement.style.lineHeight = "1.4";
        replacement.style.padding = "8px 4px";
        replacement.style.width = "100%";
        replacement.style.boxSizing = "border-box";
        
        // Restore notebook lines for top fields ONLY [cite: 1]
        if (clonedTextareas[index].classList.contains('paper-lines')) {
            replacement.style.backgroundImage = "linear-gradient(transparent 29px, #000 30px)";
            replacement.style.backgroundSize = "100% 30px";
            replacement.style.fontSize = "14px";
            replacement.style.lineHeight = "30px";
        }

        parent.replaceChild(replacement, clonedTextareas[index]);
    });

    // 3. PDF Configuration
    const opt = {
        margin:       [0.4, 0.4, 0.4, 0.4], // [top, left, bottom, right]
        filename:     `${reportType}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            width: 792, // Matches clone width to eliminate side-gap
            scrollY: 0,
            scrollX: 0
        },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
        // 'avoid-all' prevents rows from being sliced in half 
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // 4. Generate
    html2pdf().set(opt).from(clone).save();
});