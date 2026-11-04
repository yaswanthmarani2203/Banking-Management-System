document.addEventListener('DOMContentLoaded', () => {
    const bankForm = document.getElementById('bank-form');
    const accNumberInput = document.getElementById('acc-number');
    const accHolderInput = document.getElementById('acc-holder');
    const accTypeInput = document.getElementById('acc-type');
    const accBalanceInput = document.getElementById('acc-balance');
    const originalAccInput = document.getElementById('original-acc');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const bankTableBody = document.getElementById('bank-table-body');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');

    let accounts = JSON.parse(localStorage.getItem('bank_accounts')) || [];

    // Initial render
    renderTable(accounts);

    // Form Submit Event (Handles Add & Edit)
    bankForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const accountNumber = accNumberInput.value.trim();
        const holderName = accHolderInput.value.trim();
        const accountType = accTypeInput.value;
        const balance = parseFloat(accBalanceInput.value);
        const originalAcc = originalAccInput.value;

        // Validation: Required fields and balance check
        if (!accountNumber || !holderName || !accountType || isNaN(balance)) {
            alert('Please fill out all required fields properly.');
            return;
        }

        if (originalAcc === "") {
            // Adding a new account
            const duplicate = accounts.some(acc => acc.accountNumber.toLowerCase() === accountNumber.toLowerCase());
            if (duplicate) {
                alert('An account with this Account Number already exists!');
                return;
            }
            accounts.push({ accountNumber, holderName, accountType, balance });
        } else {
            // Editing an existing account
            if (accountNumber.toLowerCase() !== originalAcc.toLowerCase()) {
                const duplicate = accounts.some(acc => acc.accountNumber.toLowerCase() === accountNumber.toLowerCase());
                if (duplicate) {
                    alert('Another account with this Account Number already exists!');
                    return;
                }
            }
            const index = accounts.findIndex(acc => acc.accountNumber === originalAcc);
            if (index !== -1) {
                accounts[index] = { accountNumber, holderName, accountType, balance };
            }
        }

        saveAndReset();
    });

    // Cancel Edit Event
    cancelBtn.addEventListener('click', () => {
        resetForm();
    });

    // Search / Filter Event
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = accounts.filter(acc => 
            acc.accountNumber.toLowerCase().includes(query) ||
            acc.holderName.toLowerCase().includes(query) ||
            acc.accountType.toLowerCase().includes(query) ||
            acc.balance.toString().includes(query)
        );
        renderTable(filtered);
    });

    // Render Table Function
    function renderTable(data) {
        bankTableBody.innerHTML = '';
        
        if (data.length === 0) {
            emptyState.style.display = 'block';
            return;
        } else {
            emptyState.style.display = 'none';
        }

        data.forEach((acc) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(acc.accountNumber)}</td>
                <td>${escapeHtml(acc.holderName)}</td>
                <td>${escapeHtml(acc.accountType)}</td>
                <td>$${Number(acc.balance).toFixed(2)}</td>
                <td>
                    <button class="btn btn-edit" onclick="window.editAccount('${acc.accountNumber}')">Edit</button>
                    <button class="btn btn-delete" onclick="window.deleteAccount('${acc.accountNumber}')">Delete</button>
                </td>
            `;
            bankTableBody.appendChild(tr);
        });
    }

    // Global Edit Function
    window.editAccount = function(accountNumber) {
        const acc = accounts.find(a => a.accountNumber === accountNumber);
        if (!acc) return;

        accNumberInput.value = acc.accountNumber;
        accHolderInput.value = acc.holderName;
        accTypeInput.value = acc.accountType;
        accBalanceInput.value = acc.balance;
        originalAccInput.value = acc.accountNumber;

        submitBtn.textContent = 'Update Account';
        cancelBtn.style.display = 'inline-block';
        accNumberInput.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Global Delete Function with Confirmation
    window.deleteAccount = function(accountNumber) {
        if (confirm(`Are you sure you want to delete the account: ${accountNumber}?`)) {
            accounts = accounts.filter(acc => acc.accountNumber !== accountNumber);
            saveAndReset();
        }
    };

    // Helper: Save to LocalStorage and Reset Form
    function saveAndReset() {
        localStorage.setItem('bank_accounts', JSON.stringify(accounts));
        renderTable(accounts);
        resetForm();
    }

    // Helper: Reset Form States
    function resetForm() {
        bankForm.reset();
        originalAccInput.value = '';
        submitBtn.textContent = 'Create Account';
        cancelBtn.style.display = 'none';
    }

    // Helper: Prevent XSS
    function escapeHtml(str) {
        return String(str).replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
});