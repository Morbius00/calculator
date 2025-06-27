class AdvancedCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.history = document.getElementById('history');
        this.memory = 0;
        this.soundEnabled = true;
        this.vibrationEnabled = true;
        this.isDarkTheme = false;
        this.calculationHistory = [];
        this.currentExpression = '';
        this.lastResult = 0;
        
        this.initializeEventListeners();
        this.loadSettings();
    }

    initializeEventListeners() {
        // Keyboard support
        document.addEventListener('keydown', (event) => this.handleKeyboard(event));
        
        // Button click animations
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => this.animateButton(btn));
        });
    }

    loadSettings() {
        const savedTheme = localStorage.getItem('calculatorTheme');
        const savedSound = localStorage.getItem('calculatorSound');
        const savedVibration = localStorage.getItem('calculatorVibration');
        const savedMemory = localStorage.getItem('calculatorMemory');
        
        if (savedTheme === 'dark') {
            this.toggleTheme();
        }
        
        if (savedSound === 'false') {
            this.soundEnabled = false;
            document.querySelector('.sound-toggle').classList.add('disabled');
        }
        
        if (savedVibration === 'false') {
            this.vibrationEnabled = false;
            document.querySelector('.vibration-toggle').classList.add('disabled');
        }
        
        if (savedMemory) {
            this.memory = parseFloat(savedMemory);
            this.updateMemoryIndicator();
        }
    }

    saveSettings() {
        localStorage.setItem('calculatorTheme', this.isDarkTheme ? 'dark' : 'light');
        localStorage.setItem('calculatorSound', this.soundEnabled.toString());
        localStorage.setItem('calculatorVibration', this.vibrationEnabled.toString());
        localStorage.setItem('calculatorMemory', this.memory.toString());
    }

    playSound(frequency = 800, duration = 100) {
        if (!this.soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    }

    vibrate(pattern = [50]) {
        if (this.vibrationEnabled && 'vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    animateButton(button) {
        button.classList.add('animate');
        setTimeout(() => button.classList.remove('animate'), 100);
        
        this.playSound();
        this.vibrate();
    }

    appendToDisplay(value) {
        if (this.display.value === '0' && value !== '.') {
            this.display.value = value;
        } else if (this.display.value === 'Error' || this.display.value === 'Infinity') {
            this.display.value = value;
        } else {
            this.display.value += value;
        }
        this.updateHistory();
    }

    appendFunction(func) {
        if (this.display.value === '0' || this.display.value === 'Error') {
            this.display.value = func;
        } else {
            this.display.value += func;
        }
        this.updateHistory();
    }

    updateHistory() {
        this.history.textContent = this.display.value;
    }

    clearAll() {
        this.display.value = '0';
        this.history.textContent = '';
        this.currentExpression = '';
        this.playSound(600, 150);
    }

    clearEntry() {
        this.display.value = '0';
        this.playSound(600, 100);
    }

    deleteLast() {
        if (this.display.value.length > 1) {
            this.display.value = this.display.value.slice(0, -1);
        } else {
            this.display.value = '0';
        }
        this.updateHistory();
        this.playSound(700, 80);
    }

    toggleSign() {
        const value = parseFloat(this.display.value);
        if (!isNaN(value)) {
            this.display.value = (-value).toString();
        }
    }

    calculate() {
        try {
            this.display.classList.add('calculating');
            
            setTimeout(() => {
                let expression = this.display.value
                    .replace(/×/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/sin\(/g, 'Math.sin(')
                    .replace(/cos\(/g, 'Math.cos(')
                    .replace(/tan\(/g, 'Math.tan(')
                    .replace(/log\(/g, 'Math.log10(')
                    .replace(/sqrt\(/g, 'Math.sqrt(');

                // Handle power operations
                expression = expression.replace(/\*\*/g, '**');

                const result = eval(expression);

                if (!isFinite(result)) {
                    throw new Error('Invalid calculation');
                }

                // Round to avoid floating point precision issues
                const roundedResult = Math.round(result * 1000000000) / 1000000000;
                
                // Add to history
                this.calculationHistory.push({
                    expression: this.display.value,
                    result: roundedResult,
                    timestamp: new Date()
                });

                this.display.value = roundedResult.toString();
                this.lastResult = roundedResult;
                
                this.display.classList.remove('calculating');
                this.display.classList.add('success');
                setTimeout(() => this.display.classList.remove('success'), 500);
                
                this.playSound(1000, 200);
                this.vibrate([100, 50, 100]);
                
            }, 300);

        } catch (error) {
            this.display.classList.remove('calculating');
            this.display.value = 'Error';
            this.display.classList.add('error');
            document.querySelector('.calculator').classList.add('shake');
            
            setTimeout(() => {
                this.display.classList.remove('error');
                document.querySelector('.calculator').classList.remove('shake');
            }, 500);
            
            this.playSound(300, 500);
            this.vibrate([200, 100, 200]);
        }
    }

    // Memory functions
    memoryClear() {
        this.memory = 0;
        this.updateMemoryIndicator();
        this.saveSettings();
        this.playSound(500, 100);
    }

    memoryRecall() {
        this.display.value = this.memory.toString();
        this.playSound(800, 100);
    }

    memoryAdd() {
        const value = parseFloat(this.display.value);
        if (!isNaN(value)) {
            this.memory += value;
            this.updateMemoryIndicator();
            this.saveSettings();
            this.playSound(900, 100);
        }
    }

    memorySubtract() {
        const value = parseFloat(this.display.value);
        if (!isNaN(value)) {
            this.memory -= value;
            this.updateMemoryIndicator();
            this.saveSettings();
            this.playSound(700, 100);
        }
    }

    updateMemoryIndicator() {
        let indicator = document.querySelector('.memory-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'memory-indicator';
            indicator.textContent = 'M';
            document.querySelector('.display').appendChild(indicator);
        }
        
        if (this.memory !== 0) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.body.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
        document.querySelector('.theme-toggle').textContent = this.isDarkTheme ? '☀️' : '🌙';
        this.saveSettings();
        this.playSound(600, 150);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const toggle = document.querySelector('.sound-toggle');
        
        if (this.soundEnabled) {
            toggle.classList.remove('disabled');
            toggle.textContent = '🔊';
            this.playSound(800, 100);
        } else {
            toggle.classList.add('disabled');
            toggle.textContent = '🔇';
        }
        
        this.saveSettings();
    }

    toggleVibration() {
        this.vibrationEnabled = !this.vibrationEnabled;
        const toggle = document.querySelector('.vibration-toggle');
        
        if (this.vibrationEnabled) {
            toggle.classList.remove('disabled');
            toggle.textContent = '📳';
            this.vibrate([100]);
        } else {
            toggle.classList.add('disabled');
            toggle.textContent = '📴';
        }
        
        this.saveSettings();
    }

      handleKeyboard(event) {
        const key = event.key;
        
        if (key >= '0' && key <= '9' || key === '.') {
            this.appendToDisplay(key);
        } else if (key === '+' || key === '-') {
            this.appendToDisplay(key);
        } else if (key === '*') {
            this.appendToDisplay('×');
        } else if (key === '/') {
            event.preventDefault();
            this.appendToDisplay('÷');
        } else if (key === 'Enter' || key === '=') {
            event.preventDefault();
            this.calculate();
        } else if (key === 'Escape') {
            this.clearAll();
        } else if (key === 'Backspace') {
            this.deleteLast();
        } else if (key === 'Delete') {
            this.clearEntry();
        } else if (key.toLowerCase() === 's') {
            this.appendFunction('sin(');
        } else if (key.toLowerCase() === 'c') {
            this.appendFunction('cos(');
        } else if (key.toLowerCase() === 't') {
            this.appendFunction('tan(');
        } else if (key.toLowerCase() === 'l') {
            this.appendFunction('log(');
        } else if (key.toLowerCase() === 'r') {
            this.appendFunction('sqrt(');
        } else if (key === '^') {
            this.appendToDisplay('**');
        }
        
        // Memory shortcuts
        if (event.ctrlKey) {
            switch(key.toLowerCase()) {
                case 'm':
                    event.preventDefault();
                    this.memoryAdd();
                    break;
                case 'r':
                    event.preventDefault();
                    this.memoryRecall();
                    break;
                case 'd':
                    event.preventDefault();
                    this.memoryClear();
                    break;
            }
        }
    }

    // Advanced mathematical functions
    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    // Percentage calculation
    calculatePercentage() {
        const value = parseFloat(this.display.value);
        if (!isNaN(value)) {
            this.display.value = (value / 100).toString();
        }
    }

    // Scientific notation toggle
    toggleScientificNotation() {
        const value = parseFloat(this.display.value);
        if (!isNaN(value)) {
            if (this.display.value.includes('e')) {
                this.display.value = value.toString();
            } else {
                this.display.value = value.toExponential();
            }
        }
    }

    // History management
    showHistory() {
        if (this.calculationHistory.length === 0) {
            alert('No calculation history available');
            return;
        }

        let historyText = 'Calculation History:\n\n';
        this.calculationHistory.slice(-10).forEach((calc, index) => {
            historyText += `${index + 1}. ${calc.expression} = ${calc.result}\n`;
        });

        alert(historyText);
    }

    clearHistory() {
        this.calculationHistory = [];
        localStorage.removeItem('calculatorHistory');
        this.playSound(400, 200);
    }

    // Export/Import settings
    exportSettings() {
        const settings = {
            theme: this.isDarkTheme,
            sound: this.soundEnabled,
            vibration: this.vibrationEnabled,
            memory: this.memory,
            history: this.calculationHistory
        };

        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'calculator-settings.json';
        link.click();
    }

    importSettings(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                
                this.isDarkTheme = settings.theme || false;
                this.soundEnabled = settings.sound !== false;
                this.vibrationEnabled = settings.vibration !== false;
                this.memory = settings.memory || 0;
                this.calculationHistory = settings.history || [];

                this.saveSettings();
                location.reload(); // Reload to apply all settings
            } catch (error) {
                alert('Invalid settings file');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize calculator
const calculator = new AdvancedCalculator();

// Global functions for HTML onclick events
function appendToDisplay(value) {
    calculator.appendToDisplay(value);
}

function appendFunction(func) {
    calculator.appendFunction(func);
}

function clearAll() {
    calculator.clearAll();
}

function clearEntry() {
    calculator.clearEntry();
}

function deleteLast() {
    calculator.deleteLast();
}

function toggleSign() {
    calculator.toggleSign();
}

function calculate() {
    calculator.calculate();
}

function memoryClear() {
    calculator.memoryClear();
}

function memoryRecall() {
    calculator.memoryRecall();
}

function memoryAdd() {
    calculator.memoryAdd();
}

function memorySubtract() {
    calculator.memorySubtract();
}

function toggleTheme() {
    calculator.toggleTheme();
}

function toggleSound() {
    calculator.toggleSound();
}

function toggleVibration() {
    calculator.toggleVibration();
}

// Additional utility functions
function calculatePercentage() {
    calculator.calculatePercentage();
}

function showHistory() {
    calculator.showHistory();
}

function clearHistory() {
    calculator.clearHistory();
}

function exportSettings() {
    calculator.exportSettings();
}

// Easter eggs and special features
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', (event) => {
    konamiCode.push(event.code);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        activateEasterEgg();
        konamiCode = [];
    }
});

function activateEasterEgg() {
    const calc = document.querySelector('.calculator');
    calc.style.animation = 'rainbow 2s infinite';
    
    // Add rainbow animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    calculator.display.value = '🎉 KONAMI! 🎉';
    calculator.playSound(1200, 300);
    calculator.vibrate([100, 50, 100, 50, 100]);
    
    setTimeout(() => {
        calc.style.animation = '';
        calculator.display.value = '0';
        document.head.removeChild(style);
    }, 5000);
}

// Double-tap detection for mobile
let lastTap = 0;
document.addEventListener('touchend', (event) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 500 && tapLength > 0) {
        // Double tap detected
        if (event.target.classList.contains('btn')) {
            event.target.style.transform = 'scale(1.1)';
            setTimeout(() => {
                event.target.style.transform = '';
            }, 200);
        }
    }
    lastTap = currentTime;
});

// Gesture support for mobile
let startX, startY;

document.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
});

document.addEventListener('touchend', (event) => {
    if (!startX || !startY) return;
    
    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;
    
    const diffX = startX - endX;
    const diffY = startY - endY;
    
    // Swipe detection
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left - delete last
                calculator.deleteLast();
            } else {
                // Swipe right - clear entry
                calculator.clearEntry();
            }
        }
    } else {
        if (Math.abs(diffY) > 50) {
            if (diffY > 0) {
                // Swipe up - show history
                calculator.showHistory();
            } else {
                // Swipe down - clear all
                calculator.clearAll();
            }
        }
    }
    
    startX = null;
    startY = null;
});

// Auto-save calculation history
setInterval(() => {
    if (calculator.calculationHistory.length > 0) {
        localStorage.setItem('calculatorHistory', JSON.stringify(calculator.calculationHistory));
    }
}, 30000); // Save every 30 seconds

// Load calculation history on startup
window.addEventListener('load', () => {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
        try {
            calculator.calculationHistory = JSON.parse(savedHistory);
        } catch (error) {
            console.warn('Could not load calculation history');
        }
    }
});

// Prevent context menu on long press for mobile
document.addEventListener('contextmenu', (event) => {
    if (event.target.classList.contains('btn')) {
        event.preventDefault();
    }
});

// Add visual feedback for button states
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.95)';
    });
    
    btn.addEventListener('mouseup', () => {
        btn.style.transform = '';
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
    });
});

// Initialize display
calculator.display.value = '0';

console.log('🧮 Advanced Calculator loaded successfully!');
console.log('Features: Scientific functions, Memory, Themes, Sound, Vibration, History');
console.log('Keyboard shortcuts: Numbers, operators, Enter/=, Escape, Backspace');
console.log('Memory shortcuts: Ctrl+M (add), Ctrl+R (recall), Ctrl+D (clear)');
console.log('Mobile gestures: Swipe left/right, up/down for various functions');
console.log('Easter egg: Try the Konami code! ⬆⬆⬇⬇⬅➡⬅➡BA');

