const expression = document.getElementById('expression');
const result = document.getElementById('result');
const calculatorButtons = document.querySelector('.buttons').querySelectorAll('button');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');
const themeToggle = document.getElementById('calc-theme-toggle');
const modeToggle = document.getElementById('calc-mode-toggle');
const memoryIndicator = document.getElementById('memoryIndicator');
const errorDisplay = document.getElementById('errorDisplay');
const conversionType = document.getElementById('conversionType');
const conversionInputs = document.getElementById('conversionInputs');
const fromValue = document.getElementById('fromValue');
const fromUnit = document.getElementById('fromUnit');
const toUnit = document.getElementById('toUnit');
const convertBtn = document.getElementById('convert');
const conversionResult = document.getElementById('conversionResult');
const angleModeToggle = document.getElementById('angle-mode-toggle');
const angleModeDisplay = document.getElementById('angleMode');
const memorySlots = document.querySelectorAll('.memory-slot');
const memoryList = document.getElementById('memoryList');
const clearAllMemoryBtn = document.getElementById('clearAllMemory');
const memoryCountDisplay = document.getElementById('memoryCount');

let currentInput = '';
let currentOperation = null;
let previousInput = '';
let expressionString = '';
let memoryValue = 0;
let history = [];
let isDarkTheme = false;
let isScientificMode = false;
let isRadianMode = false;
let bracketCount = 0;
let memoryValues = {
    M1: 0,
    M2: 0,
    M3: 0
};
let activeMemorySlot = 'M1';
let memoryHistory = [];

const PI = Math.PI;
const E = Math.E;

const conversionUnits = {
    length: {
        units: ['meter', 'kilometer', 'centimeter', 'millimeter', 'inch', 'foot', 'yard', 'mile'],
        conversions: {
            meter: 1,
            kilometer: 1000,
            centimeter: 0.01,
            millimeter: 0.001,
            inch: 0.0254,
            foot: 0.3048,
            yard: 0.9144,
            mile: 1609.344
        }
    },
    weight: {
        units: ['kilogram', 'gram', 'milligram', 'pound', 'ounce'],
        conversions: {
            kilogram: 1,
            gram: 0.001,
            milligram: 0.000001,
            pound: 0.45359237,
            ounce: 0.028349523125
        }
    },
    temperature: {
        units: ['celsius', 'fahrenheit', 'kelvin'],
        isTemperature: true
    }
};

themeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDarkTheme = !isDarkTheme;
    document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    themeToggle.textContent = isDarkTheme ? '☀️' : '🌙';
});

modeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isScientificMode = !isScientificMode;
    document.querySelector('.calculator').classList.toggle('scientific-mode');
    modeToggle.textContent = isScientificMode ? '🔢' : '🔬';
});

conversionType.addEventListener('change', () => {
    const type = conversionType.value;
    if (type === 'none') {
        conversionInputs.classList.add('hidden');
        return;
    }
    
    conversionInputs.classList.remove('hidden');
    const units = conversionUnits[type].units;
    
    fromUnit.innerHTML = units.map(unit => `<option value="${unit}">${unit}</option>`).join('');
    toUnit.innerHTML = units.map(unit => `<option value="${unit}">${unit}</option>`).join('');
});

convertBtn.addEventListener('click', () => {
    const type = conversionType.value;
    const value = parseFloat(fromValue.value);
    const from = fromUnit.value;
    const to = toUnit.value;
    
    if (isNaN(value)) {
        showError('Please enter a valid number');
        return;
    }
    
    let result;
    if (conversionUnits[type].isTemperature) {
        result = convertTemperature(value, from, to);
    } else {
        const baseValue = value * conversionUnits[type].conversions[from];
        result = baseValue / conversionUnits[type].conversions[to];
    }
    
    conversionResult.textContent = `${value} ${from} = ${result.toFixed(4)} ${to}`;
});

function convertTemperature(value, from, to) {
    let celsius;
    
    switch(from) {
        case 'celsius':
            celsius = value;
            break;
        case 'fahrenheit':
            celsius = (value - 32) * 5/9;
            break;
        case 'kelvin':
            celsius = value - 273.15;
            break;
    }
    
    switch(to) {
        case 'celsius':
            return celsius;
        case 'fahrenheit':
            return (celsius * 9/5) + 32;
        case 'kelvin':
            return celsius + 273.15;
    }
}

function showError(message) {
    errorDisplay.textContent = message;
    setTimeout(() => {
        errorDisplay.textContent = '';
    }, 3000);
}

function handleScientific(operation) {
    const value = parseFloat(currentInput);
    
    try {
        switch(operation) {
            case 'sin':
            case 'cos':
            case 'tan':
            case 'asin':
            case 'acos':
            case 'atan':
                currentInput = calculateTrig(operation, value).toString();
                break;
            case 'sinh':
                currentInput = Math.sinh(value).toString();
                break;
            case 'cosh':
                currentInput = Math.cosh(value).toString();
                break;
            case 'tanh':
                currentInput = Math.tanh(value).toString();
                break;
            case 'π':
                currentInput = PI.toString();
                break;
            case 'e':
                currentInput = E.toString();
                break;
            case 'log':
                if (value <= 0) throw new Error('Invalid input for logarithm');
                currentInput = Math.log10(value).toString();
                break;
            case 'ln':
                if (value <= 0) throw new Error('Invalid input for natural logarithm');
                currentInput = Math.log(value).toString();
                break;
            case '!':
                if (value < 0 || !Number.isInteger(value)) {
                    throw new Error('Factorial only works with non-negative integers');
                }
                currentInput = factorial(value).toString();
                break;
            case '√':
                if (value < 0) throw new Error('Cannot calculate square root of negative number');
                currentInput = Math.sqrt(value).toString();
                break;
            case 'x²':
                currentInput = Math.pow(value, 2).toString();
                break;
            case 'xʸ':
                if (currentOperation) calculate();
                currentOperation = '^';
                previousInput = currentInput;
                currentInput = '';
                break;
            case '|x|':
                currentInput = Math.abs(value).toString();
                break;
            case '⌊x⌋':
                currentInput = Math.floor(value).toString();
                break;
            case '⌈x⌉':
                currentInput = Math.ceil(value).toString();
                break;
            case 'rnd':
                currentInput = Math.random().toString();
                break;
            case '(':
                handleBracket('(');
                return;
            case ')':
                handleBracket(')');
                return;
        }
        updateDisplay();
    } catch (error) {
        showError(error.message);
    }
}

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

function calculateTrig(operation, value) {
    if (!isRadianMode) {
        value = value * Math.PI / 180;
    }
    
    let result;
    switch(operation) {
        case 'sin':
            result = Math.sin(value);
            break;
        case 'cos':
            result = Math.cos(value);
            break;
        case 'tan':
            result = Math.tan(value);
            break;
        case 'asin':
            result = Math.asin(value);
            break;
        case 'acos':
            result = Math.acos(value);
            break;
        case 'atan':
            result = Math.atan(value);
            break;
    }
    
    if (!isRadianMode && ['asin', 'acos', 'atan'].includes(operation)) {
        result = result * 180 / Math.PI;
    }
    
    return result;
}

function handleBracket(bracket) {
    if (bracket === '(') {
        if (currentInput !== '' && !currentOperation) {
            currentOperation = '×';
            previousInput = currentInput;
            expressionString += ' × ';
        }
        bracketCount++;
        expressionString += '(';
    } else if (bracket === ')' && bracketCount > 0) {
        bracketCount--;
        if (currentInput !== '') {
            expressionString += currentInput;
        }
        expressionString += ')';
        if (bracketCount === 0) {
            calculate();
        }
    }
    updateDisplay();
}

function handleMemory(operation) {
    const currentValue = parseFloat(currentInput) || 0;
    
    switch(operation) {
        case 'MC':
            memoryValues[activeMemorySlot] = 0;
            addToMemoryHistory('Clear', activeMemorySlot, 0);
            break;
        case 'MR':
            currentInput = memoryValues[activeMemorySlot].toString();
            break;
        case 'M+':
            memoryValues[activeMemorySlot] += currentValue;
            addToMemoryHistory('Add', activeMemorySlot, currentValue);
            break;
        case 'M-':
            memoryValues[activeMemorySlot] -= currentValue;
            addToMemoryHistory('Subtract', activeMemorySlot, currentValue);
            break;
    }
    updateMemorySlotDisplay();
    updateDisplay();
}

function addToMemoryHistory(operation, slot, value) {
    const historyItem = {
        operation,
        slot,
        value,
        result: memoryValues[slot],
        timestamp: new Date().toLocaleTimeString()
    };
    memoryHistory.unshift(historyItem);
    updateMemoryHistoryDisplay();
}

function updateMemoryHistoryDisplay() {
    memoryList.innerHTML = '';
    memoryHistory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'memory-item';
        div.innerHTML = `
            <span class="slot-label">${item.slot}</span>
            <span>${item.operation}: ${item.value}</span>
            <span>${item.timestamp}</span>
        `;
        memoryList.appendChild(div);
    });
}

function clearAllMemory() {
    memoryValues = { M1: 0, M2: 0, M3: 0 };
    memoryHistory = [];
    updateMemorySlotDisplay();
    updateMemoryHistoryDisplay();
}

function copyToClipboard() {
    navigator.clipboard.writeText(currentInput)
        .then(() => {
            const copyBtn = document.querySelector('.copy');
            copyBtn.textContent = '✓';
            setTimeout(() => {
                copyBtn.textContent = '📋';
            }, 1000);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
        });
}

function addToHistory(expr, result) {
    const historyItem = {
        expression: expr,
        result: result,
        timestamp: new Date().toLocaleTimeString()
    };
    history.unshift(historyItem);
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';
    history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div>${item.expression} = ${item.result}</div>
            <small>${item.timestamp}</small>
        `;
        div.addEventListener('click', () => {
            currentInput = item.result;
            updateDisplay();
        });
        historyList.appendChild(div);
    });
}

clearHistoryBtn.addEventListener('click', () => {
    history = [];
    updateHistoryDisplay();
});

document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    if (/[0-9.]/.test(key)) {
        handleNumber(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
        const operatorMap = {
            '*': '×',
            '/': '÷'
        };
        handleOperator(operatorMap[key] || key);
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape') {
        clear();
    } else if (key === 'Backspace') {
        currentInput = currentInput.slice(0, -1);
        updateDisplay();
    }
});

calculatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;

        if (value >= '0' && value <= '9' || value === '.') {
            handleNumber(value);
        } else if (value === 'C') {
            clear();
        } else if (value === '±') {
            toggleSign();
        } else if (value === '%') {
            calculatePercentage();
        } else if (value === '=') {
            calculate();
        } else if (value === '📋') {
            copyToClipboard();
        } else if (['MC', 'MR', 'M+', 'M-'].includes(value)) {
            handleMemory(value);
        } else if (['sin', 'cos', 'tan', 'π', 'e', 'log', 'ln', '!', '√', 'x²', 'xʸ'].includes(value)) {
            handleScientific(value);
        } else {
            handleOperator(value);
        }
        updateDisplay();
    });
});

function handleNumber(num) {
    if (num === '.' && currentInput.includes('.')) return;
    if (currentInput === '0' && num !== '.') {
        currentInput = num;
    } else {
        currentInput += num;
    }
    updateExpression();
}

function handleOperator(op) {
    if (currentInput === '') return;
    
    if (previousInput !== '') {
        calculate();
    }
    
    currentOperation = op;
    previousInput = currentInput;
    currentInput = '';
    updateExpression();
}

function calculate() {
    if (previousInput === '' || currentInput === '') return;
    
    let computation;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    switch (currentOperation) {
        case '+':
            computation = prev + current;
            break;
        case '-':
            computation = prev - current;
            break;
        case '×':
            computation = prev * current;
            break;
        case '÷':
            if (current === 0) {
                alert('Cannot divide by zero!');
                clear();
                return;
            }
            computation = prev / current;
            break;
        case '^':
            computation = Math.pow(prev, current);
            break;
        default:
            return;
    }
    
    const result = computation.toString();
    addToHistory(expressionString, result);
    
    currentInput = result;
    currentOperation = null;
    previousInput = '';
    expressionString = '';
}

function clear() {
    currentInput = '';
    previousInput = '';
    currentOperation = null;
    expressionString = '';
}

function toggleSign() {
    if (currentInput !== '') {
        currentInput = (parseFloat(currentInput) * -1).toString();
        updateExpression();
    }
}

function calculatePercentage() {
    if (currentInput !== '') {
        currentInput = (parseFloat(currentInput) / 100).toString();
        updateExpression();
    }
}

function updateExpression() {
    if (currentOperation) {
        expressionString = `${previousInput} ${currentOperation} ${currentInput}`;
    } else {
        expressionString = currentInput;
    }
    expression.value = expressionString || '0';
}

function updateDisplay() {
    result.value = currentInput || '0';
    updateExpression();
}

function updateMemorySlotDisplay() {
    memorySlots.forEach(slot => {
        slot.classList.toggle('active', slot.id === activeMemorySlot);
    });
    updateMemoryCount();
}

function updateMemoryCount() {
    const activeMemories = Object.values(memoryValues).filter(v => v !== 0).length;
    memoryCountDisplay.textContent = activeMemories > 0 ? `M(${activeMemories})` : '';
    memoryIndicator.style.opacity = activeMemories > 0 ? '1' : '0.3';
}

angleModeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isRadianMode = !isRadianMode;
    angleModeToggle.textContent = isRadianMode ? 'RAD' : 'DEG';
    angleModeDisplay.textContent = isRadianMode ? 'RAD' : 'DEG';
});

memorySlots.forEach(slot => {
    slot.addEventListener('click', () => {
        activeMemorySlot = slot.id;
        updateMemorySlotDisplay();
    });
});

updateMemorySlotDisplay();
updateMemoryCount();

updateDisplay(); 