document.addEventListener('DOMContentLoaded', function () {

    const phpUrl = 'Api.php';
    const tableBody = document.querySelector('.account-table tbody');
    const searchInput = document.getElementById('searchInput');
    const createAccountBtn = document.getElementById('createAccountBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeBtn = document.querySelector('.close-btn');
    const createAccountForm = document.querySelector('.modal-form');

    let allAccounts = [];

    /* ================= LOAD ACCOUNTS ================= */
    async function loadAccounts() {
        try {
            const response = await fetch(`${phpUrl}?action=get_accounts`);
            if (!response.ok) throw new Error('Failed to fetch accounts');

            const data = await response.json();

            // 🔒 ONLY KEEP ACTIVE ACCOUNTS
            allAccounts = data.filter(
                account => account.status.toLowerCase() === 'active'
            );

            renderTable(allAccounts);
        } catch (error) {
            console.error(error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;">
                        Failed to load accounts.
                    </td>
                </tr>
            `;
        }
    }

    /* ================= RENDER TABLE ================= */
    function renderTable(accounts) {
        tableBody.innerHTML = '';

        if (accounts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;">
                        No active accounts found.
                    </td>
                </tr>
            `;
            return;
        }

        accounts.forEach(account => {
            const row = `
                <tr data-id="${account.id}">
                    <td data-label="Username">${account.username}</td>
                    <td data-label="First Name">${account.name}</td>
                    <td data-label="Email">${account.email}</td>
                    <td data-label="Department">${account.department}</td>
                    <td data-label="Role">${account.role}</td>
                    <td data-label="Status">
                        <span class="badge active">Active</span>
                    </td>
                    <td data-label="Actions">
                        <button class="btn-deactivate">Deactivate</button>
                    </td>
                </tr>
            `;

            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    /* ================= SEARCH (ACTIVE ONLY) ================= */
    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();

        const filtered = allAccounts.filter(account =>
            account.username.toLowerCase().includes(term) ||
            account.email.toLowerCase().includes(term) ||
            account.department.toLowerCase().includes(term) ||
            account.role.toLowerCase().includes(term)
        );

        renderTable(filtered);
    });

    /* ================= MODAL CONTROLS ================= */
    createAccountBtn.addEventListener('click', () => {
        modalOverlay.style.display = 'flex';
    });

    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) closeModal();
    });

    function closeModal() {
        modalOverlay.style.display = 'none';
        createAccountForm.reset();
    }

    /* ================= CREATE ACCOUNT ================= */
    createAccountForm.addEventListener('submit', async e => {
        e.preventDefault();

        const formData = new FormData(createAccountForm);
        formData.append('action', 'create_account');

        try {
            const response = await fetch(phpUrl, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            alert(result.message);

            if (result.success) {
                closeModal();
                loadAccounts();
            }
        } catch (error) {
            console.error(error);
            alert('Failed to create account.');
        }
    });

    /* ================= DEACTIVATE ================= */
    tableBody.addEventListener('click', async e => {

        if (!e.target.classList.contains('btn-deactivate')) return;

        const row = e.target.closest('tr');
        const id = row.dataset.id;

        try {
            const response = await fetch(phpUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=update_status&id=${id}&status_action=deactivate`
            });

            const result = await response.json();
            alert(result.message);

            if (result.success) loadAccounts();
        } catch (error) {
            console.error(error);
            alert('Failed to deactivate account.');
        }
    });

    /* ================= INIT ================= */
    loadAccounts();

});
