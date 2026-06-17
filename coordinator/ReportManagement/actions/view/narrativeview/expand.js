/**
 * Auto-expands the textarea height and handles 
 * custom "Tab" key indentation.
 */
function autoExpand(textarea) {
    // Reset height to calculate correctly
    textarea.style.height = 'auto';
    
    // Set height to scrollHeight (content height)
    // Minimum 64px to match your original 2-line design
    const newHeight = Math.max(textarea.scrollHeight, 64);
    textarea.style.height = newHeight + 'px';
}

// Add event listeners to all writing-lines-input textareas
window.addEventListener('DOMContentLoaded', () => {
    const textareas = document.querySelectorAll('.writing-lines-input');

    textareas.forEach(textarea => {
        // Initialize height on load
        autoExpand(textarea);

        // Handle the Tab key
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                // Prevent the default behavior (focusing next element)
                e.preventDefault();

                // Get cursor position
                const start = this.selectionStart;
                const end = this.selectionEnd;

                // Set textarea value to: text before + 4 spaces + text after
                this.value = this.value.substring(0, start) + 
                             "    " + 
                             this.value.substring(end);

                // Put cursor back in the right place (start + 4)
                this.selectionStart = this.selectionEnd = start + 4;
            }
        });
    });
});