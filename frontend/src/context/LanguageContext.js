import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const LanguageContext = createContext(null);

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: 'EN', native: 'English' },
  { code: 'es', label: 'Spanish', flag: 'ES', native: 'Espanol' },
  { code: 'fr', label: 'French', flag: 'FR', native: 'Francais' },
  { code: 'hi', label: 'Hindi', flag: 'HI', native: 'Hindi' },
  { code: 'ja', label: 'Japanese', flag: 'JA', native: 'Nihongo' },
  { code: 'ar', label: 'Arabic', flag: 'AR', native: 'Al-Arabiyya' },
  { code: 'pt', label: 'Portuguese', flag: 'PT', native: 'Portugues' },
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
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('cosmic_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('cosmic_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = useCallback((key, fallback) => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || fallback || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
}
