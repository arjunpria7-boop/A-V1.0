/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';

// --- DOM Elements ---
const predictButton = document.getElementById('predict-btn');
const loader = document.getElementById('loader');
const resultsContainer = document.getElementById('results-container');
const errorContainer = document.getElementById('error-container');
const errorMessageElement = document.getElementById('error-message');
const marketSelect = document.getElementById('market-select');
const marketDisplayText = document.getElementById('market-display-text');
const marketDate = document.getElementById('market-date');
const dataHeader = document.getElementById('data-header');
const headerElement = document.querySelector('header');
const bbfsInput = document.getElementById('bbfs-input');
const predictionText = document.getElementById('prediction-text');
const predictionOutput = document.getElementById('prediction-output');
const copyBtn = document.getElementById('copy-btn');

// --- Modal Elements ---
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const apiKeyInput = document.getElementById('api-key-input');
const saveKeyBtn = document.getElementById('save-key-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

// --- Toast Notification ---
const toast = document.getElementById('toast-notification');
let toastTimeout;


// --- API Key Management ---
const API_KEY_STORAGE_KEY = 'gemini-api-key';

function saveApiKey(key) {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
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
  }, 3000); // Hide after 3 seconds
}

function setIdleState() {
  predictButton.disabled = false;
  predictButton.querySelector('.button-text').textContent = 'Prediksi Angka Jitu';
  loader.classList.add('hidden');
  errorContainer.classList.add('hidden');
}

function setLoadingState() {
  predictButton.disabled = true;
  predictButton.querySelector('.button-text').textContent = 'Mencari Angka Jitu...';
  loader.classList.remove('hidden');
  errorContainer.classList.add('hidden');
  
  resultsContainer.classList.remove('hidden');
  predictionOutput.classList.add('analyzing');
  predictionText.textContent = 'Menganalisis BBFS untuk Anda...\n\nSistem ARJ sedang meracik angka jitu, harap tunggu sebentar.';
}

function setSuccessState(resultJson) {
  loader.classList.add('hidden');
  predictionOutput.classList.remove('analyzing');

  const marketName = marketSelect.value.toUpperCase();
  const dateText = marketDate.textContent.toUpperCase();

  const predictionString = `
${marketName}
${dateText}

𝘼𝙄 : ${resultJson.ai}
𝘾𝙉 : ${resultJson.cn}
𝘾𝘽 : ${resultJson.cb}
𝘽𝘽𙁦𝙎 : ${resultJson.bbfs}
4𝘿 : ${resultJson.prediction_4d}
3𝘿 : ${resultJson.prediction_3d}
2𝘿 : ${resultJson.prediction_2d}
𝚌𝚊𝚍𝚊𝚗𝚐𝚊𝚗 : ${resultJson.cadangan}
𝙏𝙒𝙀𝙉 : ${resultJson.twen}

ʲᵃᵈⁱᵏᵃⁿ ᵖᵉʳᵇᵃⁿᵈⁱⁿᵍᵃⁿ- ᵗⁱᵈᵃᵏ ᵃᵈᵃ ʲᵃᵐⁱⁿᵃⁿ ᴶᴾ ¹⁰⁰%
  `.trim();

  predictionText.textContent = predictionString;
  
  setIdleState();
}

function setErrorState(message) {
  loader.classList.add('hidden');
  resultsContainer.classList.add('hidden');
  errorMessageElement.textContent = message;
  errorContainer.classList.remove('hidden');
  setIdleState();
}

// --- Main Prediction Logic ---

async function handlePrediction() {
  // 0. Check for API Key
  const apiKey = getApiKey();
  if (!apiKey) {
    setErrorState('API Key belum diatur. Silakan masukkan di pengaturan.');
    settingsModal.classList.remove('hidden');
    return;
  }

  // 1. Validate inputs
  const bbfsValue = bbfsInput.value.trim();
  if (!/^\d{5,10}$/.test(bbfsValue)) {
    bbfsInput.classList.add('invalid');
    setErrorState('Input BBFS harus berisi 5-10 digit angka.');
    resultsContainer.classList.add('hidden');
    return;
  }
  bbfsInput.classList.remove('invalid');
  
  setLoadingState();

  try {
    // Initialize AI with the stored key
    const ai = new GoogleGenAI({ apiKey });

    // 2. Construct Prompt
    const marketNameText = marketSelect.value;
    const marketDateText = marketDate.textContent?.trim() || '';
    const marketText = `${marketNameText} ${marketDateText}`.trim();

    const prompt = `
      Anda adalah sistem prediksi "ARJ Predict", seorang master togel legendaris yang memiliki intuisi tajam dan pengalaman puluhan tahun. Anda tidak hanya menghitung, tapi juga merasakan "getaran" dari setiap angka.
      
      Tugas Anda adalah melakukan ritual prediksi untuk pasaran **${marketText}**.
      
      Angka dasar (BBFS) yang diberikan oleh pengguna adalah: **${bbfsValue}**

      Gunakan BBFS ini sebagai sumber inspirasi utama Anda. Jangan hanya mengurutkan atau membuat kombinasi yang jelas. Lakukan analisis mendalam seolah-olah Anda sedang melihat data paito, rumus rahasia, dan angka tarikan gaib. Temukan angka-angka yang memiliki "kekuatan" paling besar di dalam BBFS tersebut.

      Hasil prediksi Anda harus terasa acak, tidak terduga, dan meyakinkan, seolah-olah berasal dari wangsit seorang ahli, BUKAN dari generator angka biasa. Hindari pola yang terlalu berurutan atau mudah ditebak.

      **ATURAN SANGAT PENTING untuk 2D dan Cadangan:**
      Angka 2 digit dan kebalikannya dianggap SAMA (contoh: 12 sama dengan 21, 56 sama dengan 65). Pastikan TIDAK ADA angka duplikat seperti ini di seluruh hasil 2D dan Cadangan. Jika Anda memilih 12, maka 21 tidak boleh muncul sama sekali, baik di 2D maupun Cadangan. Cukup gunakan satu perwakilan untuk setiap pasangan angka.

      Sekarang, berikan hasil analisis mistis Anda untuk:
      1.  **AI (Angka Ikut):** 4 digit dengan energi terkuat.
      2.  **CN (Colok Naga):** 3 digit pilihan yang saling menguatkan.
      3.  **CB (Colok Bebas):** 1 digit "bom" yang paling Anda yakini.
      4.  **BBFS:** Kembalikan BBFS asli atau versi 7 digit yang telah Anda "sempurnakan".
      5.  **4D:** Empat set angka 4 digit hasil terawangan Anda.
      6.  **3D:** Lima set angka 3 digit dari kombinasi rahasia Anda.
      7.  **2D:** Lima set angka 2 digit jitu.
      8.  **Cadangan:** Dua set angka 2 digit untuk "jaga-jaga".
      9.  **TWEN (Twin/Kembar):** Dua set angka kembar yang berpotensi muncul.

      Sajikan hasil akhir Anda dalam format JSON yang ketat, tanpa penjelasan tambahan.
    `;
    
    // 3. Define Response Schema
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        ai: { type: Type.STRING, description: '4 digit Angka Ikut.' },
        cn: { type: Type.STRING, description: '3 digit Colok Naga.' },
        cb: { type: Type.STRING, description: '1 digit Colok Bebas.' },
        bbfs: { type: Type.STRING, description: 'Rekomendasi angka Bolak Balik Full Set (BBFS).' },
        prediction_4d: { type: Type.STRING, description: 'Empat set angka 4D, dipisahkan oleh *. Contoh: "1307*8461*7038*4671".' },
        prediction_3d: { type: Type.STRING, description: 'Lima set angka 3D, dipisahkan oleh *. Contoh: "103*784*610*374*806".' },
        prediction_2d: { type: Type.STRING, description: 'Lima set angka 2D, dipisahkan oleh *. Contoh: "13*07*84*61*70".' },
        cadangan: { type: Type.STRING, description: 'Dua set angka cadangan 2D, dipisahkan oleh *. Contoh: "34*67".' },
        twen: { type: Type.STRING, description: 'Dua set angka kembar, dipisahkan oleh *. Contoh: "11*33".' },
      },
      required: ['ai', 'cn', 'cb', 'bbfs', 'prediction_4d', 'prediction_3d', 'prediction_2d', 'cadangan', 'twen']
    };

    // 4. Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    // 5. Process and Display Response
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
      setErrorState('Permintaan Anda mungkin diblokir karena kebijakan keamanan. Coba ubah input Anda.');
      return;
    }

    let resultJson;
    try {
      resultJson = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON:', responseText);
      setErrorState('Sistem ARJ memberikan respons yang tidak valid. Silakan coba lagi.');
      return;
    }

    setSuccessState(resultJson);

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    let userMessage = 'Terjadi kesalahan saat menghubungi sistem ARJ. Silakan coba lagi.';
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes('api key not valid')) {
            userMessage = 'API Key yang Anda masukkan tidak valid. Periksa kembali di pengaturan.';
        } else if (error.message.toLowerCase().includes('fetch')) {
            userMessage = 'Gagal terhubung ke sistem ARJ. Periksa koneksi internet Anda.';
        } else if (error.message.includes('429')) { // Quota limit
            userMessage = 'Sistem ARJ sedang sibuk (batas penggunaan API tercapai). Silakan coba lagi setelah beberapa saat.';
        }
    }
    setErrorState(userMessage);
  }
}

// --- App Initialization ---

function main() {
  function setDateAutomatically() {
    const months = [
      'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ];
    const today = new Date();
    const day = today.getDate();
    const monthName = months[today.getMonth()];
    const year = today.getFullYear();
    marketDate.textContent = `${day} ${monthName} ${year}`;
  }

  function getRandomColor() {
    const r = Math.floor(Math.random() * 156) + 100; // Brighter colors
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    return `rgba(${r}, ${g}, ${b}, 0.2)`;
  }

  function getContrastColor(rgbaString) {
    if (!rgbaString) return '#FFFFFF';
    const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#FFFFFF';

    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 149 ? '#111111' : '#FFFFFF';
  }

  function updateHeaderBackground() {
    const market = marketSelect.value;
    let bgColor;
    if (market === 'HONGKONG') {
      bgColor = 'rgba(211, 47, 47, 0.2)'; // Red
    } else if (market === 'SYDNEY') {
      bgColor = 'rgba(255, 99, 71, 0.2)'; // Tomato (#ff6347)
    } else if (market === 'SINGAPORE') {
      bgColor = 'rgba(0, 255, 255, 0.2)'; // Cyan (#00ffff)
    } else if (market.includes('TOTO MACAU')) {
      bgColor = 'rgba(95, 158, 160, 0.2)'; // CadetBlue (#5f9ea0)
    } else {
      bgColor = getRandomColor();
    }
    headerElement.style.backgroundColor = bgColor;
    
    const contrastColor = getContrastColor(bgColor);
    marketDisplayText.style.color = contrastColor;
    marketDate.style.color = contrastColor;
    settingsBtn.style.color = contrastColor;
  }

  setDateAutomatically();

  predictButton.addEventListener('click', handlePrediction);
  
  copyBtn.addEventListener('click', () => {
    if (predictionText.textContent) {
      navigator.clipboard.writeText(predictionText.textContent).then(() => {
        const buttonText = copyBtn.querySelector('span');
        const buttonIcon = copyBtn.querySelector('i');
        const originalText = buttonText.textContent;
        
        buttonText.textContent = 'Disalin!';
        buttonIcon.className = 'fa-solid fa-check';
        
        setTimeout(() => {
          buttonText.textContent = originalText;
          buttonIcon.className = 'fa-regular fa-copy';
        }, 2000);
      }).catch(err => {
        console.error('Gagal menyalin teks: ', err);
        showToast('Gagal menyalin teks.');
      });
    }
  });

  bbfsInput.addEventListener('input', () => {
    if (!/^\d{5,10}$/.test(bbfsInput.value) && bbfsInput.value !== '') {
      bbfsInput.classList.add('invalid');
    } else {
      bbfsInput.classList.remove('invalid');
    }
  });

  marketSelect.addEventListener('change', () => {
    marketDisplayText.textContent = marketSelect.value;
    updateHeaderBackground();
  });

  // --- Modal Event Listeners ---
  settingsBtn.addEventListener('click', () => {
    apiKeyInput.value = getApiKey() || ''; // Show current key on open
    settingsModal.classList.remove('hidden');
  });

  closeModalBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  saveKeyBtn.addEventListener('click', () => {
    const newKey = apiKeyInput.value.trim();
    if (newKey) {
      saveApiKey(newKey);
      settingsModal.classList.add('hidden');
      setIdleState(); // Clear any previous 'API key not set' error
      showToast('API Key berhasil disimpan!');
    } else {
      showToast('API Key tidak boleh kosong.');
    }
  });
  
  // Close modal if clicked outside of it
  settingsModal.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
      settingsModal.classList.add('hidden');
    }
  });

  setIdleState();
  updateHeaderBackground();
}

main();