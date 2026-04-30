import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

const LanguageContext = createContext(null);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KINETIC HAPTIC PROFILES — Language-aware haptics
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const KINETIC_PROFILES = {
  en: {
    characterDensity: 1.0,
    kineticFeel: 'balanced',
    haptics: {
      tap: [15],
      flick: [20, 10, 20],
      supernova: [50, 30, 50, 30, 100],
      collapse: [100, 50, 100],
      lineToggle: [10],
    },
  },
  es: {
    characterDensity: 1.15,
    kineticFeel: 'fluid',
    haptics: {
      tap: [12, 8],
      flick: [15, 10, 15, 10, 15], // Fluid, rhythmic
      supernova: [40, 25, 40, 25, 40, 25, 80],
      collapse: [80, 40, 80, 40],
      lineToggle: [8, 5, 8],
    },
  },
  ja: {
    characterDensity: 0.6,
    kineticFeel: 'sharp',
    haptics: {
      tap: [25], // Sharp, decisive
      flick: [30, 5, 30], // Precise
      supernova: [60, 10, 60, 10, 60, 10, 150],
      collapse: [150, 20, 150],
      lineToggle: [20, 5],
    },
  },
  zh: {
    characterDensity: 0.55,
    kineticFeel: 'heavy',
    haptics: {
      tap: [30], // Heavy, grounded
      flick: [35, 8, 35],
      supernova: [70, 15, 70, 15, 70, 15, 180],
      collapse: [180, 30, 180],
      lineToggle: [25, 8],
    },
  },
  fr: {
    characterDensity: 1.1,
    kineticFeel: 'elegant',
    haptics: {
      tap: [12],
      flick: [18, 8, 18],
      supernova: [45, 25, 45, 25, 90],
      collapse: [90, 40, 90],
      lineToggle: [10, 5],
    },
  },
  hi: {
    characterDensity: 0.9,
    kineticFeel: 'resonant',
    haptics: {
      tap: [20],
      flick: [25, 12, 25],
      supernova: [55, 30, 55, 30, 110],
      collapse: [110, 45, 110],
      lineToggle: [15, 8],
    },
  },
  ar: {
    characterDensity: 0.85,
    kineticFeel: 'flowing',
    haptics: {
      tap: [18],
      flick: [22, 10, 22, 10],
      supernova: [50, 28, 50, 28, 100],
      collapse: [100, 42, 100],
      lineToggle: [12, 6],
    },
  },
  pt: {
    characterDensity: 1.12,
    kineticFeel: 'warm',
    haptics: {
      tap: [14],
      flick: [18, 10, 18],
      supernova: [48, 26, 48, 26, 95],
      collapse: [95, 42, 95],
      lineToggle: [10, 5],
    },
  },
  haw: {
    // V68.84 — Hawaiian / ʻŌlelo Hawaiʻi. Resonant, Aloha-flowing.
    characterDensity: 1.05,
    kineticFeel: 'aloha',
    haptics: {
      tap: [16],
      flick: [22, 12, 22, 12],
      supernova: [55, 30, 55, 30, 110],
      collapse: [110, 50, 110],
      lineToggle: [13, 7],
    },
  },
  yue: {
    // V68.85 — Cantonese / 粵語. Six-tone, percussive — sharper than
    // Mandarin's four tones. Tighter haptic envelope to honor that.
    characterDensity: 0.55,
    kineticFeel: 'percussive',
    haptics: {
      tap: [22],
      flick: [25, 6, 25, 6, 25],
      supernova: [55, 12, 55, 12, 55, 12, 130],
      collapse: [130, 25, 130],
      lineToggle: [18, 6],
    },
  },
  ur: {
    // V68.85 — Urdu / اُردُو. Same Hindustani spoken root as Hindi but
    // Nastaliq script + RTL flow. Soft, lyrical — closer to Persian.
    characterDensity: 0.92,
    kineticFeel: 'lyrical',
    haptics: {
      tap: [18],
      flick: [22, 12, 22],
      supernova: [52, 28, 52, 28, 105],
      collapse: [105, 44, 105],
      lineToggle: [14, 8],
    },
  },
};

// RECODE_UI Event for system-wide language sync
const RECODE_UI_EVENT = 'RECODE_UI';

const dispatchRecodeUI = (fromLang, toLang) => {
  const event = new CustomEvent(RECODE_UI_EVENT, {
    detail: { from: fromLang, to: toLang, timestamp: Date.now() },
  });
  window.dispatchEvent(event);
};

export const LANGUAGES = [
  { code: 'en',  label: 'English',            flag: 'EN',  native: 'English' },
  { code: 'haw', label: 'Hawaiian',           flag: 'HAW', native: 'ʻŌlelo Hawaiʻi' },
  { code: 'zh',  label: 'Chinese (Mandarin)', flag: 'ZH',  native: '普通话' },
  { code: 'yue', label: 'Chinese (Cantonese)',flag: 'YUE', native: '粵語' },
  { code: 'hi',  label: 'Hindi',              flag: 'HI',  native: 'हिन्दी' },
  { code: 'ur',  label: 'Urdu',               flag: 'UR',  native: 'اُردُو' },
  { code: 'es',  label: 'Spanish',            flag: 'ES',  native: 'Español' },
  { code: 'fr',  label: 'French',             flag: 'FR',  native: 'Français' },
  { code: 'ja',  label: 'Japanese',           flag: 'JA',  native: '日本語' },
  { code: 'ar',  label: 'Arabic',             flag: 'AR',  native: 'العربية' },
  { code: 'pt',  label: 'Portuguese',         flag: 'PT',  native: 'Português' },
];

// Static translations for core UI
const translations = {
  en: {
    'nav.dashboard': 'Dashboard', 'nav.mixer': 'Cosmic Mixer', 'nav.frequencies': 'Frequencies',
    'nav.meditation': 'Meditation', 'nav.journal': 'Journal', 'nav.oracle': 'Oracle',
    'nav.starChart': 'Star Chart', 'nav.tradeCircle': 'Trade Circle', 'nav.settings': 'Settings',
    'nav.pricing': 'Pricing', 'nav.mood': 'Mood Tracker', 'nav.breathing': 'Breathing',
    'common.save': 'Save', 'common.cancel': 'Cancel', 'common.delete': 'Delete',
    'common.share': 'Share', 'common.loading': 'Loading...', 'common.search': 'Search',
    'common.back': 'Back', 'common.next': 'Next', 'common.play': 'Play', 'common.stop': 'Stop',
    'common.close': 'Close', 'common.upgrade': 'Upgrade', 'common.signIn': 'Sign In',
    'mixer.masterVol': 'Master Volume', 'mixer.mute': 'Mute', 'mixer.stopAll': 'Stop All',
    'mixer.frequencies': 'Solfeggio Frequencies', 'mixer.sounds': 'Ambient Sounds',
    'mixer.instruments': 'World Instruments', 'mixer.mantras': 'Mantras',
    'mixer.voiceEngine': 'Voice Engine', 'mixer.masterFx': 'Master FX Bus',
    'mixer.soundscapes': 'Soundscapes', 'mixer.aiblend': 'AI Frequency Blend',
    'mixer.moodPresets': 'Mood Presets', 'mixer.sessionMode': 'Session Mode',
    'mixer.saveBtn': 'Save', 'mixer.shareBtn': 'Share', 'mixer.loadBtn': 'Load',
    'mixer.generateBlend': 'Generate My Blend', 'mixer.analyzing': 'Analyzing Your Moods...',
    'dashboard.forYou': 'For You', 'dashboard.suggestedForYou': 'Suggested for You',
    'dashboard.recentMoods': 'Recent Moods', 'dashboard.dailyChallenge': 'Daily Challenge',
    'dashboard.myShortcuts': 'My Shortcuts', 'dashboard.exploreAndPractice': 'Explore & Practice',
    'auth.email': 'Email', 'auth.password': 'Password', 'auth.login': 'Log In',
    'auth.register': 'Create Account', 'auth.logout': 'Log Out',
    'pricing.free': 'Free', 'pricing.starter': 'Starter', 'pricing.plus': 'Plus',
    'pricing.premium': 'Premium', 'pricing.superUser': 'Super User',
    'pricing.currentPlan': 'Current Plan', 'pricing.upgrade': 'Upgrade',
  },
  zh: {
    'nav.dashboard': '\u4eea\u8868\u76d8', 'nav.mixer': '\u5b87\u5b99\u6df7\u97f3\u5668', 'nav.frequencies': '\u9891\u7387',
    'nav.meditation': '\u5192\u60f3', 'nav.journal': '\u65e5\u8bb0', 'nav.oracle': '\u795e\u8c15',
    'nav.starChart': '\u661f\u56fe', 'nav.tradeCircle': '\u4ea4\u6613\u5708', 'nav.settings': '\u8bbe\u7f6e',
    'nav.pricing': '\u4ef7\u683c', 'nav.mood': '\u60c5\u7eea\u8ffd\u8e2a', 'nav.breathing': '\u547c\u5438',
    'common.save': '\u4fdd\u5b58', 'common.cancel': '\u53d6\u6d88', 'common.delete': '\u5220\u9664',
    'common.share': '\u5206\u4eab', 'common.loading': '\u52a0\u8f7d\u4e2d...', 'common.search': '\u641c\u7d22',
    'common.back': '\u8fd4\u56de', 'common.next': '\u4e0b\u4e00\u6b65', 'common.play': '\u64ad\u653e', 'common.stop': '\u505c\u6b62',
    'common.close': '\u5173\u95ed', 'common.upgrade': '\u5347\u7ea7', 'common.signIn': '\u767b\u5f55',
    'mixer.masterVol': '\u4e3b\u97f3\u91cf', 'mixer.mute': '\u9759\u97f3', 'mixer.stopAll': '\u5168\u90e8\u505c\u6b62',
    'mixer.frequencies': '\u5507\u97f3\u9891\u7387', 'mixer.sounds': '\u73af\u5883\u97f3',
    'mixer.instruments': '\u4e16\u754c\u4e50\u5668', 'mixer.mantras': '\u771f\u8a00',
    'mixer.voiceEngine': '\u8bed\u97f3\u5f15\u64ce', 'mixer.masterFx': '\u4e3b\u6548\u679c',
    'mixer.soundscapes': '\u97f3\u666f', 'mixer.aiblend': 'AI\u9891\u7387\u6df7\u5408',
    'mixer.moodPresets': '\u60c5\u7eea\u9884\u8bbe', 'mixer.sessionMode': '\u4f1a\u8bdd\u6a21\u5f0f',
    'mixer.saveBtn': '\u4fdd\u5b58', 'mixer.shareBtn': '\u5206\u4eab', 'mixer.loadBtn': '\u52a0\u8f7d',
    'mixer.generateBlend': '\u751f\u6210\u6211\u7684\u6df7\u5408', 'mixer.analyzing': '\u5206\u6790\u60a8\u7684\u60c5\u7eea...',
    'dashboard.forYou': '\u4e3a\u4f60\u63a8\u8350', 'dashboard.suggestedForYou': '\u4e3a\u60a8\u5efa\u8bae',
    'dashboard.recentMoods': '\u6700\u8fd1\u60c5\u7eea', 'dashboard.dailyChallenge': '\u6bcf\u65e5\u6311\u6218',
    'dashboard.myShortcuts': '\u6211\u7684\u5feb\u6377\u65b9\u5f0f', 'dashboard.exploreAndPractice': '\u63a2\u7d22\u4e0e\u7ec3\u4e60',
    'auth.email': '\u7535\u5b50\u90ae\u4ef6', 'auth.password': '\u5bc6\u7801', 'auth.login': '\u767b\u5f55',
    'auth.register': '\u521b\u5efa\u8d26\u6237', 'auth.logout': '\u9000\u51fa',
    'pricing.free': '\u514d\u8d39', 'pricing.starter': '\u5165\u95e8', 'pricing.plus': '\u8fdb\u9636',
    'pricing.premium': '\u9ad8\u7ea7', 'pricing.superUser': '\u8d85\u7ea7\u7528\u6237',
    'pricing.currentPlan': '\u5f53\u524d\u65b9\u6848', 'pricing.upgrade': '\u5347\u7ea7',
  },
  es: {
    'nav.dashboard': 'Panel', 'nav.mixer': 'Mezclador', 'nav.frequencies': 'Frecuencias',
    'nav.meditation': 'Meditacion', 'nav.journal': 'Diario', 'nav.oracle': 'Oraculo',
    'nav.starChart': 'Carta Estelar', 'nav.tradeCircle': 'Circulo de Trueque', 'nav.settings': 'Ajustes',
    'nav.pricing': 'Precios', 'nav.mood': 'Estado de Animo', 'nav.breathing': 'Respiracion',
    'common.save': 'Guardar', 'common.cancel': 'Cancelar', 'common.delete': 'Eliminar',
    'common.share': 'Compartir', 'common.loading': 'Cargando...', 'common.search': 'Buscar',
    'common.back': 'Atras', 'common.next': 'Siguiente', 'common.play': 'Reproducir', 'common.stop': 'Detener',
    'common.close': 'Cerrar', 'common.upgrade': 'Mejorar', 'common.signIn': 'Iniciar Sesion',
    'mixer.masterVol': 'Volumen Principal', 'mixer.mute': 'Silenciar', 'mixer.stopAll': 'Detener Todo',
    'mixer.frequencies': 'Frecuencias Solfeggio', 'mixer.sounds': 'Sonidos Ambientales',
    'mixer.instruments': 'Instrumentos del Mundo', 'mixer.mantras': 'Mantras',
    'mixer.voiceEngine': 'Motor de Voz', 'mixer.masterFx': 'Bus de Efectos',
    'mixer.soundscapes': 'Paisajes Sonoros', 'mixer.aiblend': 'Mezcla IA de Frecuencias',
    'mixer.moodPresets': 'Preajustes de Estado', 'mixer.sessionMode': 'Modo de Sesion',
    'mixer.saveBtn': 'Guardar', 'mixer.shareBtn': 'Compartir', 'mixer.loadBtn': 'Cargar',
    'mixer.generateBlend': 'Generar Mi Mezcla', 'mixer.analyzing': 'Analizando Tus Estados...',
    'dashboard.forYou': 'Para Ti', 'dashboard.suggestedForYou': 'Sugerido Para Ti',
    'dashboard.recentMoods': 'Estados Recientes', 'dashboard.dailyChallenge': 'Reto Diario',
    'dashboard.myShortcuts': 'Mis Atajos', 'dashboard.exploreAndPractice': 'Explorar y Practicar',
    'auth.email': 'Correo', 'auth.password': 'Contrasena', 'auth.login': 'Iniciar Sesion',
    'auth.register': 'Crear Cuenta', 'auth.logout': 'Cerrar Sesion',
    'pricing.free': 'Gratis', 'pricing.starter': 'Inicial', 'pricing.plus': 'Plus',
    'pricing.premium': 'Premium', 'pricing.superUser': 'Super Usuario',
    'pricing.currentPlan': 'Plan Actual', 'pricing.upgrade': 'Mejorar',
  },
  fr: {
    'nav.dashboard': 'Tableau de Bord', 'nav.mixer': 'Mixeur Cosmique', 'nav.frequencies': 'Frequences',
    'nav.meditation': 'Meditation', 'nav.journal': 'Journal', 'nav.oracle': 'Oracle',
    'nav.starChart': 'Carte Stellaire', 'nav.tradeCircle': 'Cercle de Troc', 'nav.settings': 'Parametres',
    'nav.pricing': 'Tarifs', 'nav.mood': 'Suivi Humeur', 'nav.breathing': 'Respiration',
    'common.save': 'Sauvegarder', 'common.cancel': 'Annuler', 'common.delete': 'Supprimer',
    'common.share': 'Partager', 'common.loading': 'Chargement...', 'common.search': 'Rechercher',
    'common.back': 'Retour', 'common.next': 'Suivant', 'common.play': 'Jouer', 'common.stop': 'Arreter',
    'common.close': 'Fermer', 'common.upgrade': 'Ameliorer', 'common.signIn': 'Se Connecter',
    'mixer.masterVol': 'Volume Principal', 'mixer.mute': 'Sourdine', 'mixer.stopAll': 'Tout Arreter',
    'mixer.frequencies': 'Frequences Solfege', 'mixer.sounds': 'Sons Ambiants',
    'mixer.instruments': 'Instruments du Monde', 'mixer.mantras': 'Mantras',
    'mixer.voiceEngine': 'Moteur Vocal', 'mixer.masterFx': 'Bus d\'Effets',
    'mixer.soundscapes': 'Paysages Sonores', 'mixer.aiblend': 'Melange IA de Frequences',
    'mixer.moodPresets': 'Preselections d\'Humeur', 'mixer.sessionMode': 'Mode de Session',
    'mixer.saveBtn': 'Sauvegarder', 'mixer.shareBtn': 'Partager', 'mixer.loadBtn': 'Charger',
    'mixer.generateBlend': 'Generer Mon Melange', 'mixer.analyzing': 'Analyse de Vos Humeurs...',
    'dashboard.forYou': 'Pour Vous', 'dashboard.suggestedForYou': 'Suggere Pour Vous',
    'dashboard.recentMoods': 'Humeurs Recentes', 'dashboard.dailyChallenge': 'Defi Quotidien',
    'dashboard.myShortcuts': 'Mes Raccourcis', 'dashboard.exploreAndPractice': 'Explorer et Pratiquer',
    'auth.email': 'E-mail', 'auth.password': 'Mot de passe', 'auth.login': 'Connexion',
    'auth.register': 'Creer un Compte', 'auth.logout': 'Deconnexion',
    'pricing.free': 'Gratuit', 'pricing.starter': 'Debutant', 'pricing.plus': 'Plus',
    'pricing.premium': 'Premium', 'pricing.superUser': 'Super Utilisateur',
    'pricing.currentPlan': 'Plan Actuel', 'pricing.upgrade': 'Ameliorer',
  },
  hi: {
    'nav.dashboard': 'Dashboard', 'nav.mixer': 'Mixer', 'nav.frequencies': 'Aavrttiyaan',
    'nav.meditation': 'Dhyaan', 'nav.journal': 'Diary', 'nav.oracle': 'Bhavishy',
    'nav.starChart': 'Taara Naksha', 'nav.tradeCircle': 'Vinimay Mandal', 'nav.settings': 'Sthapanaaen',
    'nav.pricing': 'Muulya', 'nav.mood': 'Manastithi', 'nav.breathing': 'Pranayam',
    'common.save': 'Surakshit Karen', 'common.cancel': 'Radd Karen', 'common.delete': 'Mitaayen',
    'common.share': 'Saanjha Karen', 'common.loading': 'Lod Ho Raha Hai...', 'common.search': 'Khojein',
    'common.back': 'Vaapas', 'common.next': 'Aage', 'common.play': 'Chalayen', 'common.stop': 'Roken',
    'common.close': 'Band Karen', 'common.upgrade': 'Upgrade', 'common.signIn': 'Sign In',
    'mixer.masterVol': 'Mukhya Dhvani', 'mixer.mute': 'Shaant', 'mixer.stopAll': 'Sab Band Karen',
    'mixer.frequencies': 'Solfeggio Aavrttiyaan', 'mixer.sounds': 'Praakrtik Dhvaniyan',
    'mixer.instruments': 'Vishv Vaadya Yantra', 'mixer.mantras': 'Mantra',
    'mixer.generateBlend': 'Mera Mishran Banayen', 'mixer.analyzing': 'Aapke Bhaav Ka Vishleshan...',
    'dashboard.forYou': 'Aapke Liye', 'dashboard.suggestedForYou': 'Aapke Liye Sujhaav',
    'auth.email': 'Email', 'auth.password': 'Password', 'auth.login': 'Login',
    'auth.register': 'Khaata Banayen', 'auth.logout': 'Logout',
  },
  ja: {
    'nav.dashboard': 'Dasshubodo', 'nav.mixer': 'Kozu Mikisa', 'nav.frequencies': 'Shuuhasuu',
    'nav.meditation': 'Meisou', 'nav.journal': 'Nikki', 'nav.oracle': 'Orakuru',
    'nav.starChart': 'Seizu', 'nav.tradeCircle': 'Butsubutsu Koukan', 'nav.settings': 'Settei',
    'nav.pricing': 'Kakaku', 'nav.mood': 'Kibun Torakkaa', 'nav.breathing': 'Kokyuu',
    'common.save': 'Hozon', 'common.cancel': 'Kyanseru', 'common.delete': 'Sakujo',
    'common.share': 'Kyouyuu', 'common.loading': 'Yomikomi-chuu...', 'common.search': 'Kensaku',
    'common.back': 'Modoru', 'common.next': 'Tsugi', 'common.play': 'Saisei', 'common.stop': 'Teishi',
    'common.close': 'Tojiru', 'common.upgrade': 'Appuguredo', 'common.signIn': 'Sain In',
    'mixer.masterVol': 'Masutaa Boryuumu', 'mixer.mute': 'Myuuto', 'mixer.stopAll': 'Subete Teishi',
    'mixer.frequencies': 'Sorufejio Shuuhasuu', 'mixer.sounds': 'Kankyou On',
    'mixer.instruments': 'Sekai no Gakki', 'mixer.mantras': 'Mantra',
    'mixer.generateBlend': 'Burendo o Sakusei', 'mixer.analyzing': 'Kibun o Bunseki-chuu...',
    'dashboard.forYou': 'Anata no Tame ni', 'dashboard.suggestedForYou': 'Osusume',
    'auth.email': 'Meeru', 'auth.password': 'Pasuwado', 'auth.login': 'Roguin',
    'auth.register': 'Akaunto Sakusei', 'auth.logout': 'Rogauto',
  },
  ar: {
    'nav.dashboard': 'Lawhat al-Tahakkum', 'nav.mixer': 'al-Khallaat al-Kawni', 'nav.frequencies': 'at-Taraddudaat',
    'nav.meditation': 'at-Taamul', 'nav.journal': 'al-Yawmiyyaat', 'nav.oracle': 'al-Aakil',
    'nav.starChart': 'Kharitat an-Nujum', 'nav.tradeCircle': 'Dairat al-Muqaayada', 'nav.settings': 'al-Idaadaat',
    'nav.pricing': 'al-Asaar', 'nav.mood': 'Tatabbu al-Mazaaj', 'nav.breathing': 'at-Tanaffus',
    'common.save': 'Hifz', 'common.cancel': 'Ilghaa', 'common.delete': 'Hadhf',
    'common.share': 'Mushaaraka', 'common.loading': 'Jaariy at-Tahmil...', 'common.search': 'Bahth',
    'common.back': 'Ruju', 'common.next': 'at-Taali', 'common.play': 'Tashghil', 'common.stop': 'Iqaaf',
    'common.close': 'Ighlaq', 'common.upgrade': 'Tarqiyya', 'common.signIn': 'Tasjiil ad-Dukhul',
    'mixer.masterVol': 'as-Sawt ar-Raisi', 'mixer.mute': 'Kitmaan', 'mixer.stopAll': 'Iqaaf al-Kull',
    'mixer.frequencies': 'Taraddudaat Solfeggio', 'mixer.sounds': 'Aswaat Muhita',
    'mixer.instruments': 'Aalaat Aalamiyya', 'mixer.mantras': 'Mantaraat',
    'mixer.generateBlend': 'Inshaa Maziji', 'mixer.analyzing': 'Tahlil Mazaajik...',
    'dashboard.forYou': 'Lak', 'dashboard.suggestedForYou': 'Muqtarah Lak',
    'auth.email': 'al-Barid al-Iliktruni', 'auth.password': 'Kalimat al-Murur', 'auth.login': 'Dukhul',
    'auth.register': 'Inshaa Hisaab', 'auth.logout': 'Khuruj',
  },
  pt: {
    'nav.dashboard': 'Painel', 'nav.mixer': 'Misturador Cosmico', 'nav.frequencies': 'Frequencias',
    'nav.meditation': 'Meditacao', 'nav.journal': 'Diario', 'nav.oracle': 'Oraculo',
    'nav.starChart': 'Carta Estelar', 'nav.tradeCircle': 'Circulo de Troca', 'nav.settings': 'Configuracoes',
    'nav.pricing': 'Precos', 'nav.mood': 'Rastreador de Humor', 'nav.breathing': 'Respiracao',
    'common.save': 'Salvar', 'common.cancel': 'Cancelar', 'common.delete': 'Excluir',
    'common.share': 'Compartilhar', 'common.loading': 'Carregando...', 'common.search': 'Pesquisar',
    'common.back': 'Voltar', 'common.next': 'Proximo', 'common.play': 'Tocar', 'common.stop': 'Parar',
    'common.close': 'Fechar', 'common.upgrade': 'Atualizar', 'common.signIn': 'Entrar',
    'mixer.masterVol': 'Volume Principal', 'mixer.mute': 'Mudo', 'mixer.stopAll': 'Parar Tudo',
    'mixer.frequencies': 'Frequencias Solfejo', 'mixer.sounds': 'Sons Ambientes',
    'mixer.instruments': 'Instrumentos Mundiais', 'mixer.mantras': 'Mantras',
    'mixer.generateBlend': 'Gerar Minha Mistura', 'mixer.analyzing': 'Analisando Seus Humores...',
    'dashboard.forYou': 'Para Voce', 'dashboard.suggestedForYou': 'Sugerido Para Voce',
    'auth.email': 'E-mail', 'auth.password': 'Senha', 'auth.login': 'Entrar',
    'auth.register': 'Criar Conta', 'auth.logout': 'Sair',
  },
  haw: {
    // V68.84 — ʻŌlelo Hawaiʻi. Multi-denominational spiritual instrument
    // framing carries through. "Aloha" honored as core greeting energy.
    'nav.dashboard': 'Papa Hōʻike', 'nav.mixer': 'Hui Kani', 'nav.frequencies': 'Pinepine',
    'nav.meditation': 'Noʻonoʻo', 'nav.journal': 'Puke Moʻolelo', 'nav.oracle': 'Kilokilo',
    'nav.starChart': 'Palapala Hōkū', 'nav.tradeCircle': 'Pōʻai Kūʻai', 'nav.settings': 'Hoʻonohonoho',
    'nav.pricing': 'Kumu Kūʻai', 'nav.mood': 'Kuhi Manaʻo', 'nav.breathing': 'Hanu',
    'common.save': 'Mālama', 'common.cancel': 'Kāpae', 'common.delete': 'Holoi',
    'common.share': 'Kaʻana Like', 'common.loading': 'Hoʻouka...', 'common.search': 'ʻImi',
    'common.back': 'Hoʻi', 'common.next': 'Aʻe', 'common.play': 'Hoʻokani', 'common.stop': 'Hoʻōki',
    'common.close': 'Pani', 'common.upgrade': 'Hoʻonui', 'common.signIn': 'Komo Mai',
    'mixer.masterVol': 'Leo Nui', 'mixer.mute': 'Hāmau', 'mixer.stopAll': 'Hoʻōki Pau',
    'mixer.frequencies': 'Pinepine Solfeggio', 'mixer.sounds': 'Kani Hoʻopuni',
    'mixer.instruments': 'Mea Kani Honua', 'mixer.mantras': 'ʻŌlelo Hoʻomana',
    'mixer.generateBlend': 'Hana i Kaʻu Hui', 'mixer.analyzing': 'Hoʻokolokolo i Kou Manaʻo...',
    'dashboard.forYou': 'No ʻOe', 'dashboard.suggestedForYou': 'Manaʻo No ʻOe',
    'auth.email': 'Leka Uila', 'auth.password': 'Hua ʻŌlelo Huna', 'auth.login': 'Komo',
    'auth.register': 'Hana i ka Moʻokāki', 'auth.logout': 'Haʻalele',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem('cosmic_lang') || 'en');
  const [previousLanguage, setPreviousLanguage] = useState(language);
  const [isRecoding, setIsRecoding] = useState(false);
  
  // Kinetic profile for current language
  const kineticProfile = useMemo(() => {
    return KINETIC_PROFILES[language] || KINETIC_PROFILES.en;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('cosmic_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = (language === 'ar' || language === 'ur') ? 'rtl' : 'ltr';
  }, [language]);
  
  // Enhanced setLanguage with RECODE_UI broadcast and haptics
  const setLanguage = useCallback((newLang) => {
    if (newLang === language) return;
    
    setPreviousLanguage(language);
    setIsRecoding(true);
    
    // Dispatch RECODE_UI event for system-wide sync
    dispatchRecodeUI(language, newLang);
    
    // Kinetic haptic for the new language
    if (navigator.vibrate) {
      const newProfile = KINETIC_PROFILES[newLang] || KINETIC_PROFILES.en;
      navigator.vibrate(newProfile.haptics.tap);
    }
    
    // Short delay for visual effect
    setTimeout(() => {
      setLanguageState(newLang);
      setTimeout(() => setIsRecoding(false), 500);
    }, 100);
  }, [language]);
  
  // Get haptic pattern for current language
  const getHaptic = useCallback((type) => {
    return kineticProfile.haptics[type] || KINETIC_PROFILES.en.haptics[type] || [15];
  }, [kineticProfile]);
  
  // Trigger haptic feedback
  const vibrate = useCallback((type) => {
    if (!navigator.vibrate) return;
    navigator.vibrate(getHaptic(type));
  }, [getHaptic]);

  const t = useCallback((key, fallback) => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || fallback || key;
  }, [language]);

  const value = useMemo(() => ({
    language,
    previousLanguage,
    isRecoding,
    setLanguage,
    t,
    languages: LANGUAGES,
    // Kinetic properties
    kineticProfile,
    characterDensity: kineticProfile.characterDensity,
    kineticFeel: kineticProfile.kineticFeel,
    getHaptic,
    vibrate,
  }), [language, previousLanguage, isRecoding, setLanguage, t, kineticProfile, getHaptic, vibrate]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to listen for RECODE_UI events
export function useRecodeUI(callback) {
  useEffect(() => {
    const handler = (e) => callback(e.detail);
    window.addEventListener(RECODE_UI_EVENT, handler);
    return () => window.removeEventListener(RECODE_UI_EVENT, handler);
  }, [callback]);
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback
    return {
      language: 'en',
      t: (key) => key,
      setLanguage: () => {},
      languages: LANGUAGES,
      kineticProfile: KINETIC_PROFILES.en,
      characterDensity: 1.0,
      kineticFeel: 'balanced',
      getHaptic: () => [15],
      vibrate: () => {},
      isRecoding: false,
    };
  }
  return ctx;
}
