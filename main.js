/* ─── LOGIN PAGE LOGIC (index.html) ───────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const pwdInput   = document.getElementById('password');
    const togglePwd  = document.getElementById('togglePwd');
    const errorMsg   = document.getElementById('errorMsg');

    if (togglePwd && pwdInput) {
        togglePwd.addEventListener('click', () => {
            const isHidden = pwdInput.type === 'password';
            pwdInput.type = isHidden ? 'text' : 'password';
            togglePwd.src = isHidden
                ? 'Assets/Images/eye-opened.png'
                : 'Assets/Images/eye-closed.png';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            //const emailOk = emailInput.value.trim().toLowerCase().endsWith('@fda.gov.us');
            const emailOk = emailInput.value.trim().length > 0;
            const pwdOk   = pwdInput.value.trim().length > 0;

            if (emailOk && pwdOk) {
                localStorage.setItem('fdaLoggedIn', 'yes');
                window.location.href = 'programs.html';
            } else {
                errorMsg.textContent = 'Invalid credentials';
            }
        });
    }

    /* ─── PROGRAM FILTER LOGIC (programs.html) ───────────── */

    const checkboxes = document.querySelectorAll('.sidebar input[type="checkbox"]');
    const cards = document.querySelectorAll('.program-card');
    const searchInput = document.getElementById('searchInput');


    if (checkboxes.length && cards.length) {

        function applyFilters() {
            const filters = {
                category: getChecked('Categories'),
                role:     getChecked('User Role'),
                risk:     getChecked('Risk Level'),
                status:   getChecked('Status')
            };
        
            const searchWords = searchInput?.value.toLowerCase().split(/\s+/).filter(Boolean) || [];
        
            cards.forEach(card => {
                const matchCategory = matchAttr(card, 'category', filters.category);
                const matchRole     = matchAttr(card, 'role', filters.role);
                const matchRisk     = matchAttr(card, 'risk', filters.risk);
                const matchStatus   = matchAttr(card, 'status', filters.status);
        
                const text = (card.textContent || '').toLowerCase();
                const matchesSearch = searchWords.length === 0 || searchWords.some(word => text.includes(word));
        
                const shouldShow =
                    (filters.category.length === 0 || matchCategory) &&
                    (filters.role.length === 0     || matchRole) &&
                    (filters.risk.length === 0     || matchRisk) &&
                    (filters.status.length === 0   || matchStatus) &&
                    matchesSearch;
        
                card.style.display = shouldShow ? 'block' : 'none';
            });
        }
        

        function getChecked(title) {
            const section = Array.from(document.querySelectorAll('.filter-group'))
                .find(group => group.querySelector('h4')?.textContent.trim() === title);
            if (!section) return [];
            return Array.from(section.querySelectorAll('input[type="checkbox"]:checked'))
                .map(cb => cb.parentNode.textContent.trim());
        }

        function matchAttr(card, key, selectedValues) {
            if (selectedValues.length === 0) return true;
            const dataValue = card.dataset[key];
            if (!dataValue) return false;
            const cardValues = dataValue.split(',').map(v => v.trim().toLowerCase());
            return selectedValues.every(val => cardValues.includes(val.toLowerCase()));
        }
        

        checkboxes.forEach(cb => cb.addEventListener('change', applyFilters));

        
        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
        
        applyFilters(); // initial run
    }

    cards.forEach(card => {
        const link = card.dataset.link;
        if (link) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                window.location.href = link;
            });
        }
    });
});
