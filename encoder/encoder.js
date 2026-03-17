// encoder.js - JavaScript for mobile touch interactions on Barangay Selection page

document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const minSwipeDistance = 50; // Minimum distance for swipe detection

    // Add touch event listeners to each card for selecting (tapping)
    cards.forEach(card => {
        card.addEventListener('touchstart', handleTouchStart, { passive: false });
        card.addEventListener('touchmove', handleTouchMove, { passive: false });
        card.addEventListener('touchend', handleTouchEnd, { passive: false });
    });

    // Handle touch start for selecting and scrolling
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        // Add visual feedback for selection (e.g., highlight)
        e.currentTarget.classList.add('touched');
    }

    // Handle touch move for scrolling (prevent default if it's a swipe, but allow scroll)
    function handleTouchMove(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        // Calculate distance
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        // If it's a vertical scroll, allow it; if horizontal swipe, prevent default
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            e.preventDefault(); // Prevent horizontal swipe from triggering scroll
        }
    }

    // Handle touch end for selecting or navigating
    function handleTouchEnd(e) {
        e.currentTarget.classList.remove('touched');
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Check for swipe gestures (e.g., swipe left/right for navigation)
        if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                // Swipe right - perhaps go to previous page or action
                console.log('Swiped right');
                // Example: Navigate to a previous section or alert
                alert('Swiped right - could navigate back');
            } else {
                // Swipe left - perhaps go to next page or action
                console.log('Swiped left');
                // Example: Navigate to a next section or alert
                alert('Swiped left - could navigate forward');
            }
        } else if (Math.abs(deltaY) < minSwipeDistance) {
            // If no significant swipe, treat as tap for selecting
            const link = e.currentTarget.querySelector('a');
            if (link) {
                // Simulate click for navigation
                link.click();
            }
        }
    }

    // Ensure smooth scrolling for mobile
    document.body.style.overflowX = 'hidden'; // Prevent horizontal scroll
    document.body.style.webkitOverflowScrolling = 'touch'; // Smooth scrolling on iOS
});

// Set default date to today
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('dataDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today;
    
    // Add toggle button event listener
    document.getElementById('toggleDataEntry').addEventListener('click', toggleDataEntry);
});

//Add Barangay Data ____________________________________________
document.addEventListener('DOMContentLoaded', () => {

    /* ================= DATE DEFAULT ================= */
    const dateInput = document.getElementById('dataDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.max = today;
    }

    /* ================= TOGGLE BUTTON ================= */
    const toggleBtn = document.getElementById('toggleDataEntry');
    if (toggleBtn) toggleBtn.addEventListener('click', toggleDataEntry);

    /* ================= FORM SUBMIT ================= */
    const form = document.getElementById('barangayDataForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const barangay = document.getElementById('barangaySelect').value;
            const population = document.getElementById('totalPopulation').value;
            const households = document.getElementById('households').value;

            const dataEntry = {
                barangay,
                population: parseInt(population),
                households: parseInt(households)
            };

            fetch('encoder.php?action=save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataEntry)
            })
            .then(res => res.json())
            .then(res => {
                if (res.status === "success") {
                    showSuccessMessage("Data saved successfully!");
                    clearForm();
                    viewSavedData(); // refresh table
                } else {
                    alert("Error: " + res.message);
                }
            });
        });
    }
});


/* ================= TOGGLE ================= */
function toggleDataEntry() {
    const section = document.getElementById('dataEntrySection');
    if (!section) return;
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}


/* ================= LOAD DATA ================= */
function viewSavedData() {

    fetch('encoder.php?action=get')
    .then(res => res.json())
    .then(savedData => {

        const tableBody = document.getElementById('savedDataTable');
        const section = document.getElementById('savedDataSection');

        if (!tableBody) return;

        tableBody.innerHTML = "";

        if (savedData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4">No data saved yet.</td></tr>`;
            return;
        }

        savedData.forEach(entry => {

            tableBody.innerHTML += `
            <tr>
                <td>${entry.barangay}</td>
                <td>${Number(entry.population).toLocaleString()}</td>
                <td>${Number(entry.households).toLocaleString()}</td>
                <td>
                    <button onclick="editEntry('${entry.barangay}',${entry.population},${entry.households})">Edit</button>
                   
                </td>
            </tr>
            `;
        });

        if (section) section.style.display = 'block';
    });
}
/* ================= CLOSE ================= */
function closeSavedData() {
    const section = document.getElementById('savedDataSection');
    if (section) section.style.display = 'none';
}

function closeEntryForm() {
    const section = document.getElementById('dataEntrySection');
    if (section) section.style.display = 'none';
}

/* ================= EDIT ================= */
function editEntry(barangay, population, households) {

    document.getElementById('barangaySelect').value = barangay;
    document.getElementById('totalPopulation').value = population;
    document.getElementById('households').value = households;

    document.getElementById('dataEntrySection').style.display = 'block';
}


/* ================= UI HELPERS ================= */
function showSuccessMessage(msg) {
    alert(msg);
}

function clearForm() {
    document.getElementById('barangaySelect').value = '';
    document.getElementById('totalPopulation').value = '';
    document.getElementById('households').value = '';
}