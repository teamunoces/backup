// Add interactivity to buttons
document.addEventListener('DOMContentLoaded', function() {
    // Add click event to view all buttons
    document.querySelectorAll('.view-all-btn').forEach(button => {
        button.addEventListener('click', function() {
            
        });
    });

    // Add hover effect to table rows
    document.querySelectorAll('.assessment-table tbody tr').forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.01)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Add animation to stat cards
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.stat-card, .department-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    // Add animation to table rows
    document.querySelectorAll('.assessment-table tbody tr').forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // Stagger the animation
        setTimeout(() => {
            observer.observe(row);
        }, index * 100);
    });
    
});

async function updatePendingCount() {
    try {
        const response = await fetch('./get_barangays.php?action=pending');
        const data = await response.json();

        // Update the div showing the number
        document.querySelector('#pendingCount').innerText = data.count;
    } catch (error) {
        console.error('Error fetching pending count:', error);
    }
}

// Call the function on page load
updatePendingCount();


