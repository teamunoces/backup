/**
 * Auto-expands the textarea height as new rows are added.
 * Handles custom "Tab" key indentation.
 */

/**
 * Adjusts textarea height based on its content.
 * When user enters a new row, scrollHeight increases -> height grows.
 * @param {HTMLTextAreaElement} textarea - The textarea element to expand
 */
function autoExpand(textarea) {
    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = 'auto';
    
    // Set height to scrollHeight (total content height)
    // Minimum 60px to match initial styling
    const newHeight = Math.max(textarea.scrollHeight, 60);
    textarea.style.height = newHeight + 'px';
}

/**
 * Attaches auto-expand and Tab key behavior to a single textarea
 * @param {HTMLTextAreaElement} textarea - The textarea element
 */
function attachTextareaBehavior(textarea) {
    // Initialize height on load (in case there's pre-filled content)
    autoExpand(textarea);
    
    // Listen for any input (typing, pasting, deleting, new lines)
    textarea.addEventListener('input', function() {
        autoExpand(this);
    });
    
    // Handle Tab key for indentation
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            // Prevent default Tab behavior (moving focus to next element)
            e.preventDefault();
            
            // Get current cursor position
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            // Insert 4 spaces at cursor position
            this.value = this.value.substring(0, start) + 
                         "    " + 
                         this.value.substring(end);
            
            // Move cursor after the inserted spaces
            this.selectionStart = this.selectionEnd = start + 4;
            
            // Manually trigger input event to ensure height updates
            this.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
}

// Initialize all dynamic textareas when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    // Select all textareas that should have auto-expand behavior
    const textareas = document.querySelectorAll('.dynamic-textarea');
    
    textareas.forEach(textarea => {
        attachTextareaBehavior(textarea);
    });
});