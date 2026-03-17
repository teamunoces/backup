document.addEventListener("DOMContentLoaded", function () {

    const profileContainer = document.querySelector(".profile-container");
    const dropdown = document.querySelector(".dropdown");
    const logoutBtn = document.querySelector(".logout-btn");

    if (!profileContainer || !dropdown) return;

    /* Toggle dropdown */
    profileContainer.addEventListener("click", function (e) {
        e.stopPropagation();
        dropdown.classList.toggle("show");
    });

    /* Close when clicking outside */
    document.addEventListener("click", function (e) {
        if (!profileContainer.contains(e.target)) {
            dropdown.classList.remove("show");
        }
    });

    /* Logout */
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {

            /* If inside iframe */
            if (window.top !== window.self) {
                window.top.location.href = "/login/login.html";
            } else {
                window.location.href = "/login/login.html";
            }

        });
    }

});