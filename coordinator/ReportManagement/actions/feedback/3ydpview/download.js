document.getElementById('downloadPDF').addEventListener('click', async () => {
    const element = document.querySelector('.container');

    // Expand iframe header fully
    const headerFrame = document.getElementById('reportHeaderFrame');
    if (headerFrame && headerFrame.contentWindow) {
        headerFrame.style.height = headerFrame.contentWindow.document.body.scrollHeight + 'px';
    }

    // Convert textareas to divs to preserve all content
    const textareas = element.querySelectorAll('textarea');
    const textareaReplacements = [];
    textareas.forEach(t => {
        const div = document.createElement('div');
        div.innerHTML = t.value.replace(/\n/g, '<br>');
        div.style.fontSize = window.getComputedStyle(t).fontSize;
        div.style.width = '100%';
        div.style.lineHeight = window.getComputedStyle(t).lineHeight;
        t.parentNode.replaceChild(div, t);
        textareaReplacements.push({original: t, replacement: div});
    });

    // PDF options
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5], // inches
        filename: '3-Year_Development_Plan.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            scrollY: -window.scrollY,
            windowWidth: document.body.scrollWidth,
            windowHeight: document.body.scrollHeight
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Generate and save PDF
    await html2pdf().set(opt).from(element).save();

    // Restore textareas after PDF
    textareaReplacements.forEach(pair => {
        pair.replacement.parentNode.replaceChild(pair.original, pair.replacement);
    });
});