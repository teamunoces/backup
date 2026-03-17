const barangaySelect = document.getElementById('barangaySelect');
const semesterSelect = document.getElementById('semesterSelect');
const schoolYearSelect = document.getElementById('schoolYearSelect');

const h2 = document.getElementById('titleH2');
const h3Semester = document.getElementById('titleH3Semester');
const psemester = document.getElementById('psemester');
const h3Date = document.getElementById('titleH3Date');

// Function to format date nicely
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Update header dynamically
function updateHeader() {
    const barangay = barangaySelect.value;
    const semester = semesterSelect.value;
    const schoolYear = schoolYearSelect.value;

    h2.textContent = `Barangay ${barangay}, NASIPIT, AGUSAN DEL NORTE`;
    h3Semester.textContent = `${semester}, A.Y. ${schoolYear}`;
    

    // Automatically set today's date
    const today = new Date();
    h3Date.textContent = `Conducted on ${formatDate(today)}`;
}

// Event listeners
[barangaySelect, semesterSelect, schoolYearSelect].forEach(select => {
    select.addEventListener('change', updateHeader);
});

// Initialize header on page load
updateHeader();


const tx = document.getElementsByClassName("introText");
for (let i = 0; i < tx.length; i++) {
  tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
  tx[i].addEventListener("input", OnInput, false);
}

function OnInput() {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
}