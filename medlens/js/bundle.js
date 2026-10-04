// =========================================================
// MEDLENS - COMPLETE STANDALONE BUNDLE
// Works both over HTTP/HTTPS server AND directly via file:// (double-clicking index.html)
// =========================================================

(function () {
  'use strict';

  // =========================================================
  // 0. SECURITY & ACCESSIBILITY HELPERS (XSS & DOM UTILITIES)
  // =========================================================
  function escapeHtml(val) {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizePlainText(val) {
    if (val === null || val === undefined) return '';
    // Strip any executable HTML tags or event handlers while keeping normal names & punctuation intact
    return String(val)
      .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  function getTodayIsoDate() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function toIsoDateValue(dobStr) {
    if (!dobStr || typeof dobStr !== 'string') return '';
    const trimmed = dobStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const dmySlash = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmySlash) {
      const dd = dmySlash[1].padStart(2, '0');
      const mm = dmySlash[2].padStart(2, '0');
      const yyyy = dmySlash[3];
      return `${yyyy}-${mm}-${dd}`;
    }
    const months = {
      jan: '01', january: '01',
      feb: '02', february: '02',
      mar: '03', march: '03',
      apr: '04', april: '04',
      may: '05',
      jun: '06', june: '06',
      jul: '07', july: '07',
      aug: '08', august: '08',
      sep: '09', sept: '09', september: '09',
      oct: '10', october: '10',
      nov: '11', november: '11',
      dec: '12', december: '12'
    };
    const dMonY = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/);
    if (dMonY) {
      const dd = dMonY[1].padStart(2, '0');
      const mm = months[dMonY[2].toLowerCase()];
      const yyyy = dMonY[3];
      if (mm) return `${yyyy}-${mm}-${dd}`;
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return '';
  }

  function extractNumericDigits(val) {
    if (val === null || val === undefined) return '';
    return String(val).replace(/[^0-9]/g, '');
  }

  function bindDobPickerField(inputEl, errEl) {
    if (!inputEl) return;
    const todayIso = getTodayIsoDate();
    inputEl.setAttribute('max', todayIso);
    inputEl.setAttribute('min', '1900-01-01');

    // Prevent arbitrary text entry in case browser allows typing in date field
    inputEl.addEventListener('keydown', (e) => {
      const allowedKeys = ['Tab', 'Escape', 'Enter', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'F4', ' '];
      if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      if (!/^[0-9\-]$/.test(e.key)) {
        e.preventDefault();
      }
    });

    inputEl.addEventListener('click', () => {
      if (typeof inputEl.showPicker === 'function') {
        try {
          inputEl.showPicker();
        } catch (err) {}
      }
    });

    inputEl.addEventListener('change', () => {
      validateDobField(inputEl, errEl, true);
    });
  }

  function validateDobField(inputEl, errEl, isRequired = true) {
    if (!inputEl) return true;
    const val = (inputEl.value || '').trim();
    const todayIso = getTodayIsoDate();

    if (!val) {
      if (isRequired) {
        if (errEl) {
          errEl.textContent = 'Please select your Date of Birth using the calendar.';
          errEl.style.display = 'block';
        }
        return false;
      }
      return true;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(val) || isNaN(new Date(val + 'T00:00:00').getTime())) {
      if (errEl) {
        errEl.textContent = 'Please select a valid Date, Month, and Year from the calendar.';
        errEl.style.display = 'block';
      }
      return false;
    }

    if (val > todayIso) {
      if (errEl) {
        errEl.textContent = 'Date of Birth cannot be in the future.';
        errEl.style.display = 'block';
      }
      return false;
    }

    if (val < '1900-01-01') {
      if (errEl) {
        errEl.textContent = 'Please select a valid Date of Birth after 1900.';
        errEl.style.display = 'block';
      }
      return false;
    }

    if (errEl) {
      errEl.style.display = 'none';
      errEl.textContent = '';
    }
    return true;
  }

  function bindNumericOnlyField(inputEl, errEl, label) {
    if (!inputEl) return;

    inputEl.addEventListener('keydown', (e) => {
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
      if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        inputEl.dataset.hadInvalidInput = 'true';
        if (errEl) {
          errEl.textContent = `${label} accepts numeric digits (0–9) only. Letters are not allowed.`;
          errEl.style.display = 'block';
        }
      } else {
        inputEl.dataset.hadInvalidInput = 'false';
        if (errEl) {
          errEl.style.display = 'none';
          errEl.textContent = '';
        }
      }
    });

    inputEl.addEventListener('input', () => {
      const raw = inputEl.value;
      if (/[^0-9]/.test(raw)) {
        inputEl.value = raw.replace(/[^0-9]/g, '');
        inputEl.dataset.hadInvalidInput = 'true';
        if (errEl) {
          errEl.textContent = `${label} accepts numeric digits (0–9) only. Letters and symbols are not allowed.`;
          errEl.style.display = 'block';
        }
      } else {
        inputEl.dataset.hadInvalidInput = 'false';
        if (errEl && (/^[0-9]{10,15}$/.test(raw) || raw === '')) {
          errEl.style.display = 'none';
          errEl.textContent = '';
        }
      }
    });

    inputEl.addEventListener('paste', (e) => {
      const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      if (/[^0-9]/.test(pasted)) {
        e.preventDefault();
        const digitsOnly = pasted.replace(/[^0-9]/g, '');
        inputEl.value = (inputEl.value + digitsOnly).slice(0, 15);
        inputEl.dataset.hadInvalidInput = 'true';
        if (errEl) {
          errEl.textContent = `${label} accepts numeric digits (0–9) only. Non-numeric characters were rejected.`;
          errEl.style.display = 'block';
        }
      }
    });
  }

  function validateNumericPhoneField(inputEl, errEl, label, isRequired = true) {
    if (!inputEl) return true;
    const val = (inputEl.value || '').trim();

    if (inputEl.dataset.hadInvalidInput === 'true') {
      if (errEl) {
        errEl.textContent = `Invalid ${label}. Please enter numeric digits (0–9) only.`;
        errEl.style.display = 'block';
      }
      return false;
    }

    if (!val) {
      if (isRequired) {
        if (errEl) {
          errEl.textContent = `${label} is required and must contain numeric digits only.`;
          errEl.style.display = 'block';
        }
        return false;
      }
      return true;
    }

    if (!/^[0-9]{10,15}$/.test(val)) {
      if (errEl) {
        errEl.textContent = `Please enter a valid ${label} containing 10 to 15 numeric digits only.`;
        errEl.style.display = 'block';
      }
      return false;
    }

    if (errEl) {
      errEl.style.display = 'none';
      errEl.textContent = '';
    }
    return true;
  }

  // Ensure both #report-search-input and #locker-search-input resolve to the Report Locker search input
  const origGetElementById = Document.prototype.getElementById;
  Document.prototype.getElementById = function (id) {
    const el = origGetElementById.call(this, id);
    if (!el && id === 'locker-search-input') {
      return origGetElementById.call(this, 'report-search-input');
    }
    if (!el && id === 'report-search-input') {
      return origGetElementById.call(this, 'locker-search-input');
    }
    return el;
  };

  // =========================================================
  // 1. MOCK DATA & KNOWLEDGE BASE
  // =========================================================
  const INITIAL_USER_PROFILE = {
    fullName: 'Anshika Sharma',
    email: 'anshika@example.com',
    dob: '26 Oct 2001',
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    allergies: 'Penicillin, Dust',
    emergencyContact: 'Sunita Sharma (+91 98765 00000)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
  };

  const INITIAL_USER_STATE = {
    isAuthenticated: false,
    profileCompleted: false,
    basicDetails: { ...INITIAL_USER_PROFILE },
    reports: [
      {
        id: 'rep-101',
        fileName: 'Blood_Test_Aug_2026.pdf',
        name: 'Blood Test Aug 2026',
        reportType: 'Complete Blood Panel (Sample)',
        fileSize: '2.4 MB',
        uploadDate: '20 Aug 2026',
        date: '20 Aug 2026',
        status: 'Sample Report',
        badgeClass: 'badge-normal',
        demoTabKey: 'Blood Sugar',
        isSample: true
      },
      {
        id: 'rep-102',
        fileName: 'CBC_Report_July_2026.pdf',
        name: 'CBC Report July 2026',
        reportType: 'CBC Lab Report (Sample)',
        fileSize: '1.8 MB',
        uploadDate: '15 Jul 2026',
        date: '15 Jul 2026',
        status: 'Sample Report',
        badgeClass: 'badge-normal',
        demoTabKey: 'CBC',
        isSample: true
      },
      {
        id: 'rep-103',
        fileName: 'Liver_Function_June_2026.pdf',
        name: 'Liver Function June 2026',
        reportType: 'LFT Panel (Sample)',
        fileSize: '3.1 MB',
        uploadDate: '03 Jun 2026',
        date: '03 Jun 2026',
        status: 'Sample Report',
        badgeClass: 'badge-normal',
        demoTabKey: 'Liver',
        isSample: true
      },
      {
        id: 'rep-104',
        fileName: 'Renal_Screening_May_2026.pdf',
        name: 'Renal Screening May 2026',
        reportType: 'Kidney Function Test (Sample)',
        fileSize: '2.1 MB',
        uploadDate: '20 May 2026',
        date: '20 May 2026',
        status: 'Sample Report',
        badgeClass: 'badge-normal',
        demoTabKey: 'Kidney',
        isSample: true
      }
    ],
    analysisHistory: [
      {
        id: 'his-201',
        title: 'CBC Report',
        name: 'CBC Report Analysis',
        fileName: 'CBC_Report_July_2026.pdf',
        reportType: 'CBC Lab Report (Sample)',
        date: '18 Sep 2026',
        status: 'Completed',
        demoTabKey: 'CBC',
        summary: 'Analysis completed. 12 parameters verified. Hemoglobin and cell counts healthy.'
      },
      {
        id: 'his-202',
        title: 'Blood Sugar Report',
        name: 'Blood Sugar Report Analysis',
        fileName: 'Blood_Test_Aug_2026.pdf',
        reportType: 'Complete Blood Panel (Sample)',
        date: '12 Sep 2026',
        status: 'Completed',
        demoTabKey: 'Blood Sugar',
        summary: 'Analysis completed. Fasting blood sugar slightly elevated at 108 mg/dL.'
      },
      {
        id: 'his-203',
        title: 'Vitamin & Liver Panel',
        name: 'Vitamin & Liver Panel Analysis',
        fileName: 'Liver_Function_June_2026.pdf',
        reportType: 'LFT Panel (Sample)',
        date: '03 Jun 2026',
        status: 'Completed',
        demoTabKey: 'Liver',
        summary: 'Analysis completed. Liver enzymes within normal optimal baseline limits.'
      }
    ]
  };

  const DEMO_REPORTS = {
    CBC: {
      title: 'Complete Blood Count (CBC)',
      date: '28 Aug 2026',
      isSample: true,
      aiSummary: {
        totalAnalyzed: 12,
        normalCount: 10,
        reviewCount: 2,
        note: 'All primary blood cell counts are within normal reference ranges. Hemoglobin and Platelets are healthy.'
      },
      parameters: [
        { name: 'Hemoglobin', value: '13.2 g/dL', status: 'Normal', range: '12.0 - 15.5 g/dL', fillWidth: '70%', fillClass: 'fill-emerald', code: 'hb' },
        { name: 'WBC (White Blood Cells)', value: '8,200 /µL', status: 'Normal', range: '4,000 - 11,000 /µL', fillWidth: '60%', fillClass: 'fill-emerald', code: 'wbc' },
        { name: 'Platelets', value: '220,000 /µL', status: 'Normal', range: '150,000 - 450,000 /µL', fillWidth: '50%', fillClass: 'fill-emerald', code: 'plt' },
        { name: 'RBC (Red Blood Cells)', value: '4.5 M/µL', status: 'Normal', range: '4.0 - 5.2 M/µL', fillWidth: '65%', fillClass: 'fill-emerald', code: 'rbc' }
      ]
    },
    'Blood Sugar': {
      title: 'Fasting Blood Sugar & HbA1c',
      date: '28 Aug 2026',
      isSample: true,
      aiSummary: {
        totalAnalyzed: 4,
        normalCount: 2,
        reviewCount: 2,
        note: 'Fasting Glucose is slightly above optimal baseline (108 mg/dL). Continued monitoring recommended.'
      },
      parameters: [
        { name: 'Fasting Blood Glucose', value: '108 mg/dL', status: 'Review', range: '70 - 99 mg/dL', fillWidth: '82%', fillClass: 'fill-amber', code: 'glucose' },
        { name: 'HbA1c (Glycated Hb)', value: '5.6 %', status: 'Normal', range: '< 5.7 %', fillWidth: '55%', fillClass: 'fill-emerald', code: 'hba1c' },
        { name: 'Post-Prandial Glucose', value: '135 mg/dL', status: 'Normal', range: '< 140 mg/dL', fillWidth: '70%', fillClass: 'fill-emerald', code: 'ppg' },
        { name: 'Fasting Insulin', value: '14.2 µIU/mL', status: 'Review', range: '2.6 - 11.1 µIU/mL', fillWidth: '85%', fillClass: 'fill-amber', code: 'insulin' }
      ]
    },
    Liver: {
      title: 'Liver Function Panel (LFT)',
      date: '03 Jun 2026',
      isSample: true,
      aiSummary: {
        totalAnalyzed: 6,
        normalCount: 6,
        reviewCount: 0,
        note: 'Liver enzymes (ALT, AST, Bilirubin) are fully optimal with no markers of inflammation.'
      },
      parameters: [
        { name: 'ALT (SGPT)', value: '24 U/L', status: 'Normal', range: '7 - 56 U/L', fillWidth: '45%', fillClass: 'fill-emerald', code: 'alt' },
        { name: 'AST (SGOT)', value: '28 U/L', status: 'Normal', range: '10 - 40 U/L', fillWidth: '50%', fillClass: 'fill-emerald', code: 'ast' },
        { name: 'Bilirubin Total', value: '0.8 mg/dL', status: 'Normal', range: '0.1 - 1.2 mg/dL', fillWidth: '40%', fillClass: 'fill-emerald', code: 'bili' },
        { name: 'Alkaline Phosphatase', value: '72 U/L', status: 'Normal', range: '44 - 147 U/L', fillWidth: '55%', fillClass: 'fill-emerald', code: 'alp' }
      ]
    },
    Kidney: {
      title: 'Renal Function Test (KFT)',
      date: '20 May 2026',
      isSample: true,
      aiSummary: {
        totalAnalyzed: 5,
        normalCount: 5,
        reviewCount: 0,
        note: 'Kidney filtration and electrolyte levels demonstrate normal healthy renal clearing.'
      },
      parameters: [
        { name: 'Serum Creatinine', value: '0.85 mg/dL', status: 'Normal', range: '0.59 - 1.04 mg/dL', fillWidth: '50%', fillClass: 'fill-emerald', code: 'creat' },
        { name: 'Blood Urea Nitrogen (BUN)', value: '14 mg/dL', status: 'Normal', range: '7 - 20 mg/dL', fillWidth: '48%', fillClass: 'fill-emerald', code: 'bun' },
        { name: 'eGFR', value: '110 mL/min', status: 'Normal', range: '> 90 mL/min', fillWidth: '90%', fillClass: 'fill-emerald', code: 'egfr' },
        { name: 'Serum Sodium', value: '140 mEq/L', status: 'Normal', range: '136 - 145 mEq/L', fillWidth: '60%', fillClass: 'fill-emerald', code: 'sodium' }
      ]
    }
  };

  const MEDICAL_EXPLANATIONS = {
    hb: {
      title: 'Hemoglobin (Hb)',
      category: 'Hematology',
      summary: 'Hemoglobin is an iron-rich protein in red blood cells that carries oxygen from your lungs to the rest of your body.',
      normalRange: '12.0 - 15.5 g/dL (Females) / 13.8 - 17.2 g/dL (Males)',
      whatItMeans: 'A normal level means your organs and tissues receive adequate oxygen. Low levels may indicate anemia or iron deficiency.',
      lifestyleTip: 'Include iron-rich foods like spinach, lentils, beans, and lean meats in your diet along with Vitamin C for absorption.'
    },
    wbc: {
      title: 'White Blood Cell Count (WBC)',
      category: 'Hematology',
      summary: 'White blood cells are a key part of your body’s immune system, defending against infections and disease.',
      normalRange: '4,000 - 11,000 cells per microliter (/µL)',
      whatItMeans: 'Normal counts indicate a balanced immune system. Elevated counts can signal an active infection, stress, or inflammation.',
      lifestyleTip: 'Ensure adequate sleep, maintain good hygiene, and eat antioxidant-rich fruits to support immune resilience.'
    },
    plt: {
      title: 'Platelets (Thrombocytes)',
      category: 'Hematology',
      summary: 'Platelets are tiny cell fragments in your blood that help form clots and stop bleeding when blood vessels are injured.',
      normalRange: '150,000 - 450,000 platelets per microliter (/µL)',
      whatItMeans: 'A normal platelet count ensures healthy blood clotting and wound healing. Low counts (thrombocytopenia) can increase bruising, while elevated counts may follow inflammation or iron deficiency.',
      lifestyleTip: 'Stay well hydrated, eat folate- and Vitamin B12-rich leafy greens, and consult a doctor before taking blood-thinning medications.'
    },
    rbc: {
      title: 'Red Blood Cell Count (RBC)',
      category: 'Hematology',
      summary: 'Red blood cells transport oxygen from your lungs to tissues throughout your body and carry carbon dioxide back to be exhaled.',
      normalRange: '4.0 - 5.2 million cells/µL (Females) / 4.5 - 5.9 million cells/µL (Males)',
      whatItMeans: 'A balanced RBC count reflects healthy bone marrow production and oxygen delivery capacity.',
      lifestyleTip: 'Support red blood cell synthesis with balanced intake of iron, Vitamin B12, folic acid, and regular aerobic exercise.'
    },
    glucose: {
      title: 'Fasting Blood Glucose',
      category: 'Metabolism',
      summary: 'Measures the concentration of sugar (glucose) in your blood after fasting for at least 8 hours.',
      normalRange: '70 - 99 mg/dL (Fasting)',
      whatItMeans: 'Levels between 100-125 mg/dL suggest impaired fasting glucose (pre-diabetes range). Values over 126 mg/dL warrant clinical review.',
      lifestyleTip: 'Engage in 30 minutes of daily physical activity, reduce refined sugar intake, and emphasize complex fiber foods.'
    },
    hba1c: {
      title: 'HbA1c (Glycated Hemoglobin)',
      category: 'Metabolism',
      summary: 'Provides an average of your blood sugar levels over the past 2 to 3 months.',
      normalRange: 'Below 5.7%',
      whatItMeans: '5.7% to 6.4% indicates prediabetes. 6.5% or higher indicates diabetes. Maintaining normal levels reduces cardiovascular risk.',
      lifestyleTip: 'Consistent low-glycemic dietary choices help maintain stable long-term blood glucose equilibrium.'
    },
    ppg: {
      title: 'Post-Prandial Blood Glucose',
      category: 'Metabolism',
      summary: 'Measures blood glucose levels 2 hours after starting a meal to evaluate how effectively insulin clears sugar from the bloodstream.',
      normalRange: 'Below 140 mg/dL (2 hours after meal)',
      whatItMeans: 'Normal post-meal glucose shows healthy insulin response. Elevated values may indicate reduced glucose tolerance.',
      lifestyleTip: 'Take a 10–15 minute walk after meals and pair carbohydrates with protein and healthy fiber.'
    },
    insulin: {
      title: 'Fasting Serum Insulin',
      category: 'Metabolism',
      summary: 'Measures the hormone insulin in your blood after an overnight fast, reflecting pancreatic beta-cell activity and insulin sensitivity.',
      normalRange: '2.6 - 11.1 µIU/mL',
      whatItMeans: 'Slightly elevated fasting insulin can be an early indicator of insulin resistance even before blood sugar rises significantly.',
      lifestyleTip: 'Strength training, adequate sleep, and minimizing refined carbohydrates improve cellular insulin sensitivity.'
    },
    alt: {
      title: 'Alanine Aminotransferase (ALT / SGPT)',
      category: 'Hepatic / Liver',
      summary: 'An enzyme found mainly in the liver. When liver cells are stressed or damaged, they release ALT into the bloodstream.',
      normalRange: '7 - 56 U/L',
      whatItMeans: 'Normal levels suggest healthy liver cell integrity. Elevated ALT can occur with alcohol use, fatty liver, or medications.',
      lifestyleTip: 'Limit alcohol consumption, stay well hydrated, and maintain a balanced weight.'
    },
    ast: {
      title: 'Aspartate Aminotransferase (AST / SGOT)',
      category: 'Hepatic / Liver',
      summary: 'An enzyme present in the liver, heart, and muscles that helps metabolize amino acids.',
      normalRange: '10 - 40 U/L',
      whatItMeans: 'Normal AST alongside normal ALT confirms healthy hepatic and muscular cellular function.',
      lifestyleTip: 'Avoid strenuous unaccustomed exercise right before liver blood tests and eat a nutrient-dense diet.'
    },
    bili: {
      title: 'Total Bilirubin',
      category: 'Hepatic / Liver',
      summary: 'A yellowish pigment produced during the normal breakdown of red blood cells and processed by the liver.',
      normalRange: '0.1 - 1.2 mg/dL',
      whatItMeans: 'Normal bilirubin indicates efficient liver clearance and bile duct flow.',
      lifestyleTip: 'Stay hydrated and eat fiber-rich vegetables to support healthy liver and gallbladder function.'
    },
    alp: {
      title: 'Alkaline Phosphatase (ALP)',
      category: 'Hepatic & Bone',
      summary: 'An enzyme found in the bile ducts of the liver and in bone tissue.',
      normalRange: '44 - 147 U/L',
      whatItMeans: 'Normal ALP levels indicate healthy bile flow and normal bone turnover.',
      lifestyleTip: 'Ensure adequate Vitamin D and calcium intake to support bone and hepatic health.'
    },
    creat: {
      title: 'Serum Creatinine',
      category: 'Renal / Kidney',
      summary: 'A waste product from normal muscle metabolism that is filtered out of the blood by healthy kidneys.',
      normalRange: '0.59 - 1.04 mg/dL',
      whatItMeans: 'Normal creatinine shows your kidneys are effectively clearing waste. High levels may indicate decreased kidney filtration.',
      lifestyleTip: 'Drink plenty of water daily and avoid excessive over-the-counter painkiller (NSAID) usage without consulting your physician.'
    },
    bun: {
      title: 'Blood Urea Nitrogen (BUN)',
      category: 'Renal / Kidney',
      summary: 'Measures the amount of urea nitrogen in your blood, a byproduct of protein metabolism cleared by the kidneys.',
      normalRange: '7 - 20 mg/dL',
      whatItMeans: 'Normal BUN reflects balanced hydration and healthy kidney filtration.',
      lifestyleTip: 'Maintain consistent daily water intake and balanced dietary protein.'
    },
    egfr: {
      title: 'Estimated Glomerular Filtration Rate (eGFR)',
      category: 'Renal / Kidney',
      summary: 'Calculates how efficiently your kidneys filter waste and excess fluid from the blood each minute.',
      normalRange: 'Greater than 90 mL/min/1.73m²',
      whatItMeans: 'An eGFR above 90 indicates optimal kidney filtration capacity.',
      lifestyleTip: 'Keep blood pressure and blood sugar within healthy ranges to protect long-term kidney filtration.'
    },
    sodium: {
      title: 'Serum Sodium (Na+)',
      category: 'Electrolytes / Renal',
      summary: 'An essential electrolyte that regulates fluid balance, nerve signaling, and muscle function.',
      normalRange: '136 - 145 mEq/L',
      whatItMeans: 'Normal sodium levels reflect healthy fluid and electrolyte regulation by your kidneys.',
      lifestyleTip: 'Moderate dietary table salt intake and stay evenly hydrated throughout the day.'
    }
  };

  // =========================================================
  // 2. BRAND LOGO, NAVBAR & SHARED APP SHELL (SIDEBAR)
  // =========================================================
  function createBrandLogoHtml() {
    return `
      <div class="brand-logo" onclick="window.MedLensApp.navigateTo('landing')">
        <div class="logo-icon">
          <i data-lucide="activity" style="width:20px;height:20px;"></i>
        </div>
        <span class="logo-text">
          <span class="med">Med</span><span class="lens">Lens</span>
        </span>
      </div>
    `;
  }

  function renderDashboardSidebarHtml(activeNav = 'dashboard') {
    return `
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <aside class="dashboard-sidebar" id="dashboard-sidebar" aria-label="Main Desktop Navigation">
        <div class="sidebar-header">
          ${createBrandLogoHtml()}
          <button class="sidebar-close-btn" id="sidebar-close-btn" title="Close Menu" aria-label="Close Menu">
            <i data-lucide="x" style="width:20px;height:20px;"></i>
          </button>
        </div>

        <div class="sidebar-nav">
          <ul class="sidebar-menu">
            <li>
              <a class="sidebar-item ${activeNav === 'landing' ? 'active' : ''}" href="#landing" data-nav="landing" id="sidebar-home-btn" title="Landing Page">
                <i data-lucide="home" class="sidebar-icon"></i>
                <span>Landing Page</span>
              </a>
            </li>
            <li>
              <a class="sidebar-item ${activeNav === 'dashboard' ? 'active' : ''}" href="#dashboard" data-nav="dashboard">
                <i data-lucide="layout-dashboard" class="sidebar-icon"></i>
                <span>Home</span>
              </a>
            </li>
            <li>
              <a class="sidebar-item ${activeNav === 'reports' ? 'active' : ''}" href="#reports" data-nav="reports">
                <i data-lucide="folder" class="sidebar-icon"></i>
                <span>Reports</span>
              </a>
            </li>
            <li>
              <a class="sidebar-item ${activeNav === 'history' ? 'active' : ''}" href="#history" data-nav="history">
                <i data-lucide="clock" class="sidebar-icon"></i>
                <span>Health Timeline</span>
              </a>
            </li>
            <li>
              <a class="sidebar-item ${activeNav === 'trends' ? 'active' : ''}" href="#trends" data-nav="trends">
                <i data-lucide="trending-up" class="sidebar-icon"></i>
                <span>Health Trends</span>
              </a>
            </li>
            <li>
              <a class="sidebar-item ${activeNav === 'profile' ? 'active' : ''}" href="#profile" data-nav="profile">
                <i data-lucide="user" class="sidebar-icon"></i>
                <span>Profile</span>
              </a>
            </li>
            <li>
              <a class="sidebar-item ${activeNav === 'settings' ? 'active' : ''}" href="#settings" data-nav="settings">
                <i data-lucide="settings" class="sidebar-icon"></i>
                <span>Settings</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="sidebar-footer">
          <button class="sidebar-logout-btn" id="sidebar-logout-btn">
            <i data-lucide="log-out" class="sidebar-icon"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    `;
  }

  function renderDashboardTopbarHtml(titleText, subtitleText, userProfile = {}) {
    const safeName = escapeHtml(userProfile.fullName || 'Anshika Sharma');
    const safeBlood = escapeHtml(userProfile.bloodGroup || 'O+');
    const safeAvatar = escapeHtml(userProfile.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250');
    return `
      <header class="dashboard-topbar">
        <div class="topbar-left">
          <button class="mobile-sidebar-toggle" id="mobile-sidebar-toggle" aria-label="Toggle Menu" title="Open Navigation Menu">
            <i data-lucide="menu" style="width:24px;height:24px;"></i>
          </button>
          <div class="topbar-breadcrumb">
            <span class="breadcrumb-active">${escapeHtml(titleText)}</span>
            <span class="breadcrumb-sub">${escapeHtml(subtitleText)}</span>
          </div>
        </div>

        <div class="topbar-right">
          <div class="icon-btn-badge" id="dash-home-icon-btn" title="Landing Page" aria-label="Open Landing Page" onclick="window.MedLensApp.navigateTo('landing')">
            <i data-lucide="home" style="width:18px;height:18px;"></i>
          </div>

          <div class="icon-btn-badge" id="dash-notifications-btn" title="Notifications">
            <i data-lucide="bell" style="width:18px;height:18px;"></i>
            <span class="notification-dot"></span>
          </div>

          <div class="user-profile-menu" id="dash-topbar-profile" onclick="window.MedLensApp.navigateTo('profile')">
            <img src="${safeAvatar}" alt="Avatar" class="avatar-img">
            <div class="user-info-text">
              <span class="user-info-name">${safeName}</span>
              <span class="user-info-role">Blood Group: ${safeBlood}</span>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  function bindDashboardShellEvents(containerEl) {
    const sidebar = containerEl.querySelector('#dashboard-sidebar');
    const overlay = containerEl.querySelector('#sidebar-overlay');
    const toggleBtn = containerEl.querySelector('#mobile-sidebar-toggle');
    const closeBtn = containerEl.querySelector('#sidebar-close-btn');

    function openSidebar() {
      if (sidebar) sidebar.classList.add('open');
      if (overlay) overlay.classList.add('active');
    }

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
    }

    if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    containerEl.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        closeSidebar();
        const navTarget = item.getAttribute('data-nav');
        if (navTarget === 'trends') {
          window.MedLensApp.openModal('view-trends');
        } else if (navTarget === 'settings') {
          window.MedLensApp.openModal('settings');
        } else if (navTarget) {
          window.MedLensApp.navigateTo(navTarget);
        }
      });
    });

    const logoutBtn = containerEl.querySelector('#sidebar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        closeSidebar();
        window.MedLensApp.logout();
      });
    }

    const notifBtn = containerEl.querySelector('#dash-notifications-btn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => window.MedLensApp.openModal('notifications'));
    }
  }

  function openReportViewerModal(rep) {
    if (!rep) return;
    const tabKey = rep.demoTabKey || (
      rep.id === 'rep-101' ? 'Blood Sugar' :
      rep.id === 'rep-102' ? 'CBC' :
      rep.id === 'rep-103' ? 'Liver' :
      rep.id === 'rep-104' ? 'Kidney' : null
    );
    // B03 FIX: Never show fabricated/sample CBC values for an arbitrary user-uploaded file!
    if (rep.isUploaded || !tabKey || !DEMO_REPORTS[tabKey]) {
      window.MedLensApp.openModal('report-unrecognized', rep);
      return;
    }
    const demoData = {
      ...DEMO_REPORTS[tabKey],
      fileName: rep.fileName || rep.name,
      isSample: true
    };
    window.MedLensApp.openModal('report-details', demoData);
  }

  function renderNavbar(containerEl) {
    containerEl.innerHTML = `
      <nav class="navbar" id="main-navbar">
        <div class="container">
          <div class="navbar-container">
            ${createBrandLogoHtml()}
            
            <ul class="nav-links">
              <li><a class="nav-link active" data-scroll="hero">Landing Page</a></li>
              <li><a class="nav-link" data-scroll="features">Features</a></li>
              <li><a class="nav-link" data-scroll="how-it-works">How It Works</a></li>
              <li><a class="nav-link" data-scroll="interactive-demo">Interactive Demo</a></li>
            </ul>

            <div class="nav-actions">
              <button class="btn btn-secondary btn-sm" id="nav-signin-btn">Sign In</button>
              <button class="btn btn-primary btn-sm" id="nav-getstarted-btn">Get Started</button>
            </div>

            <button class="mobile-toggle" id="mobile-toggle-btn" aria-label="Toggle navigation">
              <i data-lucide="menu"></i>
            </button>
          </div>
        </div>
      </nav>

      <!-- Mobile Navigation Drawer -->
      <div class="drawer-overlay" id="drawer-overlay"></div>
      <div class="mobile-drawer" id="mobile-drawer">
        <div class="mobile-drawer-header">
          ${createBrandLogoHtml()}
          <button id="drawer-close-btn" style="color:var(--color-text-secondary); padding:0.4rem;" aria-label="Close menu">
            <i data-lucide="x"></i>
          </button>
        </div>
        <ul class="mobile-drawer-links">
          <li><a class="nav-link drawer-link active" data-scroll="hero">Landing Page</a></li>
          <li><a class="nav-link drawer-link" data-scroll="features">Features</a></li>
          <li><a class="nav-link drawer-link" data-scroll="how-it-works">How It Works</a></li>
          <li><a class="nav-link drawer-link" data-scroll="interactive-demo">Interactive Demo</a></li>
        </ul>
        <div style="margin-top:auto; display:flex; flex-direction:column; gap:0.75rem;">
          <button class="btn btn-secondary btn-full" id="drawer-signin-btn">Sign In</button>
          <button class="btn btn-primary btn-full" id="drawer-getstarted-btn">Get Started</button>
        </div>
      </div>
    `;

    const navSignIn = containerEl.querySelector('#nav-signin-btn');
    const navGetStarted = containerEl.querySelector('#nav-getstarted-btn');
    const drawerSignIn = containerEl.querySelector('#drawer-signin-btn');
    const drawerGetStarted = containerEl.querySelector('#drawer-getstarted-btn');

    const goToAuth = () => {
      closeMobileDrawer();
      window.MedLensApp.navigateTo('auth');
    };

    if (navSignIn) navSignIn.addEventListener('click', goToAuth);
    if (navGetStarted) navGetStarted.addEventListener('click', goToAuth);
    if (drawerSignIn) drawerSignIn.addEventListener('click', goToAuth);
    if (drawerGetStarted) drawerGetStarted.addEventListener('click', goToAuth);

    const mobileToggle = containerEl.querySelector('#mobile-toggle-btn');
    const drawerClose = containerEl.querySelector('#drawer-close-btn');
    const drawerOverlay = containerEl.querySelector('#drawer-overlay');
    const mobileDrawer = containerEl.querySelector('#mobile-drawer');

    function openMobileDrawer() {
      if (mobileDrawer) mobileDrawer.classList.add('open');
      if (drawerOverlay) drawerOverlay.classList.add('active');
    }

    function closeMobileDrawer() {
      if (mobileDrawer) mobileDrawer.classList.remove('open');
      if (drawerOverlay) drawerOverlay.classList.remove('active');
    }

    if (mobileToggle) mobileToggle.addEventListener('click', openMobileDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeMobileDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeMobileDrawer);

    function scrollToTarget(targetId) {
      closeMobileDrawer();
      if (window.MedLensApp.currentPage !== 'landing') {
        window.MedLensApp.navigateTo('landing');
        setTimeout(() => performScroll(targetId), 150);
      } else {
        performScroll(targetId);
      }
    }

    function performScroll(targetId) {
      if (targetId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const targetEl = document.getElementById(targetId) || document.getElementById('demo');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    containerEl.querySelectorAll('[data-scroll]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('data-scroll');
        scrollToTarget(targetId);

        containerEl.querySelectorAll('[data-scroll]').forEach(l => l.classList.remove('active'));
        containerEl.querySelectorAll(`[data-scroll="${targetId}"]`).forEach(l => l.classList.add('active'));
      });
    });

    const scrollElevationHandler = () => {
      const navbar = document.getElementById('main-navbar');
      if (navbar) {
        if (window.scrollY > 15) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    };
    window.removeEventListener('scroll', scrollElevationHandler);
    window.addEventListener('scroll', scrollElevationHandler);

    const sectionsToObserve = ['hero', 'features', 'how-it-works', 'interactive-demo'];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          containerEl.querySelectorAll('[data-scroll]').forEach(l => l.classList.remove('active'));
          containerEl.querySelectorAll(`[data-scroll="${id}"]`).forEach(l => l.classList.add('active'));
        }
      });
    }, {
      root: null,
      rootMargin: '-80px 0px -50% 0px',
      threshold: 0.15
    });

    setTimeout(() => {
      sectionsToObserve.forEach(secId => {
        const secEl = document.getElementById(secId) || document.getElementById('demo');
        if (secEl) observer.observe(secEl);
      });
    }, 300);

    if (window.lucide) window.lucide.createIcons();
  }

  // =========================================================
  // 3. SHARED MODALS
  // =========================================================
  function renderModalContent(modalType, payload = {}) {
    const modalContent = document.getElementById('modal-content');
    if (!modalContent) return;

    let bodyHtml = '';

    switch (modalType) {
      case 'share-report':
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <div style="text-align:center; margin-bottom:1.5rem;">
            <div style="width:54px; height:54px; border-radius:50%; background:var(--color-very-light-mint); color:var(--color-emerald); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; border:1px solid var(--color-light-mint);">
              <i data-lucide="share-2" style="width:26px;height:26px;"></i>
            </div>
            <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.3rem;">Share Medical Report</h3>
            <p style="font-size:0.85rem; color:var(--color-text-secondary); word-break:break-word;">${escapeHtml(payload.fileName || payload.name || 'Report.pdf')}</p>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.85rem; margin-bottom:1.5rem;">
            <button class="btn btn-secondary btn-full" id="share-copy-link-btn" style="justify-content:flex-start; padding:0.9rem 1.25rem;">
              <i data-lucide="link" style="color:var(--color-emerald);"></i>
              <span>Copy Secure View Link</span>
            </button>

            <button class="btn btn-secondary btn-full" id="share-download-pdf-btn" style="justify-content:flex-start; padding:0.9rem 1.25rem;">
              <i data-lucide="download" style="color:var(--color-emerald);"></i>
              <span>Download Report Document</span>
            </button>

            <button class="btn btn-secondary btn-full" id="share-native-btn" style="justify-content:flex-start; padding:0.9rem 1.25rem;">
              <i data-lucide="send" style="color:var(--color-emerald);"></i>
              <span>Share via Email / Messaging</span>
            </button>
          </div>

          <div style="text-align:right;">
            <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Done</button>
          </div>
        `;
        break;

      case 'report-unrecognized':
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <div style="text-align:center; margin-bottom:1.25rem;">
            <div style="width:58px; height:58px; border-radius:50%; background:#FEF3C7; color:#B45309; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; border:1px solid #FDE68A;">
              <i data-lucide="file-warning" style="width:28px;height:28px;"></i>
            </div>
            <div class="badge badge-review" style="margin-bottom:0.5rem;">Unable to Analyze Report</div>
            <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.35rem;">Unable to Analyze This Report</h3>
            <p style="font-size:0.86rem; color:var(--color-text-secondary); word-break:break-word;">File: <strong>${escapeHtml(payload.fileName || payload.name || 'Uploaded_Document.pdf')}</strong></p>
          </div>

          <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:var(--radius-md); padding:1.1rem; margin-bottom:1.25rem; font-size:0.9rem; color:#92400E; line-height:1.55;">
            <strong>No valid medical parameters found.</strong><br>
            MedLens could not detect recognizable laboratory biomarkers, test values, or clinical reference ranges in this uploaded document. For patient safety, MedLens never displays sample or fabricated results for unrecognized files.
          </div>

          <div style="background:var(--color-pale-green); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); padding:0.95rem 1rem; margin-bottom:1.5rem; font-size:0.84rem; color:var(--color-dark-green); line-height:1.5;">
            <strong>Supported Documents:</strong> Clear digital lab PDFs or high-resolution scans containing structured test tables (e.g., Complete Blood Count, Fasting Blood Glucose, Liver Function, or Renal Panel).
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; flex-wrap:wrap;">
            <button class="btn btn-secondary" onclick="window.MedLensApp.closeModal()">Close</button>
          </div>
        `;
        break;

      case 'report-details':
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem; padding-right:2rem;">
            <div>
              <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.4rem;">
                <span class="badge badge-mint">Medical Report View</span>
                <span class="badge badge-review">Sample / Demo Data</span>
              </div>
              <h3 style="font-size:1.4rem; color:var(--color-dark-green);">${escapeHtml(payload.title || 'Laboratory Report')}</h3>
              <span style="font-size:0.85rem; color:var(--color-text-secondary);">Tested Date: ${escapeHtml(payload.date || '2026')}</span>
            </div>
            <span class="badge badge-normal">Sample Analyzed ✓</span>
          </div>

          <div id="report-explanation-section" style="background:var(--color-pale-green); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); padding:1rem; margin-bottom:1.25rem; font-size:0.88rem; color:var(--color-dark-green); line-height:1.5;">
            <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.5rem;">
              <button type="button" class="explain-audio-btn" id="report-summary-audio-btn" title="Read explanation aloud" aria-label="Read explanation aloud" style="width:34px; height:34px; border-radius:50%; background:var(--color-very-light-mint); color:var(--color-dark-green); border:1.5px solid var(--color-emerald); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s ease; box-shadow:var(--shadow-sm); flex-shrink:0; padding:0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:17px; height:17px; display:block;">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              </button>
              <strong>View Explanation — AI Clinical Summary:</strong>
            </div>
            <div id="report-summary-readable-text">
              ${escapeHtml((payload.aiSummary && payload.aiSummary.note) || 'All primary parameters within healthy reference ranges.')}
            </div>
          </div>

          <div style="max-height:260px; overflow-y:auto; margin-bottom:1.5rem;">
            <table class="demo-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Result</th>
                  <th>Status</th>
                  <th>Standard Range</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${(payload.parameters || []).map((p, idx) => `
                  <tr>
                    <td><strong>${escapeHtml(p.name)}</strong></td>
                    <td><strong>${escapeHtml(p.value)}</strong></td>
                    <td><span class="badge ${p.status === 'Normal' ? 'badge-normal' : 'badge-review'}">${escapeHtml(p.status)}</span></td>
                    <td style="color:var(--color-text-secondary);">${escapeHtml(p.range)}</td>
                    <td>
                      <button type="button" class="explain-btn modal-param-explain-btn" data-param-idx="${idx}">
                        <i data-lucide="help-circle" style="width:14px;height:14px;"></i>
                        View Explanation
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; flex-wrap:wrap;">
            <button class="btn btn-secondary" id="modal-report-share-btn">Share</button>
            <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Close</button>
          </div>
        `;
        break;

      case 'upload-report':
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <div style="text-align:center; margin-bottom:1.5rem;">
            <div style="width:58px; height:58px; border-radius:50%; background:var(--color-very-light-mint); color:var(--color-emerald); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; border:1px solid var(--color-light-mint);">
              <i data-lucide="upload-cloud" style="width:30px;height:30px;"></i>
            </div>
            <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.3rem;">Upload Medical Report</h3>
            <p style="font-size:0.88rem; color:var(--color-text-secondary);">Select digital lab results or scanned paper reports</p>
          </div>

          <div style="border:2px dashed var(--color-emerald); border-radius:var(--radius-lg); padding:2rem 1.5rem; text-align:center; background:var(--color-pale-green); margin-bottom:1.5rem; cursor:pointer;" id="modal-upload-dropzone">
            <i data-lucide="file-text" style="width:36px;height:36px;color:var(--color-emerald);margin-bottom:0.5rem;"></i>
            <p style="font-weight:700; color:var(--color-dark-green); margin-bottom:0.25rem;">Choose File or Drag & Drop</p>
            <p style="font-size:0.8rem; color:var(--color-text-secondary);">PDF, JPG, JPEG, PNG up to 15MB</p>
            <input type="file" id="modal-file-input" accept=".pdf,.png,.jpg,.jpeg" style="display:none;">
            <button class="btn btn-primary btn-sm" style="margin-top:1rem;" onclick="document.getElementById('modal-file-input').click()">Browse Device</button>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button class="btn btn-secondary" onclick="window.MedLensApp.closeModal()">Cancel</button>
          </div>
        `;
        break;

      case 'compare-reports':
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <div style="margin-bottom:1.5rem;">
            <div class="badge badge-mint" style="margin-bottom:0.4rem;">Comparative Diagnostics</div>
            <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.3rem;">Compare Medical Reports</h3>
            <p style="font-size:0.88rem; color:var(--color-text-secondary);">Review biomarker changes between your consecutive tests.</p>
          </div>

          <div class="onboarding-grid-2" style="margin-bottom:1.5rem;">
            <div style="padding:1rem; background:var(--color-pale-green); border:1px solid var(--color-light-mint); border-radius:var(--radius-md);">
              <strong>Test A (Baseline):</strong>
              <div style="font-size:0.82rem; color:var(--color-text-secondary); margin-top:0.25rem;">Complete Blood Count (18 Sep 2026)</div>
              <div style="font-size:0.85rem; color:var(--color-dark-green); margin-top:0.5rem;">Hemoglobin: <strong>13.2 g/dL</strong></div>
            </div>
            <div style="padding:1rem; background:var(--color-soft-mint); border:1px solid var(--color-light-mint); border-radius:var(--radius-md);">
              <strong>Test B (Comparison):</strong>
              <div style="font-size:0.82rem; color:var(--color-text-secondary); margin-top:0.25rem;">CBC Panel (15 Jul 2026)</div>
              <div style="font-size:0.85rem; color:var(--color-dark-green); margin-top:0.5rem;">Hemoglobin: <strong>13.0 g/dL</strong> (+0.2 g/dL)</div>
            </div>
          </div>

          <div style="text-align:right;">
            <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Close Comparison</button>
          </div>
        `;
        break;

      case 'view-trends':
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <div style="margin-bottom:1.25rem;">
            <div class="badge badge-mint" style="margin-bottom:0.4rem;">Trend Analysis</div>
            <h3 style="font-size:1.4rem; color:var(--color-dark-green);">Fasting Blood Glucose Longitudinal Trend</h3>
            <p style="font-size:0.88rem; color:var(--color-text-secondary);">Historical progression over consecutive tests</p>
          </div>

          <div class="trend-chart-box" style="height:150px; margin-bottom:1.5rem;">
            <svg width="100%" height="100%" viewBox="0 0 500 120" preserveAspectRatio="none">
              <line x1="0" y1="30" x2="500" y2="30" stroke="#E2E8F0" stroke-dasharray="4"/>
              <line x1="0" y1="60" x2="500" y2="60" stroke="#E2E8F0" stroke-dasharray="4"/>
              <line x1="0" y1="90" x2="500" y2="90" stroke="#E2E8F0" stroke-dasharray="4"/>
              <path d="M0,95 L125,80 L250,65 L375,40 L500,25" fill="none" stroke="#10B981" stroke-width="3.5" stroke-linecap="round"/>
              <circle cx="0" cy="95" r="5" fill="#064E3B"/>
              <circle cx="125" cy="80" r="5" fill="#064E3B"/>
              <circle cx="250" cy="65" r="5" fill="#064E3B"/>
              <circle cx="375" cy="40" r="5.5" fill="#F59E0B"/>
              <circle cx="500" cy="25" r="6" fill="#F43F5E"/>
            </svg>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--color-text-secondary); margin-bottom:1.5rem; flex-wrap:wrap; gap:0.5rem;">
            <span>20 May (92 mg/dL)</span>
            <span>03 Jun (98 mg/dL)</span>
            <span>15 Jul (102 mg/dL)</span>
            <span>28 Aug (108 mg/dL)</span>
          </div>

          <div style="text-align:right;">
            <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Close Trends</button>
          </div>
        `;
        break;

      case 'export-summary':
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <div style="text-align:center; margin-bottom:1.5rem;">
            <div style="width:58px; height:58px; border-radius:50%; background:var(--color-very-light-mint); color:var(--color-emerald); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; border:1px solid var(--color-light-mint);">
              <i data-lucide="download" style="width:28px;height:28px;"></i>
            </div>
            <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.3rem;">Export Health Summary</h3>
            <p style="font-size:0.88rem; color:var(--color-text-secondary);">Download a consolidated physician-ready medical record.</p>
          </div>

          <div style="padding:1.25rem; background:var(--color-pale-green); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); margin-bottom:1.5rem; font-size:0.88rem; line-height:1.5; color:var(--color-dark-green);">
            Includes all 12 verified lab parameters, longitudinal glucose tracking, timeline milestones, and clinical disclaimers for Dr. Consultation.
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button class="btn btn-secondary" onclick="window.MedLensApp.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="window.MedLensApp.showToast('✓ Medical PDF Summary Generated & Downloaded!'); window.MedLensApp.closeModal();">Download PDF</button>
          </div>
        `;
        break;

      case 'analysis-on-hold':
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <div style="text-align:center; padding:1rem 0;">
            <i data-lucide="alert-circle" style="width:48px;height:48px;color:#F59E0B;margin-bottom:1rem;"></i>
            <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.5rem;">Detailed Analysis ON HOLD</h3>
            <p style="font-size:0.9rem; color:var(--color-text-secondary); line-height:1.5; margin-bottom:1.5rem;">
              The detailed medical interpretation engine is currently kept on hold pending clinical compliance protocols. Your document has been stored securely in your Report Locker.
            </p>
            <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Understood</button>
          </div>
        `;
        break;

      case 'settings':
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <div style="margin-bottom:1.5rem;">
            <div class="badge badge-mint" style="margin-bottom:0.4rem;">Patient Settings</div>
            <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.3rem;">Preferences & Security</h3>
            <p style="font-size:0.88rem; color:var(--color-text-secondary);">Manage your MedLens patient profile, alerts, and report privacy.</p>
          </div>

          <div style="display:flex; flex-direction:column; gap:1rem; margin-bottom:1.5rem;">
            <div style="padding:1rem; background:var(--color-pale-mint); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center; gap:0.75rem;">
              <div>
                <strong style="color:var(--color-dark-green); font-size:0.95rem;">Lab Report Notifications</strong>
                <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.2rem;">Receive alerts when new tests are verified or values flagged.</p>
              </div>
              <input type="checkbox" checked style="width:18px; height:18px; accent-color:var(--color-emerald); cursor:pointer;">
            </div>

            <div style="padding:1rem; background:var(--color-pale-mint); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center; gap:0.75rem;">
              <div>
                <strong style="color:var(--color-dark-green); font-size:0.95rem;">Encrypted Cloud Locker</strong>
                <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.2rem;">End-to-end 256-bit AES encryption for all uploaded records.</p>
              </div>
              <span class="badge badge-normal">Active ✓</span>
            </div>

            <div style="padding:1rem; background:var(--color-pale-mint); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center; gap:0.75rem;">
              <div>
                <strong style="color:var(--color-dark-green); font-size:0.95rem;">Health Profile & Basic Details</strong>
                <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.2rem;">Update blood group, allergies, or emergency contact.</p>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="window.MedLensApp.closeModal(); window.MedLensApp.navigateTo('profile');">Edit</button>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button class="btn btn-secondary" onclick="window.MedLensApp.closeModal()">Close</button>
            <button class="btn btn-primary" onclick="window.MedLensApp.showToast('✓ Settings Saved Successfully'); window.MedLensApp.closeModal();">Save Preferences</button>
          </div>
        `;
        break;

      case 'edit-profile':
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.5rem;">Edit Profile</h3>
          <p style="font-size:0.85rem; color:var(--color-text-secondary); margin-bottom:1.5rem;">Update your health account personal information.</p>

          <form id="edit-profile-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="edit-name">Full Name</label>
              <input type="text" id="edit-name" class="form-input" value="${escapeHtml(payload.fullName || '')}" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-email">Email Address</label>
              <input type="email" id="edit-email" class="form-input" value="${escapeHtml(payload.email || '')}" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-phone">Phone Number</label>
              <input type="tel" id="edit-phone" class="form-input" inputmode="numeric" pattern="[0-9]{10,15}" maxlength="15" placeholder="e.g. 9876543210" value="${escapeHtml(extractNumericDigits(payload.phone || ''))}" required>
              <span class="field-error" id="err-edit-phone" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-emergency">Emergency Contact</label>
              <input type="tel" id="edit-emergency" class="form-input" inputmode="numeric" pattern="[0-9]{10,15}" maxlength="15" placeholder="e.g. 9876500000" value="${escapeHtml(extractNumericDigits(payload.emergencyContact || ''))}">
              <span class="field-error" id="err-edit-emergency" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
            </div>

            <div class="edit-profile-grid">
              <div class="form-group">
                <label class="form-label" for="edit-dob">Date of Birth</label>
                <input type="date" id="edit-dob" class="form-input" min="1900-01-01" max="${getTodayIsoDate()}" value="${escapeHtml(toIsoDateValue(payload.dob || ''))}" required>
                <span class="field-error" id="err-edit-dob" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
              </div>
              <div class="form-group">
                <label class="form-label" for="edit-gender">Gender</label>
                <select id="edit-gender" class="form-input">
                  <option ${payload.gender === 'Female' ? 'selected' : ''}>Female</option>
                  <option ${payload.gender === 'Male' ? 'selected' : ''}>Male</option>
                  <option ${payload.gender === 'Other' ? 'selected' : ''}>Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="edit-blood">Blood Group</label>
                <select id="edit-blood" class="form-input">
                  <option value="A+" ${payload.bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
                  <option value="A-" ${payload.bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
                  <option value="B+" ${payload.bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
                  <option value="B-" ${payload.bloodGroup === 'B-' ? 'selected' : ''}>B-</option>
                  <option value="AB+" ${payload.bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
                  <option value="AB-" ${payload.bloodGroup === 'AB-' ? 'selected' : ''}>AB-</option>
                  <option value="O+" ${payload.bloodGroup === 'O+' || !payload.bloodGroup ? 'selected' : ''}>O+</option>
                  <option value="O-" ${payload.bloodGroup === 'O-' ? 'selected' : ''}>O-</option>
                </select>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
              <button type="button" class="btn btn-secondary" onclick="window.MedLensApp.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        `;
        break;

      case 'feature-detail':
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <div class="badge badge-mint" style="margin-bottom:0.75rem;">MedLens Capability</div>
          <h3 style="font-size:1.5rem; color:var(--color-dark-green); margin-bottom:0.75rem;">${escapeHtml(payload.title || 'Feature Explanation')}</h3>
          
          <p style="font-size:0.98rem; color:var(--color-text-main); line-height:1.6; margin-bottom:1.5rem;">
            ${escapeHtml(payload.summary || 'MedLens provides comprehensive medical report interpretation and health timeline tracking.')}
          </p>

          <div style="background:var(--color-very-light-mint); border-left:4px solid var(--color-emerald); padding:1rem; border-radius:var(--radius-md); font-size:0.88rem; color:var(--color-dark-green); line-height:1.5;">
            <strong>Key Benefit:</strong> Reduces complexity, eliminates confusing medical jargon, and gives patients and doctors a shared baseline.
          </div>

          <div style="margin-top:1.75rem; text-align:right;">
            <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Understood</button>
          </div>
        `;
        break;

      case 'parameter-explanation':
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <div class="view-explanation-topbar" style="display:flex; align-items:center; gap:0.65rem; margin-bottom:1rem; padding-right:2.5rem;">
            <button type="button" class="explain-audio-btn" id="explain-audio-btn" title="Read explanation aloud" aria-label="Read explanation aloud" style="width:38px; height:38px; border-radius:50%; background:var(--color-very-light-mint); color:var(--color-dark-green); border:1.5px solid var(--color-emerald); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s ease; box-shadow:var(--shadow-sm); flex-shrink:0; padding:0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:19px; height:19px; display:block;">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            </button>
            <span class="badge badge-mint" style="font-size:0.85rem; padding:0.35rem 0.75rem;">View Explanation • ${escapeHtml(payload.category || 'Biomarker')}</span>
          </div>
          <div id="explanation-readable-content">
            <h3 style="font-size:1.5rem; color:var(--color-dark-green); margin-bottom:0.5rem;">${escapeHtml(payload.title || 'Parameter Explanation')}</h3>
            <p style="font-size:0.85rem; color:var(--color-emerald); font-weight:700; margin-bottom:1rem;">Standard Reference: ${escapeHtml(payload.normalRange || 'Normal range varies')}</p>

            <p style="font-size:0.95rem; color:var(--color-text-main); line-height:1.6; margin-bottom:1rem;">
              ${escapeHtml(payload.summary || 'Detailed clinical biomarker explanation.')}
            </p>

            <div style="background:var(--color-pale-green); border-radius:var(--radius-md); padding:1rem; margin-bottom:1rem; border:1px solid var(--color-light-mint);">
              <strong style="color:var(--color-dark-green); font-size:0.9rem;">What it means:</strong>
              <p style="font-size:0.88rem; color:var(--color-text-secondary); margin-top:0.25rem;">${escapeHtml(payload.whatItMeans || 'Consult your healthcare provider for personalized clinical interpretation.')}</p>
            </div>

            <div style="background:var(--color-soft-mint); border-radius:var(--radius-md); padding:1rem; margin-bottom:1.5rem; border:1px solid var(--color-light-mint);">
              <strong style="color:var(--color-dark-green); font-size:0.9rem;">Lifestyle Support:</strong>
              <p style="font-size:0.88rem; color:var(--color-text-secondary); margin-top:0.25rem;">${escapeHtml(payload.lifestyleTip || 'Maintain balanced nutrition, regular hydration, and routine follow-up testing.')}</p>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; flex-wrap:wrap;">
            ${payload._returnReport ? `<button type="button" class="btn btn-secondary" id="back-to-report-btn">← Back to Report</button>` : ''}
            <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Got it</button>
          </div>
        `;
        break;

      case 'notifications':
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <h3 style="font-size:1.3rem; color:var(--color-dark-green); margin-bottom:1rem;">Notifications</h3>
          
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            <div style="padding:0.85rem; background:var(--color-very-light-mint); border-radius:var(--radius-md); border-left:3px solid var(--color-emerald);">
              <strong style="font-size:0.88rem; color:var(--color-dark-green);">Report Locker Active</strong>
              <p style="font-size:0.8rem; color:var(--color-text-secondary);">Your medical reports are encrypted and stored in your Locker.</p>
            </div>
            <div style="padding:0.85rem; background:var(--color-pale-green); border-radius:var(--radius-md); border-left:3px solid var(--color-emerald);">
              <strong style="font-size:0.88rem; color:var(--color-dark-green);">Profile Synced</strong>
              <p style="font-size:0.8rem; color:var(--color-text-secondary);">Basic onboarding details saved for ${escapeHtml((window.MedLensApp && window.MedLensApp.getUserDetails()?.fullName) || 'Patient')}.</p>
            </div>
          </div>
        `;
        break;

      default:
        bodyHtml = `
          <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
            <i data-lucide="x"></i>
          </button>
          <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.5rem;">${escapeHtml(payload.title || 'Notification')}</h3>
          <p style="font-size:0.9rem; color:var(--color-text-secondary); margin-bottom:1.5rem;">MedLens feature ready.</p>
          <div style="text-align:right;">
            <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">OK</button>
          </div>
        `;
        break;
    }

    modalContent.innerHTML = bodyHtml;
    if (window.lucide) window.lucide.createIcons();

    function bindSpeechToggle(btnEl, getSpeechTextFn) {
      if (!btnEl) return;
      btnEl.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            btnEl.style.background = 'var(--color-very-light-mint)';
            btnEl.style.color = 'var(--color-dark-green)';
            return;
          }
          const speechText = getSpeechTextFn();
          if (!speechText) return;
          const utterance = new SpeechSynthesisUtterance(speechText);
          utterance.rate = 0.98;
          btnEl.style.background = 'var(--color-emerald)';
          btnEl.style.color = '#FFFFFF';
          utterance.onend = () => {
            btnEl.style.background = 'var(--color-very-light-mint)';
            btnEl.style.color = 'var(--color-dark-green)';
          };
          utterance.onerror = () => {
            btnEl.style.background = 'var(--color-very-light-mint)';
            btnEl.style.color = 'var(--color-dark-green)';
          };
          window.speechSynthesis.speak(utterance);
        } else if (window.MedLensApp) {
          window.MedLensApp.showToast('Audio playback is not supported in this browser.');
        }
      });
    }

    const explainAudioBtn = modalContent.querySelector('#explain-audio-btn');
    bindSpeechToggle(explainAudioBtn, () => {
      const readableContainer = modalContent.querySelector('#explanation-readable-content');
      return (readableContainer && readableContainer.innerText ? readableContainer.innerText.replace(/\s+/g, ' ').trim() : '') || [
        payload.title || 'Parameter Explanation',
        payload.normalRange ? `Standard reference range: ${payload.normalRange}.` : '',
        payload.summary || '',
        payload.whatItMeans ? `What it means: ${payload.whatItMeans}` : '',
        payload.lifestyleTip ? `Lifestyle support: ${payload.lifestyleTip}` : ''
      ].filter(Boolean).join(' ');
    });

    const reportSummaryAudioBtn = modalContent.querySelector('#report-summary-audio-btn');
    bindSpeechToggle(reportSummaryAudioBtn, () => {
      const summaryEl = modalContent.querySelector('#report-summary-readable-text');
      const summaryText = summaryEl ? summaryEl.innerText.trim() : ((payload.aiSummary && payload.aiSummary.note) || '');
      const paramLines = (payload.parameters || []).map(p => `${p.name}: ${p.value} (${p.status}, standard range ${p.range})`).join('. ');
      return [payload.title || 'Medical Report', summaryText, paramLines].filter(Boolean).join('. ');
    });

    const backToReportBtn = modalContent.querySelector('#back-to-report-btn');
    if (backToReportBtn && payload._returnReport) {
      backToReportBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        window.MedLensApp.openModal('report-details', payload._returnReport);
      });
    }

    modalContent.querySelectorAll('.modal-param-explain-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-param-idx'), 10);
        const param = (payload.parameters || [])[idx];
        if (!param || !window.MedLensApp) return;
        const baseExplanation = (param.code && MEDICAL_EXPLANATIONS && MEDICAL_EXPLANATIONS[param.code]) || {
          title: `${param.name} (${param.value})`,
          category: payload.title || 'Clinical Biomarker',
          normalRange: param.range || 'Standard reference range',
          summary: `${param.name} was measured at ${param.value} (${param.status || 'Analyzed'}) against the reference range of ${param.range || 'normal limits'}.`,
          whatItMeans: param.status === 'Normal'
            ? `Your ${param.name} result of ${param.value} falls within the expected healthy reference range (${param.range}).`
            : `Your ${param.name} result of ${param.value} is outside the standard reference range (${param.range}) and is marked "${param.status}". Please review with your clinician.`,
          lifestyleTip: 'Maintain balanced nutrition, regular hydration, and routine follow-up testing as advised by your doctor.'
        };
        window.MedLensApp.openModal('parameter-explanation', {
          ...baseExplanation,
          _returnReport: payload
        });
      });
    });

    const modalReportShareBtn = modalContent.querySelector('#modal-report-share-btn');
    if (modalReportShareBtn) {
      modalReportShareBtn.addEventListener('click', () => {
        window.MedLensApp.openModal('share-report', payload);
      });
    }

    const editProfileForm = modalContent.querySelector('#edit-profile-form');
    if (editProfileForm) {
      const editDobInput = modalContent.querySelector('#edit-dob');
      const errEditDob = modalContent.querySelector('#err-edit-dob');
      const editPhoneInput = modalContent.querySelector('#edit-phone');
      const errEditPhone = modalContent.querySelector('#err-edit-phone');
      const editEmergencyInput = modalContent.querySelector('#edit-emergency');
      const errEditEmergency = modalContent.querySelector('#err-edit-emergency');

      bindDobPickerField(editDobInput, errEditDob);
      bindNumericOnlyField(editPhoneInput, errEditPhone, 'Phone Number');
      bindNumericOnlyField(editEmergencyInput, errEditEmergency, 'Emergency Contact');

      editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const isDobValid = validateDobField(editDobInput, errEditDob, true);
        const isPhoneValid = validateNumericPhoneField(editPhoneInput, errEditPhone, 'Phone Number', true);
        const isEmergencyValid = validateNumericPhoneField(editEmergencyInput, errEditEmergency, 'Emergency Contact', false);

        if (!isDobValid || !isPhoneValid || !isEmergencyValid) {
          return;
        }

        const nameVal = sanitizePlainText(modalContent.querySelector('#edit-name').value) || 'Patient';
        const emailVal = sanitizePlainText(modalContent.querySelector('#edit-email').value);
        const phoneVal = sanitizePlainText(editPhoneInput.value);
        const rawDobVal = sanitizePlainText(editDobInput.value);
        // Preserve existing saved DOB format if the user did not change the date value
        const dobVal = (payload.dob && toIsoDateValue(payload.dob) === rawDobVal) ? payload.dob : rawDobVal;
        const genderVal = sanitizePlainText(modalContent.querySelector('#edit-gender').value);
        const bloodVal = sanitizePlainText(modalContent.querySelector('#edit-blood').value);
        const rawEmergencyVal = editEmergencyInput ? sanitizePlainText(editEmergencyInput.value) : '';
        const emergencyVal = (payload.emergencyContact && extractNumericDigits(payload.emergencyContact) === rawEmergencyVal && rawEmergencyVal !== '')
          ? rawEmergencyVal
          : rawEmergencyVal;

        window.MedLensApp.updateUserProfile({
          fullName: nameVal,
          email: emailVal,
          phone: phoneVal,
          dob: dobVal,
          gender: genderVal,
          bloodGroup: bloodVal,
          emergencyContact: emergencyVal || payload.emergencyContact || ''
        });

        window.MedLensApp.closeModal();
        window.MedLensApp.showToast('Profile updated successfully.');
      });
    }

    const copyBtn = modalContent.querySelector('#share-copy-link-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText(window.location.href);
        window.MedLensApp.showToast('✓ Share link copied to clipboard!');
      });
    }

    const downloadBtn = modalContent.querySelector('#share-download-pdf-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        window.MedLensApp.showToast('✓ Document download started.');
        window.MedLensApp.closeModal();
      });
    }

    const modalFileInput = modalContent.querySelector('#modal-file-input');
    if (modalFileInput) {
      modalFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const safeFileName = sanitizePlainText(file.name) || 'Uploaded_Report.pdf';
          const uploadedEntry = {
            fileName: safeFileName,
            name: safeFileName.replace(/\.[^/.]+$/, ''),
            reportType: 'Uploaded Document (Unverified)',
            fileSize: file.size ? `${Math.max(0.1, (file.size / (1024 * 1024))).toFixed(1)} MB` : '1.2 MB',
            uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            status: 'Unable to Analyze',
            badgeClass: 'badge-review',
            isUploaded: true,
            isSample: false,
            demoTabKey: null
          };
          window.MedLensApp.addReportFile(uploadedEntry);
          window.MedLensApp.render();
          window.MedLensApp.openModal('report-unrecognized', uploadedEntry);
        }
      });
    }
  }

  // =========================================================
  // 4. LANDING PAGE
  // =========================================================
  function renderLandingPage(containerEl) {
    let activeTab = 'CBC';

    containerEl.innerHTML = `
      <div id="navbar-slot"></div>

      <div class="landing-content-wrapper">
        <section class="hero-section" id="hero">
          <!-- Background Animated Mint Blobs & Shapes -->
          <div class="hero-bg-blobs" aria-hidden="true">
            <div class="mint-blob blob-1"></div>
            <div class="mint-blob blob-2"></div>
            <div class="mint-blob blob-3"></div>
            <div class="floating-circle-shape circle-shape-1"></div>
            <div class="floating-circle-shape circle-shape-2"></div>
            <div class="floating-circle-shape circle-shape-3"></div>
          </div>

          <div class="container">
            <div class="hero-grid">
              <div class="hero-content">
                <div class="badge badge-mint hero-badge">
                  <i data-lucide="sparkles" style="width:14px;height:14px;color:var(--color-emerald);"></i>
                  AI-Powered • Secure • Trusted
                </div>
                <h1 class="hero-title">
                  Understand Your Medical Reports.<br>
                  <span class="text-emerald">Track Your Health Journey.</span>
                </h1>
                <p class="hero-description">
                  MedLens intelligently interprets medical reports and organizes your health information into a simple, easy-to-understand timeline.
                </p>
                <div class="hero-ctas">
                  <button class="btn btn-primary btn-lg" id="hero-getstarted-btn">Get Started</button>
                  <button class="btn btn-secondary btn-lg" id="hero-signin-btn">Sign In</button>
                </div>
                <div class="hero-trust-indicators">
                  <div class="trust-item">
                    <i data-lucide="check-circle-2" class="trust-icon" style="width:18px;height:18px;"></i>
                    <span>Smart Insights</span>
                  </div>
                  <div class="trust-item">
                    <i data-lucide="shield-check" class="trust-icon icon-shield-glowing" style="width:18px;height:18px;"></i>
                    <span>Easy to Use</span>
                  </div>
                  <div class="trust-item">
                    <i data-lucide="lock" class="trust-icon" style="width:18px;height:18px;"></i>
                    <span>100% Secure</span>
                  </div>
                </div>
              </div>

              <div class="hero-visual">
                <!-- Staggered Floating Cards around Central Dashboard Preview -->
                <div class="floating-badge floating-badge-top">
                  <i data-lucide="file-text" class="icon-file-floating" style="color:var(--color-emerald);width:16px;height:16px;"></i>
                  <span>Medical Report • Blood Panel</span>
                </div>

                <div class="floating-badge floating-badge-1">
                  <i data-lucide="check-circle" style="color:var(--color-emerald);width:16px;height:16px;"></i>
                  <span>Report Analyzed ✓</span>
                </div>

                <div class="floating-badge floating-badge-midleft">
                  <i data-lucide="heart-pulse" class="icon-heart-pulsing" style="color:#F59E0B;width:16px;height:16px;"></i>
                  <span>Glucose: 108 mg/dL • Review</span>
                </div>
                
                <div class="floating-badge floating-badge-2">
                  <i data-lucide="line-chart" style="color:var(--color-emerald);width:16px;height:16px;"></i>
                  <span>Health Timeline Updated</span>
                </div>

                <div class="floating-badge floating-badge-3">
                  <i data-lucide="activity" class="icon-heart-pulsing" style="color:var(--color-emerald);width:16px;height:16px;"></i>
                  <span>5 Parameters Normal</span>
                </div>

                <div class="preview-card">
                  <div class="preview-header">
                    <div class="preview-title-group">
                      <h4>Medical Report</h4>
                      <p>Blood Test • 28 Aug 2026</p>
                    </div>
                    <span class="badge badge-normal">Analyzed ✓</span>
                  </div>

                  <div class="preview-parameters">
                    <div class="param-item">
                      <div class="param-row">
                        <span class="param-name">Hemoglobin</span>
                        <span class="param-val">13.2 g/dL</span>
                        <span class="badge badge-normal">Normal</span>
                      </div>
                      <div class="param-bar-bg">
                        <div class="param-bar-fill fill-emerald" style="width: 70%;"></div>
                      </div>
                    </div>

                    <div class="param-item">
                      <div class="param-row">
                        <span class="param-name">Glucose</span>
                        <span class="param-val">108 mg/dL</span>
                        <span class="badge badge-review">Review</span>
                      </div>
                      <div class="param-bar-bg">
                        <div class="param-bar-fill fill-amber" style="width: 82%;"></div>
                      </div>
                    </div>

                    <div class="param-item">
                      <div class="param-row">
                        <span class="param-name">Vitamin D</span>
                        <span class="param-val">21 ng/mL</span>
                        <span class="badge badge-review">Review</span>
                      </div>
                      <div class="param-bar-bg">
                        <div class="param-bar-fill fill-amber" style="width: 45%;"></div>
                      </div>
                    </div>
                  </div>

                  <div class="preview-footer-link" id="hero-preview-view-btn">
                    <span>View Full Report</span>
                    <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="section features-section" id="features">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">Healthcare Information, Made Simple</h2>
              <p class="section-subtitle">Everything you need to understand your medical tests and monitor health changes over time.</p>
            </div>

            <div class="features-grid">
              <div class="feature-card" data-feature="interpretation">
                <div class="feature-icon-wrapper">
                  <i data-lucide="brain" style="width:26px;height:26px;"></i>
                </div>
                <h3>Intelligent Report Interpretation</h3>
                <p>Transform complex medical reports into simple, understandable insights without confusing medical jargon.</p>
                <span class="feature-link">Learn More <i data-lucide="arrow-right" style="width:14px;height:14px;"></i></span>
              </div>

              <div class="feature-card" data-feature="timeline">
                <div class="feature-icon-wrapper">
                  <i data-lucide="calendar" style="width:26px;height:26px;"></i>
                </div>
                <h3>Health Timeline</h3>
                <p>Organize medical reports and health events chronologically to see your entire medical history in one secure timeline.</p>
                <span class="feature-link">Learn More <i data-lucide="arrow-right" style="width:14px;height:14px;"></i></span>
              </div>

              <div class="feature-card" data-feature="trends">
                <div class="feature-icon-wrapper">
                  <i data-lucide="trending-up" style="width:26px;height:26px;"></i>
                </div>
                <h3>Health Trends</h3>
                <p>Track important health parameters and understand changes and fluctuations over time with visual chart graphs.</p>
                <span class="feature-link">Learn More <i data-lucide="arrow-right" style="width:14px;height:14px;"></i></span>
              </div>

              <div class="feature-card" data-feature="insights">
                <div class="feature-icon-wrapper">
                  <i data-lucide="sparkles" style="width:26px;height:26px;"></i>
                </div>
                <h3>Smart Insights</h3>
                <p>Highlight important changes, flagged parameters, and health patterns across your consecutive medical reports.</p>
                <span class="feature-link">Learn More <i data-lucide="arrow-right" style="width:14px;height:14px;"></i></span>
              </div>
            </div>
          </div>
        </section>

        <section class="section" id="how-it-works" style="background:var(--color-white); border-bottom:1px solid var(--color-border);">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">How MedLens Works</h2>
              <p class="section-subtitle">A simple 5-step process to turn complicated medical reports into clear health guidance.</p>
            </div>

            <div class="how-it-works-steps">
              <div class="how-it-works-line"></div>
              
              <div class="step-card">
                <div class="step-number">01</div>
                <h4>Upload Report</h4>
                <p>Upload digital lab PDF or scanned image</p>
              </div>

              <div class="step-card">
                <div class="step-number">02</div>
                <h4>Extract Information</h4>
                <p>OCR engine extracts medical test parameters</p>
              </div>

              <div class="step-card">
                <div class="step-number">03</div>
                <h4>Analyze Data</h4>
                <p>Values evaluated against standard ranges</p>
              </div>

              <div class="step-card">
                <div class="step-number">04</div>
                <h4>Generate Insights</h4>
                <p>Simple plain-language summary created</p>
              </div>

              <div class="step-card">
                <div class="step-number">05</div>
                <h4>Track Timeline</h4>
                <p>Health history automatically updated</p>
              </div>
            </div>
          </div>
        </section>

        <section class="section" id="interactive-demo" style="background:var(--color-pale-green);">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">See How MedLens Simplifies Your Reports</h2>
              <p class="section-subtitle">Click the tabs below to explore sample reports and test our simple explanation engine.</p>
            </div>

            <div class="demo-box">
              <div class="demo-tabs">
                <button class="demo-tab-btn active" data-tab="CBC">CBC</button>
                <button class="demo-tab-btn" data-tab="Blood Sugar">Blood Sugar</button>
                <button class="demo-tab-btn" data-tab="Liver">Liver</button>
                <button class="demo-tab-btn" data-tab="Kidney">Kidney</button>
              </div>

              <div id="demo-tab-content"></div>

              <div class="demo-disclaimer">
                <i data-lucide="shield-alert" style="width:18px;height:18px;flex-shrink:0;"></i>
                <span><strong>Medical Disclaimer:</strong> MedLens provides informational insights and does not replace professional medical advice. Always consult a physician for clinical evaluation.</span>
              </div>
            </div>
          </div>
        </section>

        <section class="section" style="background:var(--color-white);">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">Comprehensive Health Capabilities</h2>
              <p class="section-subtitle">Built with a future-ready architectural foundation for complete health monitoring.</p>
            </div>

            <div class="capabilities-grid">
              <div class="capability-card">
                <div class="capability-icon"><i data-lucide="cpu"></i></div>
                <div>
                  <h5>AI Report Interpretation</h5>
                  <p>Translates complex lab terms into clear insights.</p>
                </div>
              </div>

              <div class="capability-card">
                <div class="capability-icon"><i data-lucide="clock"></i></div>
                <div>
                  <h5>Health Timeline</h5>
                  <p>Organizes all reports chronologically.</p>
                </div>
              </div>

              <div class="capability-card">
                <div class="capability-icon"><i data-lucide="git-compare"></i></div>
                <div>
                  <h5>Report Comparison</h5>
                  <p>Compares changes between two consecutive tests.</p>
                </div>
              </div>

              <div class="capability-card">
                <div class="capability-icon"><i data-lucide="activity"></i></div>
                <div>
                  <h5>Health Trend Detection</h5>
                  <p>Tracks historical parameter increases & drops.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="section" style="padding-top:2rem; background:var(--color-soft-green-tint);">
          <div class="container">
            <div class="cta-banner">
              <h2>Start Understanding Your Health Better</h2>
              <p>Turn complicated medical information into a clearer health journey today.</p>
              <button class="btn btn-primary btn-lg" id="cta-getstarted-btn" style="background:var(--color-emerald);">
                Get Started Now →
              </button>
            </div>
          </div>
        </section>

        <footer class="footer">
          <div class="container">
            <div class="footer-container">
              <div class="footer-brand">
                <div class="brand-logo">
                  <div class="logo-icon"><i data-lucide="activity"></i></div>
                  <span class="logo-text"><span class="med">Med</span><span class="lens">Lens</span></span>
                </div>
                <p>Understand your medical reports.<br>Track your health journey.</p>
              </div>
              
              <div class="footer-col">
                <h5>Navigation</h5>
                <ul class="footer-links">
                  <li><a class="drawer-link" data-scroll="hero">Home</a></li>
                  <li><a class="drawer-link" data-scroll="features">Features</a></li>
                  <li><a class="drawer-link" data-scroll="how-it-works">How It Works</a></li>
                </ul>
              </div>

              <div class="footer-col">
                <h5>Legal</h5>
                <ul class="footer-links">
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Medical Disclaimer</a></li>
                </ul>
              </div>

              <div class="footer-col">
                <h5>Support</h5>
                <ul class="footer-links">
                  <li><a href="#">Help Center</a></li>
                  <li><a href="#">Contact Us</a></li>
                </ul>
              </div>
            </div>

            <div class="footer-bottom">
              <span>© 2026 MedLens. All rights reserved.</span>
              <span>Intelligent Medical Interpretation Engine</span>
            </div>
          </div>
        </footer>
      </div>
    `;

    const navbarSlot = containerEl.querySelector('#navbar-slot');
    if (navbarSlot) {
      renderNavbar(navbarSlot);
    }

    function renderDemoTab(tabKey) {
      const reportData = DEMO_REPORTS[tabKey] || DEMO_REPORTS['CBC'];
      const contentEl = containerEl.querySelector('#demo-tab-content');
      if (!contentEl) return;

      let rowsHtml = reportData.parameters.map(param => `
        <tr>
          <td><strong>${param.name}</strong></td>
          <td><strong style="color:var(--color-dark-green);">${param.value}</strong></td>
          <td>
            <span class="badge ${param.status === 'Normal' ? 'badge-normal' : 'badge-review'}">
              ${param.status}
            </span>
          </td>
          <td style="color:var(--color-text-secondary);">${param.range}</td>
          <td>
            ${param.code ? `
              <button class="explain-btn" data-explain="${param.code}">
                <i data-lucide="help-circle" style="width:14px;height:14px;"></i>
                View Explanation
              </button>
            ` : ''}
          </td>
        </tr>
      `).join('');

      contentEl.innerHTML = `
        <div class="demo-content-grid animate-fade-in">
          <div class="demo-table-wrapper">
            <table class="demo-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Reference Range</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>

          <div class="demo-ai-card">
            <h4>
              <i data-lucide="sparkles"></i>
              MedLens AI Summary
            </h4>
            <ul class="demo-ai-summary-list">
              <li><i data-lucide="check" style="color:var(--color-light-mint);"></i> ${reportData.aiSummary.totalAnalyzed} Parameters Analyzed</li>
              <li><i data-lucide="check" style="color:var(--color-light-mint);"></i> ${reportData.aiSummary.normalCount} Normal Parameters</li>
              ${reportData.aiSummary.reviewCount > 0 ? `
                <li><i data-lucide="alert-circle" style="color:#FDE68A;"></i> ${reportData.aiSummary.reviewCount} Need Review</li>
              ` : ''}
            </ul>
            <p style="font-size:0.88rem; color:var(--color-light-mint); line-height:1.5;">
              "${reportData.aiSummary.note}"
            </p>
          </div>
        </div>
      `;

      contentEl.querySelectorAll('[data-explain]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const code = e.currentTarget.getAttribute('data-explain');
          const detail = MEDICAL_EXPLANATIONS[code] || {
            title: 'Biomarker Explanation',
            category: 'Laboratory Parameter',
            normalRange: 'Standard clinical reference range',
            summary: 'This parameter measures an important physiological biomarker used to evaluate organ and cellular health.',
            whatItMeans: 'Values within the standard reference range indicate balanced physiological function.',
            lifestyleTip: 'Maintain balanced nutrition, regular physical activity, and routine follow-ups with your physician.'
          };
          if (window.MedLensApp) {
            window.MedLensApp.openModal('parameter-explanation', detail);
          }
        });
      });

      if (window.lucide) window.lucide.createIcons();
    }

    renderDemoTab(activeTab);

    const tabBtns = containerEl.querySelectorAll('.demo-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        activeTab = e.currentTarget.getAttribute('data-tab');
        renderDemoTab(activeTab);
      });
    });

    const goToAuth = () => window.MedLensApp.navigateTo('auth');

    const heroGetStarted = containerEl.querySelector('#hero-getstarted-btn');
    const heroSignIn = containerEl.querySelector('#hero-signin-btn');
    const ctaGetStarted = containerEl.querySelector('#cta-getstarted-btn');
    const previewViewBtn = containerEl.querySelector('#hero-preview-view-btn');

    if (heroGetStarted) heroGetStarted.addEventListener('click', goToAuth);
    if (heroSignIn) heroSignIn.addEventListener('click', goToAuth);
    if (ctaGetStarted) ctaGetStarted.addEventListener('click', goToAuth);
    if (previewViewBtn) previewViewBtn.addEventListener('click', () => {
      if (window.MedLensApp) {
        window.MedLensApp.openModal('report-details', DEMO_REPORTS['CBC']);
      }
    });

    const featureDescriptions = {
      interpretation: {
        title: 'Intelligent Report Interpretation',
        summary: 'MedLens parses complex PDF lab reports and images using medical NLP to translate raw numerical results into plain-language health explanations.'
      },
      timeline: {
        title: 'Health Timeline',
        summary: 'Automatically stores and structures all your lab reports chronologically, giving you and your physicians a complete historical health record.'
      },
      trends: {
        title: 'Health Parameter Trends',
        summary: 'Tracks key metrics over time (e.g. Glucose, Hemoglobin, Cholesterol) to identify subtle rising or falling trends before symptoms occur.'
      },
      insights: {
        title: 'Smart Insights & Alerts',
        summary: 'Detects out-of-range values and highlights changes between consecutive tests to keep you proactive about your wellness.'
      }
    };

    containerEl.querySelectorAll('.feature-card').forEach(card => {
      card.addEventListener('click', () => {
        const featureKey = card.getAttribute('data-feature');
        const details = featureDescriptions[featureKey] || {
          title: 'MedLens Health Feature',
          summary: 'Designed for intelligent report processing and timeline tracking.'
        };
        if (window.MedLensApp) {
          window.MedLensApp.openModal('feature-detail', details);
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // =========================================================
  // 5. AUTHENTICATION COMPONENT
  // =========================================================
  function renderAuthPage(containerEl) {
    let isSignUpMode = false;
    let showPassword = false;

    function updateAuthRender() {
      containerEl.innerHTML = `
        <div class="auth-wrapper">
          <div class="auth-brand-side">
            ${createBrandLogoHtml()}

            <div class="auth-brand-content">
              <h2>Healthcare Made Clearer.</h2>
              <p>Sign in to access your personal medical reports, biomarker timelines, and longitudinal trends in one place.</p>
              
              <div class="auth-illustration-box">
                <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
                  <path d="M110 20 C150 20 180 50 180 90 C180 145 110 185 110 185 C110 185 40 145 40 90 C40 50 70 20 110 20 Z" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" stroke-width="3"/>
                  <path d="M110 65 L110 125" stroke="#A7F3D0" stroke-width="8" stroke-linecap="round"/>
                  <path d="M80 95 L140 95" stroke="#A7F3D0" stroke-width="8" stroke-linecap="round"/>
                </svg>
              </div>
            </div>

            <div style="font-size:0.85rem; color:var(--color-light-mint); opacity:0.8;">
              © 2026 MedLens Inc. • Clinical Grade Health Records
            </div>
          </div>

          <div class="auth-form-side">
            <div class="auth-card">
              <div class="auth-header">
                <h3>${isSignUpMode ? 'Create an Account' : 'Welcome Back'}</h3>
                <p>${isSignUpMode ? 'Start tracking your medical reports and timeline today' : 'Enter your credentials to access your health dashboard'}</p>
              </div>

              <div id="auth-error-banner" role="alert" style="display:none; background:#FFE4E6; border:1px solid #FECDD3; color:#BE123C; padding:0.75rem 1rem; border-radius:var(--radius-md); font-size:0.84rem; font-weight:600; margin-bottom:1rem;"></div>

              <form id="auth-form" novalidate>
                ${isSignUpMode ? `
                  <div class="form-group">
                    <label class="form-label" for="auth-fullname">Full Name</label>
                    <div class="input-wrapper">
                      <input type="text" id="auth-fullname" class="form-input" placeholder="e.g. Anshika Sharma" required>
                    </div>
                    <span class="field-error" id="err-fullname" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
                  </div>
                ` : ''}

                <div class="form-group">
                  <label class="form-label" for="auth-email">Email Address</label>
                  <div class="input-wrapper">
                    <input type="email" id="auth-email" class="form-input" placeholder="name@example.com" value="" required>
                  </div>
                  <span class="field-error" id="err-email" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
                </div>

                <div class="form-group">
                  <label class="form-label" for="auth-password">Password</label>
                  <div class="input-wrapper">
                    <input type="${showPassword ? 'text' : 'password'}" id="auth-password" class="form-input" placeholder="Enter your password" value="" required>
                    <span class="input-icon-right" id="toggle-pw-btn" title="Toggle password visibility">
                      <i data-lucide="${showPassword ? 'eye-off' : 'eye'}" style="width:18px;height:18px;"></i>
                    </span>
                  </div>
                  <span class="field-error" id="err-password" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
                  
                  ${isSignUpMode ? `
                    <div class="password-strength-bar">
                      <div class="password-strength-fill" id="pw-strength-fill"></div>
                    </div>
                  ` : ''}
                </div>

                ${isSignUpMode ? `
                  <div class="form-group">
                    <label class="form-label" for="auth-confirm-password">Confirm Password</label>
                    <div class="input-wrapper">
                      <input type="password" id="auth-confirm-password" class="form-input" placeholder="Re-enter your password" value="" required>
                    </div>
                    <span class="field-error" id="err-confirm-password" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
                  </div>
                ` : ''}

                <div class="form-options">
                  <label class="checkbox-label">
                    <input type="checkbox" id="auth-terms" checked>
                    <span>${isSignUpMode ? 'I accept the Terms & Privacy Policy' : 'Remember my device'}</span>
                  </label>
                  ${!isSignUpMode ? `<a class="forgot-link" id="forgot-pw-link" style="cursor:pointer;">Forgot password?</a>` : ''}
                </div>
                <span class="field-error" id="err-terms" style="display:none;color:#F43F5E;font-size:0.75rem;margin-bottom:0.8rem;"></span>

                <button type="submit" class="btn btn-primary btn-full btn-lg" id="auth-submit-btn">
                  <span id="btn-text">${isSignUpMode ? 'Create MedLens Account' : 'Sign In'}</span>
                  <i data-lucide="arrow-right" style="width:18px;height:18px;"></i>
                </button>
              </form>

              <div class="auth-switch-text">
                ${isSignUpMode ? 'Already have an account?' : "Don't have an account?"}
                <span class="auth-switch-link" id="toggle-auth-mode">
                  ${isSignUpMode ? 'Sign In' : 'Create Account'}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      const togglePwBtn = containerEl.querySelector('#toggle-pw-btn');
      if (togglePwBtn) {
        togglePwBtn.addEventListener('click', () => {
          showPassword = !showPassword;
          const pwInput = containerEl.querySelector('#auth-password');
          if (pwInput) {
            pwInput.type = showPassword ? 'text' : 'password';
          }
          togglePwBtn.innerHTML = `<i data-lucide="${showPassword ? 'eye-off' : 'eye'}" style="width:18px;height:18px;"></i>`;
          if (window.lucide) window.lucide.createIcons();
        });
      }

      const pwInput = containerEl.querySelector('#auth-password');
      const strengthFill = containerEl.querySelector('#pw-strength-fill');
      if (pwInput && strengthFill) {
        pwInput.addEventListener('input', () => {
          const val = pwInput.value;
          if (!val) {
            strengthFill.style.width = '0%';
          } else if (val.length < 6) {
            strengthFill.style.width = '33%';
            strengthFill.style.backgroundColor = '#F43F5E';
          } else if (val.length < 10) {
            strengthFill.style.width = '66%';
            strengthFill.style.backgroundColor = '#F59E0B';
          } else {
            strengthFill.style.width = '100%';
            strengthFill.style.backgroundColor = '#10B981';
          }
        });
      }

      const toggleModeLink = containerEl.querySelector('#toggle-auth-mode');
      if (toggleModeLink) {
        toggleModeLink.addEventListener('click', () => {
          isSignUpMode = !isSignUpMode;
          updateAuthRender();
        });
      }

      function clearAuthErrors() {
        const banner = containerEl.querySelector('#auth-error-banner');
        if (banner) {
          banner.style.display = 'none';
          banner.textContent = '';
        }
        containerEl.querySelectorAll('.field-error').forEach(el => {
          el.style.display = 'none';
          el.textContent = '';
        });
      }

      function showFieldError(id, msg) {
        const el = containerEl.querySelector(id);
        if (el) {
          el.textContent = msg;
          el.style.display = 'block';
        }
        const banner = containerEl.querySelector('#auth-error-banner');
        if (banner && banner.style.display === 'none') {
          banner.textContent = msg;
          banner.style.display = 'block';
        }
      }

      const authForm = containerEl.querySelector('#auth-form');
      if (authForm) {
        authForm.addEventListener('submit', (e) => {
          e.preventDefault();
          clearAuthErrors();

          const emailInput = containerEl.querySelector('#auth-email');
          const passwordInput = containerEl.querySelector('#auth-password');
          const emailVal = emailInput ? emailInput.value.trim() : '';
          const pwVal = passwordInput ? passwordInput.value : '';

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          let hasError = false;
          let fullNameVal = '';

          if (isSignUpMode) {
            const fullnameInput = containerEl.querySelector('#auth-fullname');
            fullNameVal = fullnameInput ? sanitizePlainText(fullnameInput.value) : '';
            if (!fullNameVal || fullNameVal.length < 2) {
              showFieldError('#err-fullname', 'Please enter your full name (at least 2 characters).');
              hasError = true;
            }
          }

          if (!emailVal || !emailRegex.test(emailVal)) {
            showFieldError('#err-email', 'Please enter a valid email address.');
            hasError = true;
          }

          if (!pwVal || pwVal.length < 6) {
            showFieldError('#err-password', 'Invalid password. Password must be at least 6 characters.');
            hasError = true;
          }

          if (isSignUpMode) {
            const confirmInput = containerEl.querySelector('#auth-confirm-password');
            const confirmVal = confirmInput ? confirmInput.value : '';
            if (confirmVal !== pwVal) {
              showFieldError('#err-confirm-password', 'Passwords do not match.');
              hasError = true;
            }
            const termsCheckbox = containerEl.querySelector('#auth-terms');
            if (termsCheckbox && !termsCheckbox.checked) {
              showFieldError('#err-terms', 'Please accept the Terms & Privacy Policy to continue.');
              hasError = true;
            }
          } else if (!hasError && window.MedLensApp) {
            // B01 FIX: Validate Sign-In credentials against registered accounts
            const authCheck = window.MedLensApp.validateLoginCredentials(emailVal, pwVal);
            if (!authCheck.valid) {
              showFieldError(authCheck.field === 'email' ? '#err-email' : '#err-password', authCheck.message);
              hasError = true;
            }
          }

          if (hasError) {
            return;
          }

          const submitBtn = containerEl.querySelector('#auth-submit-btn');
          const btnText = containerEl.querySelector('#btn-text');
          if (submitBtn) submitBtn.disabled = true;
          if (btnText) btnText.innerText = isSignUpMode ? 'Creating Account...' : 'Signing In...';

          setTimeout(() => {
            if (window.MedLensApp) {
              if (isSignUpMode) {
                window.MedLensApp.loginSuccess({
                  fullName: fullNameVal,
                  email: emailVal,
                  password: pwVal
                }, true);
              } else {
                window.MedLensApp.loginSuccess({
                  email: emailVal,
                  password: pwVal
                }, false);
              }
            }
          }, 250);
        });
      }
    }

    updateAuthRender();
  }

  // =========================================================
  // 6. ONBOARDING / BASIC DETAILS (1-TIME ONLY)
  // =========================================================
  function renderOnboardingPage(containerEl) {
    const userDetails = window.MedLensApp.getUserDetails() || {};

    containerEl.innerHTML = `
      <div style="min-height:100vh; background:var(--color-bg); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem 1rem;">
        <div style="width:100%; max-width:480px; background:var(--color-white); border-radius:var(--radius-xl); border:1px solid var(--color-border); box-shadow:var(--shadow-xl); padding:2.25rem;">
          
          <div style="text-align:center; margin-bottom:1.75rem;">
            ${createBrandLogoHtml()}
            <div class="badge badge-mint" style="margin-top:1rem; margin-bottom:0.5rem;">Step 1 of 1 • Profile Setup</div>
            <h2 style="font-size:1.75rem; color:var(--color-dark-green); margin-bottom:0.4rem;">Complete Your Basic Details</h2>
            <p style="font-size:0.9rem; color:var(--color-text-secondary);">Help us personalize your MedLens health record.</p>
          </div>

          <form id="onboarding-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="ob-fullname">Full Name *</label>
              <input type="text" id="ob-fullname" class="form-input" placeholder="e.g. Full Name" value="${escapeHtml(userDetails.fullName || '')}" required>
            </div>

            <div class="onboarding-grid-2">
              <div class="form-group">
                <label class="form-label" for="ob-dob">Date of Birth *</label>
                <input type="date" id="ob-dob" class="form-input" min="1900-01-01" max="${getTodayIsoDate()}" value="${escapeHtml(toIsoDateValue(userDetails.dob || ''))}" required>
                <span class="field-error" id="err-ob-dob" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
              </div>

              <div class="form-group">
                <label class="form-label" for="ob-gender">Gender *</label>
                <select id="ob-gender" class="form-input" required>
                  <option value="Female" ${userDetails.gender === 'Female' ? 'selected' : ''}>Female</option>
                  <option value="Male" ${userDetails.gender === 'Male' ? 'selected' : ''}>Male</option>
                  <option value="Other" ${userDetails.gender === 'Other' ? 'selected' : ''}>Other</option>
                </select>
              </div>
            </div>

            <div class="onboarding-grid-2">
              <div class="form-group">
                <label class="form-label" for="ob-email">Email Address *</label>
                <input type="email" id="ob-email" class="form-input" placeholder="name@example.com" value="${escapeHtml(userDetails.email || '')}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="ob-blood">Blood Group *</label>
                <select id="ob-blood" class="form-input" required>
                  <option value="A+" ${userDetails.bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
                  <option value="A-" ${userDetails.bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
                  <option value="B+" ${userDetails.bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
                  <option value="B-" ${userDetails.bloodGroup === 'B-' ? 'selected' : ''}>B-</option>
                  <option value="AB+" ${userDetails.bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
                  <option value="AB-" ${userDetails.bloodGroup === 'AB-' ? 'selected' : ''}>AB-</option>
                  <option value="O+" ${userDetails.bloodGroup === 'O+' || !userDetails.bloodGroup ? 'selected' : ''}>O+</option>
                  <option value="O-" ${userDetails.bloodGroup === 'O-' ? 'selected' : ''}>O-</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="ob-phone">Phone Number *</label>
              <input type="tel" id="ob-phone" class="form-input" inputmode="numeric" pattern="[0-9]{10,15}" maxlength="15" placeholder="e.g. 9876543210" value="${escapeHtml(extractNumericDigits(userDetails.phone || ''))}" required>
              <span class="field-error" id="err-ob-phone" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
            </div>

            <div class="form-group">
              <label class="form-label" for="ob-allergies">Known Allergies (Optional)</label>
              <input type="text" id="ob-allergies" class="form-input" placeholder="e.g. Penicillin, Dust, Peanuts" value="${escapeHtml(userDetails.allergies || '')}">
            </div>

            <div class="form-group">
              <label class="form-label" for="ob-emergency">Emergency Contact (Optional)</label>
              <input type="tel" id="ob-emergency" class="form-input" inputmode="numeric" pattern="[0-9]{10,15}" maxlength="15" placeholder="e.g. 9876500000" value="${escapeHtml(extractNumericDigits(userDetails.emergencyContact || ''))}">
              <span class="field-error" id="err-ob-emergency" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
            </div>

            <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top:1rem;">
              <span>Continue →</span>
            </button>
          </form>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const obDobInput = containerEl.querySelector('#ob-dob');
    const errObDob = containerEl.querySelector('#err-ob-dob');
    const obPhoneInput = containerEl.querySelector('#ob-phone');
    const errObPhone = containerEl.querySelector('#err-ob-phone');
    const obEmergencyInput = containerEl.querySelector('#ob-emergency');
    const errObEmergency = containerEl.querySelector('#err-ob-emergency');

    bindDobPickerField(obDobInput, errObDob);
    bindNumericOnlyField(obPhoneInput, errObPhone, 'Phone Number');
    bindNumericOnlyField(obEmergencyInput, errObEmergency, 'Emergency Contact');

    const form = containerEl.querySelector('#onboarding-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const isDobValid = validateDobField(obDobInput, errObDob, true);
        const isPhoneValid = validateNumericPhoneField(obPhoneInput, errObPhone, 'Phone Number', true);
        const isEmergencyValid = validateNumericPhoneField(obEmergencyInput, errObEmergency, 'Emergency Contact', false);

        if (!isDobValid || !isPhoneValid || !isEmergencyValid) {
          return;
        }

        const rawDobVal = sanitizePlainText(obDobInput.value);
        const dobVal = (userDetails.dob && toIsoDateValue(userDetails.dob) === rawDobVal) ? userDetails.dob : rawDobVal;

        const basicData = {
          fullName: sanitizePlainText(containerEl.querySelector('#ob-fullname').value) || 'Patient',
          dob: dobVal,
          gender: sanitizePlainText(containerEl.querySelector('#ob-gender').value),
          email: sanitizePlainText(containerEl.querySelector('#ob-email').value),
          bloodGroup: sanitizePlainText(containerEl.querySelector('#ob-blood').value),
          phone: sanitizePlainText(obPhoneInput.value),
          allergies: sanitizePlainText(containerEl.querySelector('#ob-allergies').value),
          emergencyContact: sanitizePlainText(obEmergencyInput.value),
          avatar: userDetails.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
        };
        window.MedLensApp.completeOnboarding(basicData);
      });
    }
  }

  // =========================================================
  // 7. EXPANDED DASHBOARD / HOME PAGE COMPONENT
  // =========================================================
  function renderDashboardHomePage(containerEl) {
    const userProfile = window.MedLensApp.getUserDetails() || {};
    const reportsList = window.MedLensApp.getReportsList() || [];
    const analysisHistory = window.MedLensApp.getAnalysisHistory() || [];
    const safeFullName = escapeHtml(userProfile.fullName || 'Anshika Sharma');
    const safeFirstName = escapeHtml(((userProfile.fullName || 'Anshika').trim().split(/\s+/)[0]) || 'Anshika');
    const safeEmail = escapeHtml(userProfile.email || 'anshika@example.com');
    const safeDob = escapeHtml(userProfile.dob || '26 Oct 2001');
    const safeGender = escapeHtml(userProfile.gender || 'Female');
    const safeBlood = escapeHtml(userProfile.bloodGroup || 'O+');
    const safeAvatar = escapeHtml(userProfile.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250');

    containerEl.innerHTML = `
      <div class="dashboard-app-layout">
        
        <!-- Subtle Continuous Moving Background Elements -->
        <div class="dashboard-bg-animated" aria-hidden="true">
          <div class="dash-bg-blob blob-dash-1"></div>
          <div class="dash-bg-blob blob-dash-2"></div>
          <div class="dash-bg-blob blob-dash-3"></div>
          <span class="dash-plus-symbol plus-1">+</span>
          <span class="dash-plus-symbol plus-2">+</span>
          <span class="dash-plus-symbol plus-3">+</span>
          <span class="dash-plus-symbol plus-4">+</span>
          <span class="dash-floating-circle circ-1"></span>
          <span class="dash-floating-circle circ-2"></span>
          <span class="dash-floating-circle circ-3"></span>
        </div>

        ${renderDashboardSidebarHtml('dashboard')}

        <!-- Main Dashboard Workspace -->
        <div class="dashboard-main-wrap">
          
          ${renderDashboardTopbarHtml('Home', 'Personal Health Overview', userProfile)}

          <!-- Main Dashboard Workspace -->
          <main class="dashboard-content-container">
          
          <!-- 1. PRIMARY HERO ACTION: LARGE DIRECT UPLOAD CARD -->
          <div class="upload-card-hero animate-fade-in" id="dashboard-dropzone" style="margin-bottom:1.5rem;">
            <div class="upload-icon-circle">
              <i data-lucide="file-up" class="icon-upload-moving" style="width:34px;height:34px;"></i>
            </div>

            <h3 style="font-size:1.55rem; color:var(--color-dark-green); margin-bottom:0.35rem;">Upload Medical Report</h3>
            <p style="font-size:0.92rem; color:var(--color-text-secondary); margin-bottom:1.4rem; line-height:1.5;">
              Add a new medical report and keep your health records organized.<br>
              <span style="font-size:0.82rem; color:var(--color-emerald); font-weight:600;">Supports PDF, JPG, JPEG, PNG files up to 15MB</span>
            </p>

            <input type="file" id="dashboard-file-input" accept=".pdf,.png,.jpg,.jpeg" style="display:none;">
            <button class="btn btn-primary btn-lg btn-full upload-action-btn" id="dashboard-upload-btn" style="max-width:340px; margin:0 auto; font-size:1.05rem;">
              <i data-lucide="plus" style="width:20px;height:20px;"></i>
              + Upload Report
            </button>

            <div style="margin-top:0.85rem; font-size:0.82rem; color:var(--color-text-secondary);">
              or drag & drop your report file here
            </div>

            <div id="dashboard-upload-progress" style="display:none; margin-top:1.5rem; text-align:left; background:var(--color-white); padding:1.1rem; border-radius:var(--radius-md); border:1px solid var(--color-border); box-shadow:var(--shadow-sm);">
              <div style="display:flex; justify-content:space-between; font-size:0.88rem; font-weight:700; color:var(--color-dark-green); margin-bottom:0.45rem; gap:0.5rem; flex-wrap:wrap;">
                <span id="dash-upload-filename" style="word-break:break-word;">Medical_Report.pdf</span>
                <span id="dash-upload-percent" style="color:var(--color-emerald);">25%</span>
              </div>
              <div class="param-bar-bg" style="height:8px;">
                <div class="param-bar-fill fill-emerald" id="dash-upload-bar" style="width:25%;"></div>
              </div>
              <div style="font-size:0.78rem; color:var(--color-text-secondary); margin-top:0.4rem;">
                Validating document structure & storing in your Locker...
              </div>
            </div>
          </div>

          <!-- 2. PRESERVED PROFILE HEADER CARD -->
          <div class="profile-card animate-fade-in card-float-gentle" style="margin-bottom:1.5rem;">
            <img src="${safeAvatar}" alt="Profile Avatar" class="profile-avatar-large">
            
            <div class="profile-details-main" style="min-width:0;">
              <div class="profile-welcome-tag">HOME • Welcome back, ${safeFirstName} 👋</div>
              <h2 style="word-break:break-word;">${safeFullName}</h2>
              
              <div class="profile-meta-grid">
                <div class="profile-meta-item" style="min-width:0; word-break:break-word;">
                  <span>Email Address:</span>
                  <strong>${safeEmail}</strong>
                </div>
                <div class="profile-meta-item" style="min-width:0; word-break:break-word;">
                  <span>Date of Birth:</span>
                  <strong>${safeDob}</strong>
                </div>
                <div class="profile-meta-item" style="min-width:0; word-break:break-word;">
                  <span>Gender:</span>
                  <strong>${safeGender}</strong>
                </div>
                <div class="profile-meta-item" style="min-width:0; word-break:break-word;">
                  <span>Blood Group:</span>
                  <strong style="color:var(--color-emerald);">${safeBlood}</strong>
                </div>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm" id="dash-edit-profile-btn">
              <i data-lucide="edit-3" style="width:14px;height:14px;"></i>
              Edit Profile
            </button>
          </div>

          <!-- 3. PRESERVED 4 HEALTH OVERVIEW STAT CARDS -->
          <div class="stats-grid">
            <div class="stat-card" onclick="window.MedLensApp.navigateTo('reports')">
              <div class="stat-icon-wrapper" style="background:var(--color-very-light-mint); color:var(--color-emerald); border:1px solid var(--color-light-mint);">
                <i data-lucide="file-text" class="icon-file-floating" style="width:24px;height:24px;"></i>
              </div>
              <div>
                <div class="stat-val">${reportsList.length || 12}</div>
                <div class="stat-label">Total Reports</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper" style="background:var(--color-very-light-mint); color:#047857; border:1px solid var(--color-light-mint);">
                <i data-lucide="check-circle-2" class="icon-heart-pulsing" style="width:24px;height:24px;"></i>
              </div>
              <div>
                <div class="stat-val">8</div>
                <div class="stat-label">Normal Parameters</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrapper" style="background:#FEF3C7; color:#B45309; border:1px solid #FDE68A;">
                <i data-lucide="alert-triangle" class="icon-heart-pulsing" style="width:24px;height:24px;"></i>
              </div>
              <div>
                <div class="stat-val">4</div>
                <div class="stat-label">Needs Review</div>
              </div>
            </div>

            <div class="stat-card" onclick="window.MedLensApp.navigateTo('history')">
              <div class="stat-icon-wrapper" style="background:#EEF2FF; color:#4F46E5; border:1px solid #C7D2FE;">
                <i data-lucide="calendar" class="icon-file-floating" style="width:24px;height:24px;"></i>
              </div>
              <div>
                <div class="stat-val">15</div>
                <div class="stat-label">Timeline Events</div>
              </div>
            </div>
          </div>

          <!-- 4. SPLIT GRID: RECENT REPORTS & REPORT LOCKER PREVIEW -->
          <div class="dashboard-grid">
            <div class="dashboard-panel">
              <div class="panel-header">
                <div>
                  <h3 class="panel-title">Recent Reports</h3>
                  <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.15rem;">Latest medical test documents</p>
                </div>
                <span class="panel-link" onclick="window.MedLensApp.navigateTo('reports')">View Locker →</span>
              </div>

              <div class="reports-list">
                ${reportsList.slice(0, 4).map(rep => `
                  <div class="report-row-card">
                    <div class="report-row-info">
                      <div class="report-icon-box">
                        <i data-lucide="file-spreadsheet"></i>
                      </div>
                      <div style="min-width:0; flex:1;">
                        <div class="report-title">${escapeHtml(rep.fileName || rep.name)}</div>
                        <div class="report-date">${escapeHtml(rep.reportType || 'Blood Report')} • ${escapeHtml(rep.uploadDate || rep.date)}</div>
                      </div>
                    </div>
                    <div class="report-row-actions">
                      <button class="btn btn-secondary btn-sm dash-view-btn" data-repid="${escapeHtml(rep.id)}">
                        <i data-lucide="eye" style="width:14px;height:14px;"></i> View
                      </button>
                      <button class="btn btn-secondary btn-sm dash-share-btn" data-repid="${escapeHtml(rep.id)}">
                        <i data-lucide="share-2" style="width:14px;height:14px;"></i> Share
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="dashboard-panel">
              <div class="panel-header">
                <div>
                  <h3 class="panel-title">Your Report Locker</h3>
                  <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.15rem;">Keep all your medical reports organized in one place.</p>
                </div>
                <span class="panel-link" onclick="window.MedLensApp.navigateTo('reports')">View All Reports →</span>
              </div>

              <div style="display:flex; flex-direction:column; gap:0.75rem;">
                ${reportsList.slice(0, 3).map(rep => `
                  <div class="locker-preview-row">
                    <div class="locker-preview-info">
                      <i data-lucide="folder" style="color:var(--color-emerald); width:18px; height:18px; flex-shrink:0;"></i>
                      <div style="min-width:0; flex:1;">
                        <div style="font-size:0.9rem; font-weight:700; color:var(--color-dark-green); word-break:break-word;">${escapeHtml(rep.fileName || rep.name)}</div>
                        <span style="font-size:0.78rem; color:var(--color-text-secondary);">${escapeHtml(rep.uploadDate || rep.date)}</span>
                      </div>
                    </div>
                    <span class="badge ${escapeHtml(rep.badgeClass || 'badge-normal')}">${rep.isUploaded ? '⚠ ' : '✓ '}${escapeHtml(rep.status)}</span>
                  </div>
                `).join('')}
              </div>

              <button class="btn btn-secondary btn-full btn-sm" style="margin-top:1.25rem;" onclick="window.MedLensApp.navigateTo('reports')">
                View All Reports in Locker (${reportsList.length} Files) →
              </button>
            </div>
          </div>

          <!-- 5. SPLIT GRID: ANALYSIS HISTORY PREVIEW & HEALTH TIMELINE -->
          <div class="dashboard-grid">
            <div class="dashboard-panel">
              <div class="panel-header">
                <div>
                  <h3 class="panel-title">Analysis History</h3>
                  <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.15rem;">Previous report analysis entries.</p>
                </div>
                <span class="panel-link" onclick="window.MedLensApp.navigateTo('history')">View Analysis History →</span>
              </div>

              <div class="timeline-vertical">
                ${analysisHistory.map(his => `
                  <div class="timeline-event-item" onclick="window.MedLensApp.navigateTo('history')">
                    <div class="timeline-date">${escapeHtml(his.date)} • <span class="badge badge-mint">${escapeHtml(his.status)}</span></div>
                    <div class="timeline-event-title">${escapeHtml(his.title || his.name)}</div>
                    <p style="font-size:0.82rem; color:var(--color-text-secondary); margin-top:0.2rem;">${escapeHtml(his.summary)}</p>
                  </div>
                `).join('')}
              </div>

              <button class="btn btn-secondary btn-full btn-sm" style="margin-top:1.25rem;" onclick="window.MedLensApp.navigateTo('history')">
                View Analysis History →
              </button>
            </div>

            <div class="dashboard-panel">
              <div class="panel-header">
                <div>
                  <h3 class="panel-title">Health Timeline (Preview)</h3>
                  <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.15rem;">Chronological milestones & test records</p>
                </div>
                <span class="panel-link" onclick="window.MedLensApp.navigateTo('history')">View Full Timeline →</span>
              </div>

              <div class="timeline-vertical">
                <div class="timeline-event-item">
                  <div class="timeline-date">18 Sep 2026</div>
                  <div class="timeline-event-title">Complete Blood Count (CBC) Uploaded</div>
                </div>
                <div class="timeline-event-item">
                  <div class="timeline-date">28 Aug 2026</div>
                  <div class="timeline-event-title">Blood Glucose Flagged for Mild Review (108 mg/dL)</div>
                </div>
                <div class="timeline-event-item">
                  <div class="timeline-date">15 Jul 2026</div>
                  <div class="timeline-event-title">Routine Semi-Annual Checkup Completed</div>
                </div>
                <div class="timeline-event-item">
                  <div class="timeline-date">03 Jun 2026</div>
                  <div class="timeline-event-title">Liver Function Panel (LFT) All Normal</div>
                </div>
              </div>

              <div style="margin-top:1rem; padding:0.75rem 1rem; background:var(--color-pale-green); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); font-size:0.8rem; color:var(--color-dark-green); display:flex; align-items:center; gap:0.5rem;">
                <i data-lucide="info" style="width:16px; height:16px; flex-shrink:0; color:var(--color-emerald);"></i>
                <span>Detailed AI Medical Interpretation is currently ON HOLD pending clinical updates.</span>
              </div>
            </div>
          </div>

          <!-- 6. PRESERVED HEALTH INSIGHTS & DYNAMIC SVG GLUCOSE TREND CHART -->
          <div class="trend-card">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">Health Insights & Trends</h3>
                <p style="font-size:0.82rem; color:var(--color-text-secondary); margin-top:0.15rem;">Longitudinal parameter tracking</p>
              </div>
              <span class="panel-link" id="dash-view-trends-btn">View Trends Modal →</span>
            </div>

            <p style="font-size:0.92rem; color:var(--color-text-main); margin-bottom:0.5rem; line-height:1.5;">
              "Your fasting glucose values have slightly increased over your last 3 test reports (92 → 98 → 108 mg/dL). Continued dietary monitoring recommended."
            </p>

            <div class="trend-chart-box">
              <svg width="100%" height="100%" viewBox="0 0 500 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradMaster" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#10B981" stop-opacity="0.32"/>
                    <stop offset="100%" stop-color="#10B981" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <line x1="0" y1="25" x2="500" y2="25" stroke="#E2E8F0" stroke-dasharray="4"/>
                <line x1="0" y1="50" x2="500" y2="50" stroke="#E2E8F0" stroke-dasharray="4"/>
                <line x1="0" y1="75" x2="500" y2="75" stroke="#E2E8F0" stroke-dasharray="4"/>

                <path d="M0,80 L125,70 L250,55 L375,35 L500,20 L500,100 L0,100 Z" fill="url(#chartGradMaster)"/>
                <path d="M0,80 L125,70 L250,55 L375,35 L500,20" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>

                <circle cx="0" cy="80" r="4.5" fill="#064E3B"/>
                <circle cx="125" cy="70" r="4.5" fill="#064E3B"/>
                <circle cx="250" cy="55" r="4.5" fill="#064E3B"/>
                <circle cx="375" cy="35" r="5" fill="#F59E0B"/>
                <circle cx="500" cy="20" r="5.5" fill="#F43F5E"/>
              </svg>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--color-text-secondary); margin-top:0.35rem; flex-wrap:wrap; gap:0.4rem;">
              <span>20 May 2026 (92 mg/dL)</span>
              <span>03 Jun 2026 (98 mg/dL)</span>
              <span>15 Jul 2026 (102 mg/dL)</span>
              <span>28 Aug 2026 (108 mg/dL)</span>
            </div>
          </div>

          <!-- 7. PRESERVED QUICK ACTIONS GRID -->
          <div class="dashboard-panel" style="margin-bottom:1.5rem;">
            <div class="panel-header">
              <h3 class="panel-title">Quick Actions</h3>
            </div>

            <div class="quick-actions-grid">
              <div class="action-card" id="act-upload-modal">
                <div class="action-icon"><i data-lucide="upload-cloud"></i></div>
                <div>
                  <h5>Upload Report</h5>
                  <p>Upload a new medical report</p>
                </div>
              </div>

              <div class="action-card" id="act-compare-modal">
                <div class="action-icon"><i data-lucide="git-compare"></i></div>
                <div>
                  <h5>Compare Reports</h5>
                  <p>Compare two reports side-by-side</p>
                </div>
              </div>

              <div class="action-card" id="act-trends-modal">
                <div class="action-icon"><i data-lucide="line-chart"></i></div>
                <div>
                  <h5>View Trends</h5>
                  <p>Analyze health trends over time</p>
                </div>
              </div>

              <div class="action-card" id="act-export-modal">
                <div class="action-icon"><i data-lucide="download"></i></div>
                <div>
                  <h5>Export Summary</h5>
                  <p>Download your medical summary</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 8. PRESERVED MEDICAL SAFETY DISCLAIMER -->
          <div class="demo-disclaimer" style="margin-bottom:1.5rem;">
            <i data-lucide="shield-alert" style="width:18px;height:18px;flex-shrink:0;"></i>
            <span><strong>Medical Safety Notice:</strong> MedLens provides informational insights and does not replace professional medical advice. Always consult a certified physician for medical diagnosis and prescriptions.</span>
          </div>
        </main>

        <!-- Mobile-Friendly Bottom Navigation Bar -->
        <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
          <div class="bottom-nav-item active" onclick="window.MedLensApp.navigateTo('dashboard')">
            <i data-lucide="home" style="width:20px;height:20px;"></i>
            <span>Home</span>
          </div>
          <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('reports')">
            <i data-lucide="folder" style="width:20px;height:20px;"></i>
            <span>Reports</span>
          </div>
          <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('history')">
            <i data-lucide="clock" style="width:20px;height:20px;"></i>
            <span>History</span>
          </div>
          <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('profile')">
            <i data-lucide="user" style="width:20px;height:20px;"></i>
            <span>Profile</span>
          </div>
        </nav>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    bindDashboardShellEvents(containerEl);

    const fileInput = containerEl.querySelector('#dashboard-file-input');
    const uploadBtn = containerEl.querySelector('#dashboard-upload-btn');
    const dropzone = containerEl.querySelector('#dashboard-dropzone');
    const progressBox = containerEl.querySelector('#dashboard-upload-progress');
    const filenameEl = containerEl.querySelector('#dash-upload-filename');
    const percentEl = containerEl.querySelector('#dash-upload-percent');
    const fillEl = containerEl.querySelector('#dash-upload-bar');

    function startUploadProcess(fileObjOrName) {
      if (!progressBox) return;
      const rawName = typeof fileObjOrName === 'string' ? fileObjOrName : (fileObjOrName.name || 'Uploaded_Report.pdf');
      const safeFileName = sanitizePlainText(rawName) || 'Uploaded_Report.pdf';
      const fileSizeStr = (fileObjOrName && fileObjOrName.size)
        ? `${Math.max(0.1, (fileObjOrName.size / (1024 * 1024))).toFixed(1)} MB`
        : '1.4 MB';

      progressBox.style.display = 'block';
      filenameEl.textContent = safeFileName;
      fillEl.style.width = '25%';
      percentEl.textContent = '25%';

      setTimeout(() => {
        fillEl.style.width = '75%';
        percentEl.textContent = '75%';
      }, 250);

      setTimeout(() => {
        fillEl.style.width = '100%';
        percentEl.textContent = '100%';
        
        const uploadedEntry = {
          fileName: safeFileName,
          name: safeFileName.replace(/\.[^/.]+$/, ''),
          reportType: 'Uploaded Document (Unverified)',
          fileSize: fileSizeStr,
          uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Unable to Analyze',
          badgeClass: 'badge-review',
          isUploaded: true,
          isSample: false,
          demoTabKey: null
        };

        window.MedLensApp.addReportFile(uploadedEntry);
        renderDashboardHomePage(containerEl);
        window.MedLensApp.openModal('report-unrecognized', uploadedEntry);
      }, 550);
    }

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          startUploadProcess(e.target.files[0]);
        }
      });
    }

    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--color-emerald-hover)';
        dropzone.style.background = 'var(--color-very-light-mint)';
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = 'var(--color-emerald)';
        dropzone.style.background = 'linear-gradient(180deg, var(--color-white) 0%, var(--color-pale-green) 100%)';
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--color-emerald)';
        dropzone.style.background = 'linear-gradient(180deg, var(--color-white) 0%, var(--color-pale-green) 100%)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          startUploadProcess(e.dataTransfer.files[0]);
        }
      });
    }

    containerEl.querySelectorAll('.dash-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const repId = e.currentTarget.getAttribute('data-repid');
        const rep = reportsList.find(r => r.id === repId) || reportsList[0];
        openReportViewerModal(rep);
      });
    });

    containerEl.querySelectorAll('.dash-share-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const repId = e.currentTarget.getAttribute('data-repid');
        const rep = reportsList.find(r => r.id === repId) || reportsList[0];
        window.MedLensApp.openModal('share-report', rep);
      });
    });

    const editProfileBtn = containerEl.querySelector('#dash-edit-profile-btn');
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => {
        window.MedLensApp.openModal('edit-profile', userProfile);
      });
    }

    const trendsBtn = containerEl.querySelector('#dash-view-trends-btn');
    if (trendsBtn) {
      trendsBtn.addEventListener('click', () => window.MedLensApp.openModal('view-trends'));
    }

    const actUpload = containerEl.querySelector('#act-upload-modal');
    const actCompare = containerEl.querySelector('#act-compare-modal');
    const actTrends = containerEl.querySelector('#act-trends-modal');
    const actExport = containerEl.querySelector('#act-export-modal');

    if (actUpload) actUpload.addEventListener('click', () => window.MedLensApp.openModal('upload-report'));
    if (actCompare) actCompare.addEventListener('click', () => window.MedLensApp.openModal('compare-reports'));
    if (actTrends) actTrends.addEventListener('click', () => window.MedLensApp.openModal('view-trends'));
    if (actExport) actExport.addEventListener('click', () => window.MedLensApp.openModal('export-summary'));
  }

  // =========================================================
  // 8. REPORT LOCKER PAGE
  // =========================================================
  function renderReportsPage(containerEl) {
    const userProfile = window.MedLensApp.getUserDetails() || {};
    let reportsList = window.MedLensApp.getReportsList() || [];
    let searchQuery = '';

    // Render outer layout ONCE so #report-search-input never loses focus while typing (B04)
    // and desktop users have the persistent left sidebar navigation (B06)
    containerEl.innerHTML = `
      <div class="dashboard-app-layout">
        ${renderDashboardSidebarHtml('reports')}

        <div class="dashboard-main-wrap">
          ${renderDashboardTopbarHtml('My Report Locker', 'Encrypted Medical Document Storage', userProfile)}

          <main class="dashboard-content-container" style="max-width:980px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
              <div>
                <h2 style="font-size:1.6rem; color:var(--color-dark-green);">Report Locker</h2>
                <p id="reports-count-text" style="font-size:0.88rem; color:var(--color-text-secondary);">${reportsList.length} Secure Medical Documents Stored</p>
              </div>
              <button class="btn btn-primary btn-sm" onclick="window.MedLensApp.navigateTo('dashboard')">
                <i data-lucide="plus" style="width:16px;height:16px;"></i>
                Upload New
              </button>
            </div>

            <div style="margin-bottom:1.25rem;">
              <div class="input-wrapper">
                <input type="text" id="report-search-input" name="locker-search-input" class="form-input" placeholder="Search reports by name or type..." value="" style="padding-left:2.5rem;" aria-label="Search reports by name or type">
                <i data-lucide="search" style="position:absolute; left:0.85rem; color:var(--color-text-secondary); width:18px; height:18px; pointer-events:none;"></i>
              </div>
            </div>

            <div id="reports-locker-list"></div>
          </main>

          <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
            <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('dashboard')">
              <i data-lucide="home" style="width:20px;height:20px;"></i>
              <span>Home</span>
            </div>
            <div class="bottom-nav-item active" onclick="window.MedLensApp.navigateTo('reports')">
              <i data-lucide="folder" style="width:20px;height:20px;"></i>
              <span>Reports</span>
            </div>
            <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('history')">
              <i data-lucide="clock" style="width:20px;height:20px;"></i>
              <span>History</span>
            </div>
            <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('profile')">
              <i data-lucide="user" style="width:20px;height:20px;"></i>
              <span>Profile</span>
            </div>
          </nav>
        </div>
      </div>
    `;

    bindDashboardShellEvents(containerEl);

    const listContainer = containerEl.querySelector('#reports-locker-list');
    const countTextEl = containerEl.querySelector('#reports-count-text');
    const searchInput = containerEl.querySelector('#report-search-input');

    function updateLockerListOnly() {
      if (!listContainer) return;

      const filteredReports = reportsList.filter(rep =>
        (rep.fileName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rep.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rep.reportType && rep.reportType.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      if (countTextEl) {
        countTextEl.textContent = `${reportsList.length} Secure Medical Documents Stored`;
      }

      if (filteredReports.length === 0) {
        listContainer.innerHTML = `
          <div style="background:var(--color-white); border-radius:var(--radius-xl); padding:3rem 1.5rem; text-align:center; border:1px solid var(--color-border); box-shadow:var(--shadow-sm);">
            <i data-lucide="folder-open" style="width:48px;height:48px;color:var(--color-text-secondary);margin-bottom:1rem;"></i>
            <h3 style="color:var(--color-dark-green); margin-bottom:0.4rem;">No Reports Found</h3>
            <p style="font-size:0.88rem; color:var(--color-text-secondary); margin-bottom:1.5rem;">Try a different search term or upload a new medical report.</p>
            <button class="btn btn-primary" onclick="window.MedLensApp.navigateTo('dashboard')">Upload Report Now</button>
          </div>
        `;
      } else {
        listContainer.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${filteredReports.map(rep => `
              <div class="locker-report-card animate-fade-in">
                
                <div class="locker-card-header">
                  <div class="locker-card-info">
                    <div class="report-icon-box" style="width:46px; height:46px; background:var(--color-very-light-mint);">
                      <i data-lucide="file-text" style="width:24px;height:24px;color:var(--color-emerald);"></i>
                    </div>
                    <div class="locker-card-text">
                      <h4 class="locker-card-title">${escapeHtml(rep.fileName || rep.name)}</h4>
                      <span class="locker-card-meta">${escapeHtml(rep.reportType || 'Medical Report')} • ${escapeHtml(rep.fileSize || '2.1 MB')}</span>
                    </div>
                  </div>
                  <span class="badge ${escapeHtml(rep.badgeClass || 'badge-normal')}">${rep.isUploaded ? '⚠ ' : '✓ '}${escapeHtml(rep.status)}</span>
                </div>

                <div class="locker-card-footer">
                  <span>Uploaded on ${escapeHtml(rep.uploadDate || rep.date)}</span>
                  
                  <div class="locker-card-actions">
                    <button class="btn btn-secondary btn-sm locker-view-btn" data-repid="${escapeHtml(rep.id)}">
                      <i data-lucide="eye" style="width:14px;height:14px;"></i> View
                    </button>
                    <button class="btn btn-secondary btn-sm locker-share-btn" data-repid="${escapeHtml(rep.id)}">
                      <i data-lucide="share-2" style="width:14px;height:14px;"></i> Share
                    </button>
                    <button class="btn btn-secondary btn-sm locker-delete-btn" data-repid="${escapeHtml(rep.id)}" style="color:#BE123C; border-color:#FECDD3;" aria-label="Delete report">
                      <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                    </button>
                  </div>
                </div>

              </div>
            `).join('')}
          </div>
        `;
      }

      if (window.lucide) window.lucide.createIcons();

      listContainer.querySelectorAll('.locker-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const repId = e.currentTarget.getAttribute('data-repid');
          const rep = reportsList.find(r => r.id === repId) || reportsList[0];
          openReportViewerModal(rep);
        });
      });

      listContainer.querySelectorAll('.locker-share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const repId = e.currentTarget.getAttribute('data-repid');
          const rep = reportsList.find(r => r.id === repId) || reportsList[0];
          window.MedLensApp.openModal('share-report', rep);
        });
      });

      listContainer.querySelectorAll('.locker-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const repId = e.currentTarget.getAttribute('data-repid');
          window.MedLensApp.deleteReportFile(repId);
          reportsList = window.MedLensApp.getReportsList() || [];
          window.MedLensApp.showToast('Report removed from Locker.');
          updateLockerListOnly();
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        updateLockerListOnly();
      });
    }

    updateLockerListOnly();
  }

  // =========================================================
  // 9. ANALYSIS HISTORY PAGE
  // =========================================================
  function renderHistoryPage(containerEl) {
    const userProfile = window.MedLensApp.getUserDetails() || {};
    const historyList = window.MedLensApp.getAnalysisHistory() || [];

    containerEl.innerHTML = `
      <div class="dashboard-app-layout">
        ${renderDashboardSidebarHtml('history')}

        <div class="dashboard-main-wrap">
          ${renderDashboardTopbarHtml('Analysis History', 'Longitudinal Medical Interpretation Timeline', userProfile)}

          <main class="dashboard-content-container" style="max-width:980px;">
            <div style="margin-bottom:1.25rem;">
              <h2 style="font-size:1.6rem; color:var(--color-dark-green);">Analysis History</h2>
              <p style="font-size:0.88rem; color:var(--color-text-secondary);">Historical medical interpretation records and status</p>
            </div>

            <div style="display:flex; flex-direction:column; gap:1rem;">
              ${historyList.map(item => {
                const isUnavail = item.isUploaded || item.status === 'Unable to Analyze' || item.status === 'Analysis Unavailable';
                return `
                <div style="background:var(--color-white); border-radius:var(--radius-lg); border:1px solid var(--color-border); padding:1.35rem; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:0.75rem;" class="animate-fade-in">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
                    <div>
                      <h4 style="font-size:1.1rem; color:var(--color-dark-green); margin-bottom:0.2rem; word-break:break-word;">${escapeHtml(item.title || item.name || item.fileName)}</h4>
                      <div style="font-size:0.82rem; font-weight:600; color:var(--color-emerald);">${escapeHtml(item.reportType ? `${item.reportType} • ${item.date}` : item.date)}</div>
                    </div>
                    <span class="badge ${isUnavail ? 'badge-review' : 'badge-mint'}">Status: ${escapeHtml(item.status)}</span>
                  </div>
                  
                  <p style="font-size:0.9rem; color:var(--color-text-main); line-height:1.5;">"${escapeHtml(item.summary)}"</p>

                  <div style="border-top:1px solid var(--color-border); padding-top:0.75rem; display:flex; justify-content:flex-end;">
                    <button class="btn btn-secondary btn-sm history-view-btn" data-hisid="${escapeHtml(item.id)}">
                      <i data-lucide="eye" style="width:14px;height:14px;"></i> View Analysis
                    </button>
                  </div>
                </div>
              `}).join('')}
            </div>
          </main>

          <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
            <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('dashboard')">
              <i data-lucide="home" style="width:20px;height:20px;"></i>
              <span>Home</span>
            </div>
            <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('reports')">
              <i data-lucide="folder" style="width:20px;height:20px;"></i>
              <span>Reports</span>
            </div>
            <div class="bottom-nav-item active" onclick="window.MedLensApp.navigateTo('history')">
              <i data-lucide="clock" style="width:20px;height:20px;"></i>
              <span>History</span>
            </div>
            <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('profile')">
              <i data-lucide="user" style="width:20px;height:20px;"></i>
              <span>Profile</span>
            </div>
          </nav>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    bindDashboardShellEvents(containerEl);

    containerEl.querySelectorAll('.history-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const hisId = e.currentTarget.getAttribute('data-hisid');
        const item = historyList.find(h => h.id === hisId) || historyList[0];
        if (!item) return;

        const tabKey = item.demoTabKey || (item.id === 'his-201' ? 'CBC' : item.id === 'his-202' ? 'Blood Sugar' : item.id === 'his-203' ? 'Liver' : null);
        const isUnavail = item.isUploaded || item.status === 'Unable to Analyze' || item.status === 'Analysis Unavailable';

        if (!isUnavail && tabKey && DEMO_REPORTS[tabKey]) {
          const demoData = {
            ...DEMO_REPORTS[tabKey],
            fileName: item.fileName || item.title || item.name,
            date: item.date || DEMO_REPORTS[tabKey].date,
            isSample: true
          };
          window.MedLensApp.openModal('report-details', demoData);
        } else {
          window.MedLensApp.openModal('report-unrecognized', {
            fileName: item.fileName || item.title || item.name || 'Uploaded_Report.pdf',
            name: item.title || item.name || 'Uploaded Report',
            reportType: item.reportType || 'Uploaded Document (Unverified)',
            uploadDate: item.date || '',
            date: item.date || '',
            status: item.status || 'Unable to Analyze'
          });
        }
      });
    });
  }

  // =========================================================
  // 10. USER PROFILE PAGE
  // =========================================================
  function renderProfilePage(containerEl) {
    const userDetails = window.MedLensApp.getUserDetails() || {};
    const safeFullName = escapeHtml(userDetails.fullName || 'Anshika Sharma');
    const safeEmail = escapeHtml(userDetails.email || 'anshika@example.com');
    const safePhone = escapeHtml(userDetails.phone || '+91 98765 43210');
    const safeDob = escapeHtml(userDetails.dob || '26 Oct 2001');
    const safeGender = escapeHtml(userDetails.gender || 'Female');
    const safeBlood = escapeHtml(userDetails.bloodGroup || 'O+');
    const safeAllergies = escapeHtml(userDetails.allergies || 'None reported');
    const safeEmergency = escapeHtml(userDetails.emergencyContact || 'Not specified');
    const safeAvatar = escapeHtml(userDetails.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250');

    containerEl.innerHTML = `
      <div class="dashboard-app-layout">
        ${renderDashboardSidebarHtml('profile')}

        <div class="dashboard-main-wrap">
          ${renderDashboardTopbarHtml('My Profile', 'Personal Health Identity & Preferences', userDetails)}

          <main class="dashboard-content-container" style="max-width:880px;">
            <div class="profile-card" style="margin-bottom:1.5rem;">
              <img src="${safeAvatar}" alt="Avatar" class="profile-avatar-large">
              
              <div class="profile-details-main" style="min-width:0; width:100%;">
                <span class="profile-welcome-tag">Personal Health Profile</span>
                <h2 style="word-break:break-word;">${safeFullName}</h2>
                
                <div class="profile-info-grid">
                  <div><span style="color:var(--color-text-secondary);">Email:</span> <strong>${safeEmail}</strong></div>
                  <div><span style="color:var(--color-text-secondary);">Phone:</span> <strong>${safePhone}</strong></div>
                  <div><span style="color:var(--color-text-secondary);">Date of Birth:</span> <strong>${safeDob}</strong></div>
                  <div><span style="color:var(--color-text-secondary);">Gender:</span> <strong>${safeGender}</strong></div>
                  <div><span style="color:var(--color-text-secondary);">Blood Group:</span> <strong style="color:var(--color-emerald);">${safeBlood}</strong></div>
                </div>
              </div>

              <button class="btn btn-secondary btn-sm" id="profile-edit-btn">
                <i data-lucide="edit-3" style="width:14px;height:14px;"></i> Edit Profile
              </button>
            </div>

            <div class="dashboard-panel" style="margin-bottom:1.5rem;">
              <div class="panel-header">
                <h3 class="panel-title">Medical Overview & Health Info</h3>
              </div>
              <div style="display:flex; flex-direction:column; gap:0.85rem; font-size:0.9rem;">
                <div style="word-break:break-word;">
                  <strong style="color:var(--color-dark-green);">Known Allergies:</strong>
                  <div style="color:var(--color-text-secondary); margin-top:0.2rem;">${safeAllergies}</div>
                </div>
                <div style="border-top:1px solid var(--color-border); padding-top:0.75rem; word-break:break-word;">
                  <strong style="color:var(--color-dark-green);">Emergency Contact:</strong>
                  <div style="color:var(--color-text-secondary); margin-top:0.2rem;">${safeEmergency}</div>
                </div>
              </div>
            </div>

            <button class="btn btn-secondary btn-full" id="profile-logout-btn" style="color:#BE123C; border-color:#FECDD3;">
              <i data-lucide="log-out" style="width:18px;height:18px;"></i>
              Logout of Account
            </button>
          </main>

          <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
            <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('dashboard')">
              <i data-lucide="home" style="width:20px;height:20px;"></i>
              <span>Home</span>
            </div>
            <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('reports')">
              <i data-lucide="folder" style="width:20px;height:20px;"></i>
              <span>Reports</span>
            </div>
            <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('history')">
              <i data-lucide="clock" style="width:20px;height:20px;"></i>
              <span>History</span>
            </div>
            <div class="bottom-nav-item active" onclick="window.MedLensApp.navigateTo('profile')">
              <i data-lucide="user" style="width:20px;height:20px;"></i>
              <span>Profile</span>
            </div>
          </nav>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    bindDashboardShellEvents(containerEl);

    const editBtn = containerEl.querySelector('#profile-edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        window.MedLensApp.openModal('edit-profile', userDetails);
      });
    }

    const logoutBtn = containerEl.querySelector('#profile-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => window.MedLensApp.logout());
    }
  }

  // =========================================================
  // 11. ANALYSIS PLACEHOLDER (ON HOLD)
  // =========================================================
  function renderAnalysisPlaceholderPage(containerEl) {
    const userProfile = window.MedLensApp.getUserDetails() || {};
    containerEl.innerHTML = `
      <div class="dashboard-app-layout">
        ${renderDashboardSidebarHtml('analysis')}

        <div class="dashboard-main-wrap">
          ${renderDashboardTopbarHtml('Medical Analysis', 'Clinical Interpretation Engine', userProfile)}

          <main class="dashboard-content-container" style="padding-top:3rem; max-width:650px; text-align:center;">
            <div style="background:var(--color-white); border-radius:var(--radius-xl); border:1px solid var(--color-border); padding:3.5rem 2rem; box-shadow:var(--shadow-xl);">
              
              <div style="width:72px; height:72px; border-radius:50%; background:var(--color-very-light-mint); color:var(--color-emerald); display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem; border:1px solid var(--color-light-mint);">
                <i data-lucide="cpu" style="width:36px;height:36px;"></i>
              </div>

              <div class="badge badge-mint" style="margin-bottom:1rem;">Feature Status • ON HOLD</div>
              <h2 style="font-size:1.85rem; color:var(--color-dark-green); margin-bottom:0.75rem;">AI Medical Analysis Engine</h2>
              <p style="font-size:0.98rem; color:var(--color-text-secondary); line-height:1.6; margin-bottom:2rem;">
                The detailed medical interpretation engine is currently kept on hold pending final clinical evaluation guidelines. You can upload and organize all your reports in your <strong>Report Locker</strong>.
              </p>

              <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
                <button class="btn btn-secondary" onclick="window.MedLensApp.navigateTo('reports')">View Report Locker</button>
                <button class="btn btn-primary" onclick="window.MedLensApp.navigateTo('dashboard')">Return to Home</button>
              </div>

            </div>
          </main>

          <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
            <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('dashboard')">
              <i data-lucide="home" style="width:20px;height:20px;"></i>
              <span>Home</span>
            </div>
            <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('reports')">
              <i data-lucide="folder" style="width:20px;height:20px;"></i>
              <span>Reports</span>
            </div>
            <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('history')">
              <i data-lucide="clock" style="width:20px;height:20px;"></i>
              <span>History</span>
            </div>
            <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('profile')">
              <i data-lucide="user" style="width:20px;height:20px;"></i>
              <span>Profile</span>
            </div>
          </nav>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    bindDashboardShellEvents(containerEl);
  }

  // =========================================================
  // 12. APP ENGINE & ROUTER
  // =========================================================
  class MedLensAppEngine {
    constructor() {
      this.appContainer = document.getElementById('app');
      this.toastContainer = document.getElementById('toast-container');
      this.modalOverlay = document.getElementById('modal-container');
      this.lastFocusedElement = null;
      
      // Auth State
      const storedAuth = localStorage.getItem('medlens_auth');
      this.isAuthenticated = storedAuth === 'true';

      // User Details State (CRITICAL: PRESERVE EXISTING USER PROFILE!)
      const storedUser = localStorage.getItem('medlens_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          // B02: If a previous audit test stored an XSS tag in fullName, sanitize executable HTML tags while preserving normal names
          if (parsed && typeof parsed.fullName === 'string' && /<[^>]+>/.test(parsed.fullName)) {
            parsed.fullName = sanitizePlainText(parsed.fullName) || 'Patient';
            localStorage.setItem('medlens_user', JSON.stringify(parsed));
          }
          this.userDetails = parsed;
        } catch (e) {
          this.userDetails = { ...INITIAL_USER_PROFILE };
        }
      } else {
        this.userDetails = { ...INITIAL_USER_PROFILE };
      }

      // Register active user in per-user database if not already present
      const usersDb = this.getUsersDb();
      if (this.userDetails && this.userDetails.email) {
        const normEmail = this.normalizeEmail(this.userDetails.email);
        if (!usersDb[normEmail]) {
          const wasCompleted = localStorage.getItem('medlens_profile_completed') === 'true' || !!(this.userDetails.dob && this.userDetails.bloodGroup);
          usersDb[normEmail] = {
            ...this.userDetails,
            onboardingCompleted: wasCompleted
          };
          this.saveUsersDb(usersDb);
        } else if (usersDb[normEmail].fullName && /<[^>]+>/.test(usersDb[normEmail].fullName)) {
          usersDb[normEmail].fullName = sanitizePlainText(usersDb[normEmail].fullName) || 'Patient';
          this.saveUsersDb(usersDb);
        }
      }

      // Profile Completed State (User-Specific)
      this.profileCompleted = this.isUserOnboardingCompleted(this.userDetails ? this.userDetails.email : null);
      localStorage.setItem('medlens_profile_completed', this.profileCompleted ? 'true' : 'false');

      // Reports Array State
      const storedReports = localStorage.getItem('medlens_reports');
      this.reportsList = storedReports ? JSON.parse(storedReports) : INITIAL_USER_STATE.reports;

      // Analysis History State
      const storedHistory = localStorage.getItem('medlens_history');
      this.analysisHistory = storedHistory ? JSON.parse(storedHistory) : INITIAL_USER_STATE.analysisHistory;

      // Sync any uploaded reports in reportsList into analysisHistory if not already present (Requirement 7)
      if (Array.isArray(this.reportsList) && Array.isArray(this.analysisHistory)) {
        let reportsUpdated = false;
        this.reportsList.forEach(rep => {
          if (rep && !rep.demoTabKey && !rep.isUploaded) {
            if (rep.id === 'rep-101') { rep.demoTabKey = 'Blood Sugar'; reportsUpdated = true; }
            else if (rep.id === 'rep-102') { rep.demoTabKey = 'CBC'; reportsUpdated = true; }
            else if (rep.id === 'rep-103') { rep.demoTabKey = 'Liver'; reportsUpdated = true; }
            else if (rep.id === 'rep-104') { rep.demoTabKey = 'Kidney'; reportsUpdated = true; }
          }
        });
        if (reportsUpdated) {
          localStorage.setItem('medlens_reports', JSON.stringify(this.reportsList));
        }

        let historyUpdated = false;
        this.analysisHistory.forEach(his => {
          if (!his.demoTabKey) {
            if (his.id === 'his-201') { his.demoTabKey = 'CBC'; historyUpdated = true; }
            else if (his.id === 'his-202') { his.demoTabKey = 'Blood Sugar'; historyUpdated = true; }
            else if (his.id === 'his-203') { his.demoTabKey = 'Liver'; historyUpdated = true; }
          }
        });

        for (let i = this.reportsList.length - 1; i >= 0; i--) {
          const rep = this.reportsList[i];
          if (rep && rep.isUploaded) {
            const exists = this.analysisHistory.some(h =>
              (rep.id && h.reportId === rep.id) ||
              (rep.fileName && (h.fileName === rep.fileName || h.title === rep.fileName || h.name === rep.fileName || h.title === rep.name))
            );
            if (!exists) {
              this.analysisHistory.unshift({
                id: 'his-sync-' + (rep.id || Date.now() + '-' + i),
                reportId: rep.id,
                fileName: rep.fileName || rep.name || 'Uploaded_Report.pdf',
                title: rep.name || rep.fileName || 'Uploaded Report',
                name: rep.fileName || rep.name || 'Uploaded Report',
                reportType: rep.reportType || 'Uploaded Document (Unverified)',
                date: rep.uploadDate || rep.date || '',
                status: rep.status || 'Unable to Analyze',
                isUploaded: true,
                demoTabKey: null,
                summary: 'Report uploaded and stored in Report Locker. Analysis unavailable — no valid medical parameters found.'
              });
              historyUpdated = true;
            }
          }
        }
        if (historyUpdated) {
          localStorage.setItem('medlens_history', JSON.stringify(this.analysisHistory));
        }
      }

      // Active Route
      this.currentPage = 'landing';
    }

    normalizeEmail(email) {
      return (email || '').toLowerCase().trim();
    }

    getUsersDb() {
      const storedDb = localStorage.getItem('medlens_users_db');
      if (storedDb) {
        try {
          return JSON.parse(storedDb) || {};
        } catch (e) {
          return {};
        }
      }
      return {};
    }

    saveUsersDb(db) {
      try {
        localStorage.setItem('medlens_users_db', JSON.stringify(db));
      } catch (e) {
        console.error('Error saving usersDb', e);
      }
    }

    validateLoginCredentials(email, password) {
      const normEmail = this.normalizeEmail(email);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!normEmail || !emailRegex.test(normEmail)) {
        return { valid: false, field: 'email', message: 'Please enter a valid email address.' };
      }

      if (!password || String(password).length < 6) {
        return { valid: false, field: 'password', message: 'Invalid email or password. Password must be at least 6 characters.' };
      }

      const usersDb = this.getUsersDb();
      const activeUserEmail = this.userDetails ? this.normalizeEmail(this.userDetails.email) : '';
      const matchedRecord = usersDb[normEmail] || (activeUserEmail === normEmail ? this.userDetails : null);

      if (!matchedRecord) {
        return {
          valid: false,
          field: 'email',
          message: 'Invalid email or password. No registered account found for this email.'
        };
      }

      if (matchedRecord.password && matchedRecord.password !== password) {
        return {
          valid: false,
          field: 'password',
          message: 'Invalid email or password. Please check your credentials.'
        };
      }

      return { valid: true };
    }

    isUserOnboardingCompleted(email) {
      const normEmail = this.normalizeEmail(email);
      if (normEmail) {
        const usersDb = this.getUsersDb();
        if (usersDb[normEmail] && typeof usersDb[normEmail].onboardingCompleted === 'boolean') {
          return usersDb[normEmail].onboardingCompleted;
        }
      }

      if (this.userDetails) {
        const activeNorm = this.normalizeEmail(this.userDetails.email);
        if (!normEmail || activeNorm === normEmail) {
          if (typeof this.userDetails.onboardingCompleted === 'boolean') {
            return this.userDetails.onboardingCompleted;
          }
          if (this.userDetails.dob && this.userDetails.bloodGroup) {
            return true;
          }
        }
      }

      return false;
    }

    init() {
      window.MedLensApp = this;

      window.addEventListener('hashchange', () => {
        this.handleRouteFromHash();
      });

      this.handleRouteFromHash();

      if (this.modalOverlay) {
        this.modalOverlay.addEventListener('click', (e) => {
          if (e.target === this.modalOverlay) {
            this.closeModal();
          }
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeModal();
      });
    }

    handleRouteFromHash() {
      const rawHash = window.location.hash.replace('#', '').replace('/', '');
      let route = 'landing';
      
      if (['auth', 'onboarding', 'dashboard', 'home', 'reports', 'history', 'profile', 'analysis'].includes(rawHash)) {
        route = rawHash === 'home' ? 'dashboard' : rawHash;
      } else if (['hero', 'features', 'how-it-works', 'interactive-demo', 'demo'].includes(rawHash)) {
        route = rawHash;
      } else {
        route = 'landing';
      }

      this.navigateTo(route);
    }

    navigateTo(page) {
      const protectedPages = ['onboarding', 'dashboard', 'home', 'reports', 'history', 'profile', 'analysis'];

      // 1. Protected Route Guard: Requires authentication
      if (protectedPages.includes(page) && !this.isAuthenticated) {
        this.showToast('Please sign in to access MedLens.');
        this.currentPage = 'auth';
        window.location.hash = 'auth';
        this.render();
        return;
      }

      // 2. User-Specific Onboarding Guard (for protected dashboard routes):
      const onboardingProtectedRoutes = ['dashboard', 'home', 'reports', 'history', 'profile', 'analysis'];
      if (this.isAuthenticated && !this.profileCompleted && onboardingProtectedRoutes.includes(page)) {
        this.currentPage = 'onboarding';
        window.location.hash = 'onboarding';
        this.render();
        return;
      }

      if (this.isAuthenticated && this.profileCompleted && page === 'onboarding') {
        this.currentPage = 'dashboard';
        window.location.hash = 'dashboard';
        this.render();
        return;
      }

      // 3. Auth Page
      if (page === 'auth') {
        this.currentPage = 'auth';
        window.location.hash = 'auth';
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 4. Intro Landing Page & Section Links
      if (['landing', 'hero', 'features', 'how-it-works', 'interactive-demo', 'demo'].includes(page)) {
        if (page === 'landing' && window.location.hash && window.location.hash !== '#landing') {
          window.location.hash = 'landing';
        }
        if (this.currentPage !== 'landing' || !this.appContainer.children || this.appContainer.children.length === 0) {
          this.currentPage = 'landing';
          this.render();
        }

        if (page === 'landing' || page === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const targetId = page === 'demo' ? 'interactive-demo' : page;
          setTimeout(() => {
            const el = document.getElementById(targetId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 80);
        }
        return;
      }

      // 5. Standard Core Routes
      const canonicalPage = page === 'home' ? 'dashboard' : page;
      this.currentPage = canonicalPage;
      window.location.hash = canonicalPage;
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loginSuccess(userPartial, isFirstTime = false) {
      const normEmail = this.normalizeEmail(userPartial ? userPartial.email : '');
      const usersDb = this.getUsersDb();

      if (!isFirstTime) {
        // B01 Guard: Do not allow unknown emails or invalid credentials to sign in or reuse another user's profile
        const activeUserEmail = this.userDetails ? this.normalizeEmail(this.userDetails.email) : '';
        const isKnownAccount = !!(normEmail && (usersDb[normEmail] || activeUserEmail === normEmail));
        if (!isKnownAccount) {
          this.showToast('Invalid email or password.');
          this.navigateTo('auth');
          return;
        }
      }

      this.isAuthenticated = true;
      localStorage.setItem('medlens_auth', 'true');

      if (isFirstTime) {
        // Preserve previous active user's state in usersDb before switching
        if (this.userDetails && this.userDetails.email) {
          const prevEmail = this.normalizeEmail(this.userDetails.email);
          usersDb[prevEmail] = {
            ...this.userDetails,
            onboardingCompleted: this.isUserOnboardingCompleted(prevEmail)
          };
        }

        const safeName = sanitizePlainText(userPartial && userPartial.fullName) || 'New Patient';
        const newAccount = {
          fullName: safeName,
          email: (userPartial && userPartial.email) || '',
          dob: '',
          gender: 'Female',
          bloodGroup: 'O+',
          phone: '',
          allergies: '',
          emergencyContact: '',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
          ...userPartial,
          fullName: safeName,
          onboardingCompleted: false
        };

        if (normEmail) {
          usersDb[normEmail] = newAccount;
          this.saveUsersDb(usersDb);
        }

        this.userDetails = newAccount;
        localStorage.setItem('medlens_user', JSON.stringify(this.userDetails));

        this.profileCompleted = false;
        localStorage.setItem('medlens_profile_completed', 'false');

        this.showToast('Account created! Please complete your basic details.');
        this.navigateTo('onboarding');
        return;
      }

      // RETURNING USER LOGIN FLOW:
      if (normEmail && usersDb[normEmail]) {
        this.userDetails = { ...usersDb[normEmail] };
      } else if (normEmail && this.userDetails && this.normalizeEmail(this.userDetails.email) === normEmail) {
        this.userDetails = { ...this.userDetails };
      }

      localStorage.setItem('medlens_user', JSON.stringify(this.userDetails));

      const hasCompleted = this.isUserOnboardingCompleted(normEmail || (this.userDetails ? this.userDetails.email : ''));
      this.profileCompleted = hasCompleted;
      localStorage.setItem('medlens_profile_completed', hasCompleted ? 'true' : 'false');

      this.showToast('Authentication Successful');

      if (hasCompleted) {
        this.navigateTo('dashboard');
      } else {
        this.navigateTo('onboarding');
      }
    }

    completeOnboarding(basicDetailsData) {
      const sanitized = { ...basicDetailsData };
      ['fullName', 'dob', 'gender', 'email', 'bloodGroup', 'phone', 'allergies', 'emergencyContact'].forEach(key => {
        if (typeof sanitized[key] === 'string') {
          sanitized[key] = sanitizePlainText(sanitized[key]);
        }
      });

      this.userDetails = {
        ...this.userDetails,
        ...sanitized,
        onboardingCompleted: true
      };
      localStorage.setItem('medlens_user', JSON.stringify(this.userDetails));

      const normEmail = this.normalizeEmail(this.userDetails.email);
      if (normEmail) {
        const usersDb = this.getUsersDb();
        usersDb[normEmail] = {
          ...(usersDb[normEmail] || {}),
          ...this.userDetails,
          onboardingCompleted: true
        };
        this.saveUsersDb(usersDb);
      }

      this.profileCompleted = true;
      localStorage.setItem('medlens_profile_completed', 'true');
      
      this.showToast('✓ Profile Setup Completed!');
      this.navigateTo('dashboard');
    }

    logout() {
      if (this.userDetails && this.userDetails.email) {
        const normEmail = this.normalizeEmail(this.userDetails.email);
        const usersDb = this.getUsersDb();
        usersDb[normEmail] = {
          ...this.userDetails,
          onboardingCompleted: this.profileCompleted === true || usersDb[normEmail]?.onboardingCompleted === true
        };
        this.saveUsersDb(usersDb);
      }

      this.isAuthenticated = false;
      localStorage.removeItem('medlens_auth');
      this.showToast('Logged out successfully.');
      this.navigateTo('auth');
    }

    getUserDetails() {
      return this.userDetails;
    }

    getUserProfile() {
      return this.userDetails;
    }

    updateUserProfile(newData) {
      const sanitized = { ...newData };
      ['fullName', 'dob', 'gender', 'email', 'bloodGroup', 'phone', 'allergies', 'emergencyContact'].forEach(key => {
        if (typeof sanitized[key] === 'string') {
          sanitized[key] = sanitizePlainText(sanitized[key]);
        }
      });
      if (sanitized.fullName === '') {
        sanitized.fullName = 'Patient';
      }

      this.userDetails = {
        ...this.userDetails,
        ...sanitized
      };
      localStorage.setItem('medlens_user', JSON.stringify(this.userDetails));

      const normEmail = this.normalizeEmail(this.userDetails.email);
      if (normEmail) {
        const usersDb = this.getUsersDb();
        usersDb[normEmail] = {
          ...(usersDb[normEmail] || {}),
          ...this.userDetails
        };
        this.saveUsersDb(usersDb);
      }

      this.render();
    }

    getReportsList() {
      return this.reportsList;
    }

    addReportFile(reportObj) {
      if (!reportObj.id) {
        reportObj.id = 'rep-' + Date.now();
      }
      this.reportsList.unshift(reportObj);
      localStorage.setItem('medlens_reports', JSON.stringify(this.reportsList));

      const hasValidAnalysis = !!(reportObj.demoTabKey && DEMO_REPORTS[reportObj.demoTabKey] && !reportObj.isUploaded);
      const demoData = hasValidAnalysis ? DEMO_REPORTS[reportObj.demoTabKey] : null;
      const historyEntry = {
        id: 'his-' + Date.now(),
        reportId: reportObj.id,
        fileName: reportObj.fileName || reportObj.name || 'Uploaded_Report.pdf',
        title: reportObj.name || reportObj.fileName || 'Uploaded Report',
        name: reportObj.fileName || reportObj.name || 'Uploaded Report',
        reportType: reportObj.reportType || 'Uploaded Document (Unverified)',
        date: reportObj.uploadDate || reportObj.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: hasValidAnalysis ? 'Completed' : (reportObj.status || 'Unable to Analyze'),
        isUploaded: !hasValidAnalysis,
        demoTabKey: hasValidAnalysis ? reportObj.demoTabKey : null,
        summary: hasValidAnalysis
          ? (demoData.aiSummary && demoData.aiSummary.note ? demoData.aiSummary.note : 'Analysis completed. Biomarker parameters verified.')
          : 'Report uploaded and stored in Report Locker. Analysis unavailable — no valid medical parameters found.'
      };
      this.analysisHistory.unshift(historyEntry);
      localStorage.setItem('medlens_history', JSON.stringify(this.analysisHistory));
    }

    deleteReportFile(reportId) {
      this.reportsList = this.reportsList.filter(r => r.id !== reportId);
      localStorage.setItem('medlens_reports', JSON.stringify(this.reportsList));
    }

    getAnalysisHistory() {
      return this.analysisHistory;
    }

    openModal(modalType, payload = {}) {
      if (!this.modalOverlay) return;
      if (this.modalOverlay.classList.contains('hidden')) {
        this.lastFocusedElement = document.activeElement;
      }
      renderModalContent(modalType, payload);
      this.modalOverlay.classList.remove('hidden');
      this.modalOverlay.setAttribute('aria-hidden', 'false');
      this.modalOverlay.removeAttribute('inert');
      try {
        this.modalOverlay.inert = false;
      } catch (e) {}

      // Focus the close button or first focusable element inside the modal
      const firstFocusable = this.modalOverlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable && typeof firstFocusable.focus === 'function') {
        firstFocusable.focus();
      }
    }

    closeModal() {
      if (!this.modalOverlay || this.modalOverlay.classList.contains('hidden')) return;
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
      this.modalOverlay.classList.add('hidden');
      this.modalOverlay.setAttribute('aria-hidden', 'true');
      this.modalOverlay.setAttribute('inert', '');
      try {
        this.modalOverlay.inert = true;
      } catch (e) {}

      // Clear modal DOM content so closed modal controls cannot be tabbed into
      const modalContent = document.getElementById('modal-content');
      if (modalContent) {
        modalContent.innerHTML = '';
      }

      // Restore focus to trigger element
      if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function' && document.contains(this.lastFocusedElement)) {
        try {
          this.lastFocusedElement.focus();
        } catch (e) {}
      }
      this.lastFocusedElement = null;
    }

    showToast(message) {
      if (!this.toastContainer) return;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `
        <i data-lucide="check-circle" style="color:var(--color-light-mint);width:18px;height:18px;"></i>
        <span>${escapeHtml(message)}</span>
      `;
      this.toastContainer.appendChild(toast);
      if (window.lucide) window.lucide.createIcons();

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    render() {
      if (!this.appContainer) return;

      switch (this.currentPage) {
        case 'landing':
          renderLandingPage(this.appContainer);
          break;

        case 'auth':
          renderAuthPage(this.appContainer);
          break;

        case 'onboarding':
          renderOnboardingPage(this.appContainer);
          break;

        case 'dashboard':
        case 'home':
          renderDashboardHomePage(this.appContainer);
          break;

        case 'reports':
          renderReportsPage(this.appContainer);
          break;

        case 'history':
          renderHistoryPage(this.appContainer);
          break;

        case 'profile':
          renderProfilePage(this.appContainer);
          break;

        case 'analysis':
          renderAnalysisPlaceholderPage(this.appContainer);
          break;

        default:
          renderLandingPage(this.appContainer);
          break;
      }

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }

  // Start app on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const app = new MedLensAppEngine();
      app.init();
    });
  } else {
    const app = new MedLensAppEngine();
    app.init();
  }
})();
