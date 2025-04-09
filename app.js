// API Key - Replace this with your actual API key from exchangerate-api.com
const API_KEY = '7d6097c0306f7dd437b3e599';
const BASE_URL = 'https://v6.exchangerate-api.com/v6/';

// DOM Elements
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const resultInput = document.getElementById('result');
const convertBtn = document.getElementById('convert-btn');
const swapBtn = document.getElementById('swap-btn');
const rateValue = document.getElementById('rate-value');
const targetCurrency = document.getElementById('target-currency');
const updateTime = document.getElementById('update-time');

// Currency data
let currencies = {};
let exchangeRates = {};

// Initialize the application
async function init() {
    try {
        // Fetch supported currencies
        const response = await fetch(`${BASE_URL}${API_KEY}/codes`);
        const data = await response.json();
        
        if (data.result === 'success') {
            // Process currency codes
            data.supported_codes.forEach(([code, name]) => {
                currencies[code] = name;
            });
            
            // Populate dropdown menus
            populateCurrencyDropdowns();
            
            // Set default currencies
            fromCurrencySelect.value = 'USD';
            toCurrencySelect.value = 'EUR';
            
            // Fetch initial exchange rates
            await fetchExchangeRates('USD');
            
            // Enable the convert button
            convertBtn.disabled = false;
        } else {
            showError('Failed to load currencies. Please check your API key.');
        }
    } catch (error) {
        showError('An error occurred during initialization. Please try again later.');
        console.error(error);
    }
}

// Populate currency dropdown menus
function populateCurrencyDropdowns() {
    const currencyCodes = Object.keys(currencies);
    
    // Sort currencies alphabetically by code
    currencyCodes.sort();
    
    // Create dropdown options
    currencyCodes.forEach(code => {
        const optionFrom = document.createElement('option');
        optionFrom.value = code;
        optionFrom.textContent = `${code} - ${currencies[code]}`;
        
        const optionTo = optionFrom.cloneNode(true);
        
        fromCurrencySelect.appendChild(optionFrom);
        toCurrencySelect.appendChild(optionTo);
    });
}

// Fetch exchange rates for a base currency
async function fetchExchangeRates(baseCurrency) {
    try {
        const response = await fetch(`${BASE_URL}${API_KEY}/latest/${baseCurrency}`);
        const data = await response.json();
        
        if (data.result === 'success') {
            // Store exchange rates
            exchangeRates = data.conversion_rates;
            
            // Update the last updated time
            const now = new Date();
            updateTime.textContent = now.toLocaleString();
            
            // Update the displayed exchange rate
            updateExchangeRateInfo();
        } else {
            showError('Failed to fetch exchange rates. Please try again later.');
        }
    } catch (error) {
        showError('An error occurred while fetching exchange rates.');
        console.error(error);
    }
}

// Update the exchange rate information display
function updateExchangeRateInfo() {
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    if (exchangeRates[toCurrency]) {
        const rate = exchangeRates[toCurrency];
        rateValue.textContent = rate.toFixed(6);
        targetCurrency.textContent = toCurrency;
    }
}

// Convert currency
function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    
    if (isNaN(amount) || amount <= 0) {
        showError('Please enter a valid amount.');
        return;
    }
    
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    if (fromCurrency === toCurrency) {
        resultInput.value = amount;
        return;
    }
    
    if (exchangeRates[toCurrency]) {
        const result = amount * exchangeRates[toCurrency];
        resultInput.value = result.toFixed(2);
    } else {
        showError('Exchange rate not available. Please try again later.');
    }
}

// Swap currencies
function swapCurrencies() {
    const tempCurrency = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = tempCurrency;
    
    // Also swap the values if a conversion was already done
    if (resultInput.value !== '') {
        const tempValue = amountInput.value;
        amountInput.value = resultInput.value;
        resultInput.value = tempValue;
    }
    
    // Fetch new exchange rates based on the new "from" currency
    fetchExchangeRates(fromCurrencySelect.value);
}

// Show error message
function showError(message) {
    alert(message);
}

// Event Listeners
convertBtn.addEventListener('click', convertCurrency);
swapBtn.addEventListener('click', swapCurrencies);

fromCurrencySelect.addEventListener('change', async () => {
    await fetchExchangeRates(fromCurrencySelect.value);
    if (amountInput.value !== '') {
        convertCurrency();
    }
});

toCurrencySelect.addEventListener('change', () => {
    updateExchangeRateInfo();
    if (amountInput.value !== '') {
        convertCurrency();
    }
});

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', init);
