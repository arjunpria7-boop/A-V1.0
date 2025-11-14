/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- Data ---
const ALL_MARKETS = {
  "🔥 PASARAN POPULER": ["HONGKONG POOLS", "HONGKONG LOTTO", "SIDNEY POOLS", "SYDNEY LOTTO", "SINGAPORE", "CHINA POOLS", "TAIWAN", "JAPAN POOLS", "MAGNUM CAMBODIA", "BULLSEYE"],
  "🇲🇴 TOTO MACAU": ["TOTO MACAU 00", "TOTO MACAU 13", "TOTO MACAU 16", "TOTO MACAU 19", "TOTO MACAU 22", "TOTO MACAU 23"],
  "☀️ PASARAN PAGI & SIANG": ["CAROLINA DAY", "KENTUCY MID", "NEW YORK MID", "OREGON 01", "OREGON 04", "OREGON 07", "OREGON 10", "QATAR MIDDAY", "QATAR MORNING", "SIPRUS MIDDAY", "SIPRUS MORNING", "TEXAS DAY", "TEXAS MORNING"],
  "🌙 PASARAN SORE & MALAM": ["CAROLINA EVENING", "FLORIDA EVE", "KENTUKY EVE", "NEW YORK EVE", "PCSO", "QATAR EVENING", "QATAR NIGHT", "SIPRUS EVENING", "SIPRUS NIGHT", "TEXAS EVENING", "TEXAS NIGHT"],
  "🌍 PASARAN DUNIA": ["ALASKA", "BANGKOK POOL", "BERLIN LOTTERY", "CALIFORNIA", "CHICAGO LOTTERY", "DUBAI", "FUJI LOTTO", "GANGNAM", "GENTING LOTTERY", "GERMANI PLUS", "GIEYANG POOLS", "GWANSAN POOLS", "HANOI LOTERRY", "MANILA LOTTERY", "MIAMI LOTTERY", "NAMDONG", "OSAKA LOTTERY", "TENNESE", "VIETNAM", "YORDANIA"]
};
const MAX_SELECTIONS = 6;


// --- DOM Elements ---
const predictButton = document.getElementById('predict-btn');
const loader = document.getElementById('loader');
const resultsContainer = document.getElementById('results-container');
const errorContainer = document.getElementById('error-container');
const errorMessageElement = document.getElementById('error-message');
const marketSelector = document.getElementById('market-selector');
const marketDisplayText = document.getElementById('market-display-text');
const marketDate = document.getElementById('market-date');
const dataHeader = document.getElementById('data-header');
const headerElement = document.querySelector('header');
const bbfsInputsContainer = document.getElementById('bbfs-inputs-container');
const predictionOutput = document.getElementById('prediction-output');
const copyBtn = document.getElementById('copy-btn');
const fillExampleBtn = document.getElementById('fill-example-btn');

// --- Market Modal Elements ---
const marketModal = document.getElementById('market-modal');
const marketListContainer = document.getElementById('market-list');
const marketCount = document.getElementById('market-count');
const confirmMarketBtn = document.getElementById('confirm-market-btn');

// --- API Key Modal Elements (REMOVED) ---

// --- Toast Notification ---
const toast = document.getElementById('toast-notification');
let toastTimeout;

// --- State ---
let selectedMarkets = ['HONGKONG POOLS'];


// --- Helpers ---
function getFormattedDate(dateString) {
  if (!dateString) return '';
  const months = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ];
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${monthName} ${year}`;
}


// --- UI State Management ---

function showToast(message) {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  toast.textContent = message;
  toast.classList.remove('hidden');
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function setIdleState() {
  const buttonText = predictButton.querySelector('.button-text');
  const marketCount = selectedMarkets.length;
  if (marketCount > 1) {
    buttonText.textContent = `Prediksi ${marketCount} Pasaran`;
  } else {
    buttonText.textContent = 'Prediksi Angka Jitu';
  }
  predictButton.disabled = false;
  loader.classList.add('hidden');
  errorContainer.classList.add('hidden');
}

function setLoadingState() {
  const marketCount = selectedMarkets.length;
  predictButton.disabled = true;
  predictButton.querySelector('.button-text').textContent = `Meracik Angka Jitu (${marketCount} Pasaran)...`;
  loader.classList.remove('hidden');
  errorContainer.classList.add('hidden');
  
  resultsContainer.classList.remove('hidden');
  predictionOutput.innerHTML = ''; // Clear previous results
  predictionOutput.classList.add('analyzing');
  
  const loadingTextElement = document.createElement('pre');
  loadingTextElement.textContent = `Menganalisis BBFS untuk ${marketCount} pasaran...\n\nSistem ARJ sedang meracik angka jitu, harap tunggu sebentar.`;
  predictionOutput.appendChild(loadingTextElement);
}

function setSuccessState(results) {
  loader.classList.add('hidden');
  predictionOutput.classList.remove('analyzing');
  predictionOutput.innerHTML = ''; // Clear loading text
  
  const dateText = getFormattedDate(marketDate.value).toUpperCase();
  const DISCLAIMER_TEXT = `\n\nʲᵃᵈⁱᵏᵃⁿ ᵖᵉʳᵇᵃⁿᵈⁱⁿᵍᵃⁿ- ᵗⁱᵈᵃᵏ ᵃᵈᵃ ʲᵃᵐⁱⁿᵃⁿ ᴶᴾ ¹⁰⁰%`;
  let fullPredictionStringToCopy = '';

  results.forEach((result, index) => {
    const { market, data } = result;

    // --- Create prediction string for copying (WhatsApp format) ---
    const predictionStringToCopy = `
*${market.toUpperCase()}*
${dateText}

AI : ${data.ai}
CN : ${data.cn}
CB : ${data.cb}
BBFS : ${data.bbfs}
4D : ${data.prediction_4d}
3D : ${data.prediction_3d}
2D : ${data.prediction_2d}
Cd : ${data.Cd}
TWEN : ${data.twen}
    `.trim();
    
    // Create a separate string for display that preserves number separators but removes bolding asterisks
    const predictionStringForDisplay = `
${market.toUpperCase()}
${dateText}

AI : ${data.ai}
CN : ${data.cn}
CB : ${data.cb}
BBFS : ${data.bbfs}
4D : ${data.prediction_4d}
3D : ${data.prediction_3d}
2D : ${data.prediction_2d}
Cd : ${data.Cd}
TWEN : ${data.twen}
    `.trim();

    // --- Create DOM elements for display ---
    const itemContainer = document.createElement('div');
    itemContainer.className = 'prediction-item';

    const itemHeader = document.createElement('div');
    itemHeader.className = 'prediction-item-header';

    const marketTitle = document.createElement('h3');
    marketTitle.textContent = market.toUpperCase();
    
    const singleCopyBtn = document.createElement('button');
    singleCopyBtn.className = 'copy-single-btn';
    singleCopyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Salin';
    singleCopyBtn.addEventListener('click', () => {
        const textToCopyForSingle = predictionStringToCopy + DISCLAIMER_TEXT;
        navigator.clipboard.writeText(textToCopyForSingle).then(() => {
            singleCopyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Disalin!';
            setTimeout(() => { singleCopyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Salin'; }, 2000);
        }).catch(err => {
            console.error('Gagal menyalin: ', err);
            showToast('Gagal menyalin.');
        });
    });

    itemHeader.appendChild(marketTitle);
    itemHeader.appendChild(singleCopyBtn);

    const pre = document.createElement('pre');
    pre.textContent = predictionStringForDisplay; // Use the display-specific string
    
    itemContainer.appendChild(itemHeader);
    itemContainer.appendChild(pre);
    
    predictionOutput.appendChild(itemContainer);

    // --- Append to the full string for the "Copy All" button ---
    fullPredictionStringToCopy += predictionStringToCopy;
    if (index < results.length - 1) {
      fullPredictionStringToCopy += `\n\n${'-'.repeat(40)}\n\n`;
    }
  });
  
  // Attach the full text to the main copy button
  copyBtn.onclick = () => {
      const finalCopyText = fullPredictionStringToCopy.trim() + DISCLAIMER_TEXT;
      navigator.clipboard.writeText(finalCopyText).then(() => {
        const buttonText = copyBtn.querySelector('span');
        buttonText.textContent = 'Disalin!';
        setTimeout(() => { buttonText.textContent = 'Salin Semua'; }, 2000);
      }).catch(err => {
        console.error('Gagal menyalin semua: ', err);
        showToast('Gagal menyalin semua.');
      });
  };

  setIdleState();
}

function setErrorState(message) {
  loader.classList.add('hidden');
  resultsContainer.classList.add('hidden');
  errorMessageElement.textContent = message;
  errorContainer.classList.remove('hidden');
  setIdleState();
}

// --- Local Prediction Logic ---
function generateLocalPrediction(bbfs) {
    const digits = [...new Set(bbfs.split(''))]; // Unique digits from BBFS

    const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());

    const getRandomSubset = (arr, size) => {
        const shuffled = shuffle([...arr]);
        return shuffled.slice(0, size);
    };
    
    const generateUniqueSets = (sourceDigits, setCount, digitCount, existing = new Set()) => {
        const sets = new Set();
        let attempts = 0;
        const maxAttempts = setCount * 50; // Safety break

        while (sets.size < setCount && attempts < maxAttempts) {
            const shuffled = shuffle([...sourceDigits]);
            const newSet = shuffled.slice(0, digitCount).join('');
            
            if (digitCount === 2) {
                const canonical = newSet.split('').sort().join('');
                if (!existing.has(canonical)) {
                    sets.add(newSet);
                    existing.add(canonical);
                }
            } else {
                sets.add(newSet);
            }
            attempts++;
        }
        return Array.from(sets);
    };

    // AI, CN, CB
    const ai_digits = getRandomSubset(digits, 4);
    const cn_digits = getRandomSubset(ai_digits, 3);
    const cb_digit = getRandomSubset(cn_digits, 1);

    // 2D & Cd (ensuring no reversed duplicates)
    const twoDigitCanonicalForms = new Set();
    const prediction_2d_sets = generateUniqueSets(digits, 5, 2, twoDigitCanonicalForms);
    const Cd_sets = generateUniqueSets(digits, 2, 2, twoDigitCanonicalForms);
    
    // Twins
    const twin_sets = generateUniqueSets(digits, 2, 1).map(d => d + d);

    // 4D & 3D
    const prediction_4d_sets = generateUniqueSets(digits, 4, 4);
    const prediction_3d_sets = generateUniqueSets(digits, 5, 3);

    return {
        ai: ai_digits.join(''),
        cn: cn_digits.join(''),
        cb: cb_digit.join(''),
        bbfs: bbfs.length > 7 ? shuffle(bbfs.split('')).slice(0, 7).join('') : bbfs,
        prediction_4d: prediction_4d_sets.join('*') || '----',
        prediction_3d: prediction_3d_sets.join('*') || '---',
        prediction_2d: prediction_2d_sets.join('*') || '--',
        Cd: Cd_sets.join('*') || '--',
        twen: twin_sets.join('*') || '--',
    };
}


// --- Main Prediction Logic ---

function handlePrediction() {
  if (selectedMarkets.length === 0) {
    setErrorState('Silakan pilih setidaknya satu pasaran untuk diprediksi.');
    return;
  }
  
  const bbfsInputs = bbfsInputsContainer.querySelectorAll('input');
  const bbfsValues = {};
  let allValid = true;

  bbfsInputs.forEach(input => {
    const market = input.dataset.market;
    const value = input.value.trim();
    if (!/^\d{5,10}$/.test(value)) {
      input.classList.add('invalid');
      allValid = false;
    } else {
      input.classList.remove('invalid');
      bbfsValues[market] = value;
    }
  });

  if (!allValid) {
    setErrorState('Input BBFS harus berisi 5-10 digit angka untuk setiap pasaran.');
    resultsContainer.classList.add('hidden');
    return;
  }
  
  setLoadingState();
  
  // Simulate processing time for better UX
  setTimeout(() => {
    try {
        const results = selectedMarkets.map(market => {
            const predictionData = generateLocalPrediction(bbfsValues[market]);
            return { market, data: predictionData, success: true };
        });

        if (results.length > 0) {
            setSuccessState(results);
        } else {
            // This case should not happen with local generation unless no markets are selected, which is checked earlier.
            setErrorState('Tidak ada prediksi yang dapat dihasilkan.');
        }

    } catch (error) {
        console.error('Error during local prediction:', error);
        setErrorState('Terjadi kesalahan tak terduga saat meracik angka.');
    }
  }, 500); // 0.5 second delay
}

// --- App Initialization ---
function populateMarketModal() {
    marketListContainer.innerHTML = '';
    for (const groupName in ALL_MARKETS) {
        const groupLabel = document.createElement('div');
        groupLabel.className = 'market-list-group-label';
        groupLabel.textContent = groupName;
        marketListContainer.appendChild(groupLabel);

        ALL_MARKETS[groupName].forEach(marketName => {
            const id = `market-${marketName.replace(/\s+/g, '-')}`;
            const item = document.createElement('div');
            item.className = 'market-list-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = id;
            checkbox.value = marketName;
            checkbox.checked = selectedMarkets.includes(marketName);

            const label = document.createElement('label');
            label.htmlFor = id;
            label.textContent = marketName;

            item.appendChild(checkbox);
            item.appendChild(label);
            marketListContainer.appendChild(item);
        });
    }
}

function updateMarketSelectionUI() {
    const count = selectedMarkets.length;
    marketCount.textContent = `${count}/${MAX_SELECTIONS} Dipilih`;
    
    const allCheckboxes = marketListContainer.querySelectorAll('input[type="checkbox"]');
    if (count >= MAX_SELECTIONS) {
        allCheckboxes.forEach(cb => {
            if (!cb.checked) {
                cb.disabled = true;
                cb.parentElement.classList.add('disabled');
            }
        });
    } else {
        allCheckboxes.forEach(cb => {
            cb.disabled = false;
            cb.parentElement.classList.remove('disabled');
        });
    }
}

function updateMarketDisplayText() {
    const count = selectedMarkets.length;
    if (count === 0) {
        marketDisplayText.textContent = 'Pilih Pasaran';
    } else if (count === 1) {
        marketDisplayText.textContent = selectedMarkets[0];
    } else {
        marketDisplayText.textContent = `${count} Pasaran Dipilih`;
    }
    setIdleState(); // Update button text
}

function renderBbfsInputs() {
    bbfsInputsContainer.innerHTML = '';
    if (selectedMarkets.length === 0) {
        const info = document.createElement('p');
        info.textContent = 'Pilih pasaran untuk memasukkan BBFS.';
        info.style.textAlign = 'center';
        info.style.color = 'var(--text-secondary-color)';
        bbfsInputsContainer.appendChild(info);
    } else {
        selectedMarkets.forEach(market => {
            const wrapper = document.createElement('div');
            wrapper.className = 'bbfs-input-item';

            const label = document.createElement('label');
            label.textContent = market;
            label.title = market; // for tooltip on long names

            const input = document.createElement('input');
            input.type = 'tel';
            input.inputMode = 'numeric';
            input.maxLength = 10;
            input.placeholder = '5-10 digit';
            input.dataset.market = market; // Link input to market

            wrapper.appendChild(label);
            wrapper.appendChild(input);
            bbfsInputsContainer.appendChild(wrapper);

            input.addEventListener('input', () => {
                input.classList.toggle('invalid', !/^\d{5,10}$/.test(input.value) && input.value !== '');
            });
        });
    }
}


function main() {
  function setDateAutomatically() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    marketDate.value = `${year}-${month}-${day}`;
  }

  function updateHeaderBackground() {
    if (selectedMarkets.length === 1) {
      const market = selectedMarkets[0];
      let bgColor;
      if (market === 'HONGKONG POOLS') bgColor = 'rgba(211, 47, 47, 0.2)';
      else if (market === 'SIDNEY POOLS') bgColor = 'rgba(255, 99, 71, 0.2)';
      else if (market === 'SINGAPORE') bgColor = 'rgba(0, 255, 255, 0.2)';
      else if (market.includes('TOTO MACAU')) bgColor = 'rgba(95, 158, 160, 0.2)';
      else bgColor = `rgba(${Math.floor(Math.random()*156)+100}, ${Math.floor(Math.random()*156)+100}, ${Math.floor(Math.random()*156)+100}, 0.2)`;
      
      headerElement.style.backgroundColor = bgColor;
      headerElement.style.animation = 'none'; // Stop RGB animation for specific colors
    } else {
      // Revert to default animated border/background
      headerElement.style.backgroundColor = 'rgba(18, 18, 18, 0.2)';
      headerElement.style.animation = 'rgb-border-cycle 4s linear infinite';
      marketDisplayText.style.color = 'var(--text-color)'; // Revert text color
    }
  }

  setDateAutomatically();

  predictButton.addEventListener('click', handlePrediction);
  
  // --- Fill Example Listener ---
  fillExampleBtn.addEventListener('click', () => {
    const bbfsInputs = bbfsInputsContainer.querySelectorAll('input');
    if (bbfsInputs.length === 0) {
        showToast('Pilih pasaran terlebih dahulu.');
        return;
    }

    bbfsInputs.forEach(input => {
        const length = Math.floor(Math.random() * 6) + 5; // 5 to 10 digits
        let randomBbfs = '';
        const availableDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        for (let i = 0; i < length; i++) {
            randomBbfs += availableDigits[Math.floor(Math.random() * availableDigits.length)];
        }
        input.value = randomBbfs;
        // Trigger validation styling
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    showToast('Contoh BBFS berhasil diisi.');
  });
  
  // --- Market Modal Listeners ---
  marketSelector.addEventListener('click', () => {
    populateMarketModal();
    updateMarketSelectionUI();
    marketModal.classList.remove('hidden');
  });

  marketListContainer.addEventListener('change', e => {
    if (e.target.type === 'checkbox') {
        const { value, checked } = e.target;
        if (checked && !selectedMarkets.includes(value)) {
            if (selectedMarkets.length < MAX_SELECTIONS) {
                selectedMarkets.push(value);
            } else {
                e.target.checked = false; // Prevent checking
                showToast(`Anda hanya dapat memilih maksimal ${MAX_SELECTIONS} pasaran.`);
            }
        } else if (!checked) {
            selectedMarkets = selectedMarkets.filter(market => market !== value);
        }
        updateMarketSelectionUI();
    }
  });

  confirmMarketBtn.addEventListener('click', () => {
    marketModal.classList.add('hidden');
    updateMarketDisplayText();
    updateHeaderBackground();
    renderBbfsInputs();
  });

  // --- API Key Modal Listeners (REMOVED) ---
  
  // Close modals if clicked on overlay
  [marketModal].forEach(modal => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.classList.add('hidden');
        if (modal === marketModal) { // Also update display on close
             updateMarketDisplayText();
             updateHeaderBackground();
             renderBbfsInputs();
        }
      }
    });
  });

  setIdleState();
  updateHeaderBackground();
  updateMarketDisplayText();
  renderBbfsInputs();
}

main();