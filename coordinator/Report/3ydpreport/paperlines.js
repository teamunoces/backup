 function autoExpand(textarea) {
        // Reset height to calculate correctly
        textarea.style.height = 'auto';
        
        // Set new height based on the scrollHeight
        textarea.style.height = (textarea.scrollHeight) + 'px';
    }

    function handleTab(e) {
        // Check if the pressed key is 'Tab'
        if (e.key === 'Tab') {
            e.preventDefault(); // Stop the focus from leaving the textarea
            
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;

            // Set textarea value to: text before caret + 4 spaces + text after caret
            e.target.value = e.target.value.substring(0, start) + 
                             "    " + 
                             e.target.value.substring(end);

            // Put caret in the right place (after the 4 spaces)
            e.target.selectionStart = e.target.selectionEnd = start + 4;
        }
    }

    document.addEventListener("DOMContentLoaded", function() {
        const textareas = document.querySelectorAll('.paper-lines, .auto-expand');
        
        textareas.forEach(el => {
            // Run autoExpand immediately for pre-filled text
            autoExpand(el);
            
            // Add the Tab listener to each textarea
            el.addEventListener('keydown', handleTab);
        });
    });