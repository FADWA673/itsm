// ============================================================================
// Internationalization (i18n) Service
// Multi-language support: French, English, Arabic, Darija
// ============================================================================

type Language = 'fr' | 'en' | 'ar' | 'darija';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Chat greetings
  'chat.greeting': {
    fr: 'Bonjour! Comment puis-je vous aider aujourd\'hui?',
    en: 'Hello! How can I help you today?',
    ar: 'مرحبا! كيف يمكنني مساعدتك اليوم؟',
    darija: 'السلام! كيفاش نقدر نعاونك اليوم؟',
  },
  
  // Emotions
  'emotion.frustration': {
    fr: 'Je comprends votre frustration',
    en: 'I understand your frustration',
    ar: 'أفهم إحباطك',
    darija: 'فاهم شحال نتا معصب',
  },
  'emotion.urgency': {
    fr: 'Je vois que c\'est urgent!',
    en: 'I see this is urgent!',
    ar: 'أرى أن هذا عاجل!',
    darija: 'شفت بلي هادشي مستعجل!',
  },
  
  // Questions
  'question.wifi.icon': {
    fr: 'L\'icône Wi-Fi est-elle visible?',
    en: 'Is the Wi-Fi icon visible?',
    ar: 'هل رمز الواي فاي مرئي؟',
    darija: 'واش كاتبان أيقونة الواي فاي؟',
  },
  'question.duration': {
    fr: 'Depuis combien de temps ce problème dure-t-il?',
    en: 'How long has this problem been happening?',
    ar: 'منذ متى وهذه المشكلة تحدث؟',
    darija: 'من فوقاش وهاد المشكل كاين?',
  },
  'question.other.devices': {
    fr: 'D\'autres appareils arrivent-ils à se connecter?',
    en: 'Can other devices connect?',
    ar: 'هل يمكن للأجهزة الأخرى الاتصال؟',
    darija: 'واش أجهزة خرين كايقدرو يتصلو؟',
  },
  
  // Solutions
  'solution.wifi.title': {
    fr: 'Problème de connexion Wi-Fi',
    en: 'Wi-Fi Connection Problem',
    ar: 'مشكلة اتصال الواي فاي',
    darija: 'مشكل فالواي فاي',
  },
  'solution.slow.computer': {
    fr: 'Ordinateur lent',
    en: 'Slow Computer',
    ar: 'جهاز كمبيوتر بطيء',
    darija: 'الكمبيوتر بطيء',
  },
  
  // Actions
  'action.restart': {
    fr: 'Redémarrer',
    en: 'Restart',
    ar: 'إعادة التشغيل',
    darija: 'ريستاري',
  },
  'action.check': {
    fr: 'Vérifier',
    en: 'Check',
    ar: 'تحقق',
    darija: 'تشيكي',
  },
  
  // Common phrases
  'common.thanks': {
    fr: 'Merci beaucoup!',
    en: 'Thank you very much!',
    ar: 'شكرا جزيلا!',
    darija: 'بزاف ديال الشكر!',
  },
  'common.yes': {
    fr: 'Oui',
    en: 'Yes',
    ar: 'نعم',
    darija: 'آه/واه',
  },
  'common.no': {
    fr: 'Non',
    en: 'No',
    ar: 'لا',
    darija: 'لا',
  },
  
  // Responses
  'response.will.help': {
    fr: 'Je vais faire tout mon possible pour vous aider',
    en: 'I will do my best to help you',
    ar: 'سأبذل قصارى جهدي لمساعدتك',
    darija: 'غادي ندير اللي نقدر باش نعاونك',
  },
  'response.lets.try': {
    fr: 'Essayons une approche différente',
    en: 'Let\'s try a different approach',
    ar: 'لنجرب نهجًا مختلفًا',
    darija: 'نجربو طريقة خرى',
  },
  
  // Search
  'search.ai.title': {
    fr: '🤖 Recherche IA',
    en: '🤖 AI Search',
    ar: '🤖 بحث بالذكاء الاصطناعي',
    darija: '🤖 تقليب بالذكاء الاصطناعي',
  },
  'search.describe.problem': {
    fr: 'Décrivez votre problème en langage naturel',
    en: 'Describe your problem in natural language',
    ar: 'صف مشكلتك بلغة طبيعية',
    darija: 'وصف المشكل ديالك بلغة عادية',
  },
  'search.searching': {
    fr: 'Recherche en cours...',
    en: 'Searching...',
    ar: 'جارٍ البحث...',
    darija: 'كانقلب...',
  },
  'search.found.results': {
    fr: 'articles pertinents trouvés',
    en: 'relevant articles found',
    ar: 'مقالات ذات صلة',
    darija: 'مقالات لقيناهم',
  },
  
  // KB
  'kb.title': {
    fr: '📚 Base de Connaissances',
    en: '📚 Knowledge Base',
    ar: '📚 قاعدة المعرفة',
    darija: '📚 قاعدة المعلومات',
  },
  'kb.search.placeholder': {
    fr: 'Rechercher des articles...',
    en: 'Search articles...',
    ar: 'البحث عن المقالات...',
    darija: 'قلب على المقالات...',
  },
};

class I18nService {
  private currentLang: Language = 'fr'; // Default language
  private storageKey = 'itsm-language';

  constructor() {
    // Load saved language preference
    const saved = localStorage.getItem(this.storageKey);
    if (saved && this.isValidLanguage(saved)) {
      this.currentLang = saved as Language;
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('fr')) {
        this.currentLang = 'fr';
      } else if (browserLang.startsWith('ar')) {
        this.currentLang = 'ar';
      } else if (browserLang.startsWith('en')) {
        this.currentLang = 'en';
      }
    }
  }

  /**
   * Get translation for a key
   */
  t(key: string, fallback?: string): string {
    const translation = translations[key];
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return fallback || key;
    }

    return translation[this.currentLang] || translation.fr || key;
  }

  /**
   * Get current language
   */
  getLanguage(): Language {
    return this.currentLang;
  }

  /**
   * Set language
   */
  setLanguage(lang: Language): void {
    if (this.isValidLanguage(lang)) {
      this.currentLang = lang;
      localStorage.setItem(this.storageKey, lang);
      
      // Update document direction for Arabic
      if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = lang;
      }
    }
  }

  /**
   * Detect language from user input
   */
  detectLanguage(text: string): Language {
    // Arabic detection (Unicode range)
    if (/[\u0600-\u06FF]/.test(text)) {
      // Check for Darija-specific patterns
      if (
        text.includes('واش') ||
        text.includes('شحال') ||
        text.includes('بزاف') ||
        text.includes('غادي') ||
        text.includes('كاين')
      ) {
        return 'darija';
      }
      return 'ar';
    }

    // French detection
    if (
      text.includes('je') ||
      text.includes('mon') ||
      text.includes('le') ||
      text.includes('la') ||
      text.includes('bonjour') ||
      text.includes('merci')
    ) {
      return 'fr';
    }

    // English detection
    if (
      text.includes('my') ||
      text.includes('the') ||
      text.includes('hello') ||
      text.includes('thank')
    ) {
      return 'en';
    }

    // Default to current language
    return this.currentLang;
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages() {
    return [
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'ar', name: 'العربية', flag: '🇲🇦' },
      { code: 'darija', name: 'الدارجة', flag: '🇲🇦' },
    ];
  }

  /**
   * Translate AI response based on detected user language
   */
  translateAIResponse(response: string, targetLang?: Language): string {
    const lang = targetLang || this.currentLang;
    
    // If response is already in target language, return as is
    if (lang === 'fr') return response;

    // For now, return as is with language prefix
    // In production, you'd use a real translation API
    const prefixes = {
      en: '[EN] ',
      ar: '[AR] ',
      darija: '[Darija] ',
      fr: '',
    };

    return prefixes[lang] + response;
  }

  private isValidLanguage(lang: string): boolean {
    return ['fr', 'en', 'ar', 'darija'].includes(lang);
  }
}

// Export singleton instance
export const i18nService = new I18nService();

// Export hook for React components
export const useTranslation = () => {
  return {
    t: (key: string, fallback?: string) => i18nService.t(key, fallback),
    language: i18nService.getLanguage(),
    setLanguage: (lang: Language) => i18nService.setLanguage(lang),
    detectLanguage: (text: string) => i18nService.detectLanguage(text),
    availableLanguages: i18nService.getAvailableLanguages(),
  };
};
