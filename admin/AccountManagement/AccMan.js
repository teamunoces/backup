document.addEventListener('DOMContentLoaded', function () {

    const phpUrl = 'Api.php';
    const tableBody = document.querySelector('.account-table tbody');
    const filterSelect = document.getElementById('filterSelect');
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
        
        // Store ONLY active accounts by default
        // Filter out accounts that are not active (status !== 'active')
        allAccounts = data.filter(account => account.status.toLowerCase() === 'active');
        
        // Apply current filter (this will now only work with the active accounts)
        applyFilter();
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    Failed to load accounts.
                </td>
            </tr>
        `;
    }
}

    /* ================= APPLY FILTER ================= */
    function applyFilter() {
        const filterValue = filterSelect.value;
        
        let filteredAccounts = allAccounts;
        
        // Apply status filter if selected
        if (filterValue) {
            filteredAccounts = allAccounts.filter(account => 
                account.status.toLowerCase() === filterValue.toLowerCase()
            );
        }
        
        renderTable(filteredAccounts);
    }

    /* ================= RENDER TABLE ================= */
    function renderTable(accounts) {
        tableBody.innerHTML = '';

        if (accounts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;">
                        No accounts found.
                    </td>
                </tr>
            `;
            return;
        }

        accounts.forEach(account => {
            const isActive = account.status.toLowerCase() === 'active';
            const statusBadge = isActive ? 
                '<span class="badge active">Active</span>' : 
                '<span class="badge inactive">Inactive</span>';
            
            const actionButton = isActive ?
                '<button class="btn-deactivate">Deactivate</button>' :
                '<button class="btn-reactivate">Reactivate</button>';

            const row = `
                <tr data-id="${account.id}">
                    <td data-label="Username">${account.username || ''}</td>
                    <td data-label="Name">${account.name || ''}</td>
                    <td data-label="Email">${account.email || ''}</td>
                    <td data-label="Department">${account.department || ''}</td>
                    <td data-label="Role">${account.role || ''}</td>
                    <td data-label="Status">${statusBadge}</td>
                    <td data-label="Actions">${actionButton}</td>
                </tr>
            `;

            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    /* ================= FILTER EVENT LISTENER ================= */
    filterSelect.addEventListener('change', applyFilter);

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

    /* ================= UPDATE STATUS (DEACTIVATE/REACTIVATE) ================= */
    tableBody.addEventListener('click', async e => {
        const button = e.target;
        
        if (!button.classList.contains('btn-deactivate') && 
            !button.classList.contains('btn-reactivate')) return;

        const row = button.closest('tr');
        const id = row.dataset.id;
        const action = button.classList.contains('btn-deactivate') ? 'deactivate' : 'reactivate';

        try {
            const response = await fetch(phpUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=update_status&id=${id}&status_action=${action}`
            });

            const result = await response.json();
            alert(result.message);

            if (result.success) loadAccounts();
        } catch (error) {
            console.error(error);
            alert(`Failed to ${action} account.`);
        }
    });

    /* ================= INIT ================= */
    loadAccounts();
});