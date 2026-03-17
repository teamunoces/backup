document.addEventListener('DOMContentLoaded', () => {
    const q = (selector) => document.querySelector(selector);

    const surveyForm = q('#surveyForm');
    if (!surveyForm) return;

    surveyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = surveyForm.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        const formData = new FormData(surveyForm); // All inputs, including textboxes, are automatically included

        try {
            const response = await fetch('php/survey.php', { method: 'POST', body: formData });
            const text = await response.text();

            let data;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error("Invalid JSON from server: " + text);
            }

            if (data.success) {
                alert("✅ Survey submitted successfully!");
                surveyForm.reset(); // resets all checkboxes and textboxes
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                alert("❌ Error: " + (data.message || "Unknown error"));
                console.error(data.error || data);
            }

        } catch (err) {
            alert("❌ Network / Server error. Check PHP or internet.");
            console.error("Survey Error:", err);
        }

        submitBtn.disabled = false;
        submitBtn.innerText = "Isumite ang Survey";
    });
});