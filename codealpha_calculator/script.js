/*
    script.js
    Connects a simple calculator's HTML/CSS to behavior.
    Expects HTML buttons/fields using data attributes or common classes/ids:
        - Display: .display or #display or [data-display]
        - Number buttons: [data-number]
        - Operator buttons: [data-operator]
        - Equals: [data-equals]
        - Clear: [data-clear]
        - Delete: [data-delete]
        - Decimal can be a number button containing "."
*/

(function () {
    // Elements (try several common selectors for compatibility)
    const displayEl =
        document.querySelector('.display') ||
        document.querySelector('#display') ||
        document.querySelector('[data-display]');

    const numberButtons = document.querySelectorAll('[data-number], button.number, .btn-number');
    const operatorButtons = document.querySelectorAll('[data-operator], button.operator, .btn-operator');
    const equalsButton = document.querySelector('[data-equals], button.equals, .btn-equals');
    const clearButton = document.querySelector('[data-clear], button.clear, .btn-clear');
    const deleteButton = document.querySelector('[data-delete], button.delete, .btn-delete');

    // State
    let current = '0';
    let previous = null;
    let operator = null;
    let overwrite = false; // when next number should overwrite current (after equals)
    // persistent history + theme (will only act if matching UI exists)
    let calcHistory = [];

    // Helpers
    function updateDisplay() {
        if (!displayEl) return;
        displayEl.textContent = current;
    }

    // History helpers - render only if history-list exists
    const historyListEl = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');

    function loadHistory(){
        try{
            const raw = localStorage.getItem('calc_history');
            if(raw) calcHistory = JSON.parse(raw) || [];
        }catch(e){ calcHistory = []; }
        renderHistory();
    }

    function saveHistory(){
        try{ localStorage.setItem('calc_history', JSON.stringify(calcHistory)); }catch(e){}
    }

    function addToHistory(expression, result){
        calcHistory.unshift({expression, result});
        if(calcHistory.length > 50) calcHistory.length = 50;
        saveHistory();
        renderHistory();
    }

    function renderHistory(){
        if(!historyListEl) return;
        historyListEl.innerHTML = '';
        if(calcHistory.length === 0){
            const li = document.createElement('li');
            li.style.opacity = '0.6';
            li.style.padding = '6px 8px';
            li.textContent = 'No history yet';
            historyListEl.appendChild(li);
            return;
        }
        calcHistory.forEach(item => {
            const li = document.createElement('li');
            li.style.padding = '6px 8px';
            li.style.borderBottom = '1px solid rgba(0,0,0,0.04)';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            const left = document.createElement('div');
            left.style.color = 'var(--muted)';
            left.style.fontSize = '13px';
            left.textContent = item.expression + ' =';
            const right = document.createElement('div');
            right.style.fontWeight = '600';
            right.textContent = item.result;
            li.appendChild(left);
            li.appendChild(right);
            historyListEl.appendChild(li);
        });
    }

    if(clearHistoryBtn){
        clearHistoryBtn.addEventListener('click', ()=>{
            calcHistory = [];
            saveHistory();
            renderHistory();
        });
    }

    function appendNumber(num) {
        if (overwrite) {
            current = num === '.' ? '0.' : num;
            overwrite = false;
            return;
        }
        if (num === '.' && current.includes('.')) return;
        if (current === '0' && num !== '.') current = num;
        else current = current + num;
    }

    function chooseOperator(op) {
        if (current === '') return;
        if (previous !== null) {
            compute();
        } else {
            previous = current;
        }
        operator = op;
        overwrite = true;
    }

    function compute() {
        if (operator == null || previous == null) return;
        const prev = parseFloat(previous);
        const curr = parseFloat(current);
        if (isNaN(prev) || isNaN(curr)) return;
        let result = 0;
        switch (operator) {
            case '+':
                result = prev + curr;
                break;
            case '-':
                result = prev - curr;
                break;
            case '*':
            case '×':
                result = prev * curr;
                break;
            case '/':
            case '÷':
                result = curr === 0 ? 'Error' : prev / curr;
                break;
            case '%':
                result = prev % curr;
                break;
            default:
                return;
        }
        current = String(result);
        previous = null;
        operator = null;
        overwrite = true;
        // add to history if history UI exists
        try{ if(historyListEl) addToHistory(previous, current); }catch(e){}
    }

    function clearAll() {
        current = '0';
        previous = null;
        operator = null;
        overwrite = false;
    }

    function deleteLast() {
        if (overwrite) {
            current = '0';
            overwrite = false;
            return;
        }
        if (current.length <= 1) current = '0';
        else current = current.slice(0, -1);
    }

    // Attach DOM listeners
    numberButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const v = (btn.dataset.number || btn.textContent || '').trim();
            if (!v) return;
            appendNumber(v);
            updateDisplay();
        });
    });

    operatorButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const op = (btn.dataset.operator || btn.textContent || '').trim();
            if (!op) return;
            chooseOperator(op);
            updateDisplay();
        });
    });

    if (equalsButton) {
        equalsButton.addEventListener('click', () => {
            compute();
            updateDisplay();
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            clearAll();
            updateDisplay();
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            deleteLast();
            updateDisplay();
        });
    }

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') {
            appendNumber(e.key);
            updateDisplay();
            return;
        }
        if (e.key === '.') {
            appendNumber('.');
            updateDisplay();
            return;
        }
        if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '%') {
            chooseOperator(e.key);
            updateDisplay();
            return;
        }
        if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            compute();
            updateDisplay();
            return;
        }
        if (e.key === 'Backspace') {
            deleteLast();
            updateDisplay();
            return;
        }
        if (e.key === 'Escape') {
            clearAll();
            updateDisplay();
            return;
        }
    });

    // Initialize
    loadHistory();
    updateDisplay();
})();