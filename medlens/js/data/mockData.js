// MEDLENS - MOCK DATA, KNOWLEDGE BASE & SECURITY UTILITIES

export function escapeHtml(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizePlainText(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export function getTodayIsoDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function toIsoDateValue(dobStr) {
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

export function extractNumericDigits(val) {
  if (val === null || val === undefined) return '';
  return String(val).replace(/[^0-9]/g, '');
}

export function bindDobPickerField(inputEl, errEl) {
  if (!inputEl) return;
  const todayIso = getTodayIsoDate();
  inputEl.setAttribute('max', todayIso);
  inputEl.setAttribute('min', '1900-01-01');

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

export function validateDobField(inputEl, errEl, isRequired = true) {
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

export function bindNumericOnlyField(inputEl, errEl, label) {
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

export function validateNumericPhoneField(inputEl, errEl, label, isRequired = true) {
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

export const INITIAL_USER_PROFILE = {
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

export const INITIAL_USER_STATE = {
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

export const DEMO_REPORTS = {
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

export const MEDICAL_EXPLANATIONS = {
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
