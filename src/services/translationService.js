// Translation Service - Simulates Gemini + Translation API
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const languageDetectionRules = [
  { pattern: /[\u0600-\u06FF]/, code: 'ar', label: 'Arabic', confidence: 96 },
  { pattern: /[\u0600-\u06FF].*[دي|ولا|فاش|واش|كيف|زين|مزيان]/, code: 'ary', label: 'Moroccan Arabic', confidence: 94 },
  { pattern: /[\u4e00-\u9fa5]/, code: 'zh', label: 'Chinese (Mandarin)', confidence: 98 },
  { pattern: /[\u3040-\u30FF]/, code: 'ja', label: 'Japanese', confidence: 97 },
  { pattern: /\b(donde|aquí|gracias|por favor|ayuda|niño)\b/i, code: 'es', label: 'Spanish', confidence: 92 },
  { pattern: /\b(où|merci|s'il vous plaît|aide|enfant|toilettes)\b/i, code: 'fr', label: 'French', confidence: 93 },
  { pattern: /\b(onde|obrigado|por favor|ajuda|criança)\b/i, code: 'pt', label: 'Portuguese', confidence: 91 },
  { pattern: /\b(wo|danke|bitte|hilfe|kind|toilette)\b/i, code: 'de', label: 'German', confidence: 90 },
];

const emotionDetection = [
  { keywords: ['help', 'urgent', 'emergency', 'حادثة', 'طوارئ', 'ayuda urgente', 'urgence', 'socorro'], emotion: 'DISTRESSED', urgency: 'HIGH' },
  { keywords: ['lost', 'child', 'missing', 'ضائع', 'طفل', 'perdido', 'niño', 'perdu', 'enfant', '不见', '孩子'], emotion: 'PANIC', urgency: 'CRITICAL' },
  { keywords: ['dizzy', 'sick', 'pain', 'hurt', 'دوخة', 'مريض', 'ألم', 'mareado', 'enfermo', 'مزيان مشى'], emotion: 'DISTRESSED', urgency: 'HIGH' },
  { keywords: ['where', 'how', 'restroom', 'bathroom', 'seat', 'entrance', 'أين', 'دورة المياه', 'toilettes', 'baño'], emotion: 'NEUTRAL', urgency: 'LOW' },
  { keywords: ['thank', 'great', 'amazing', 'wonderful', 'شكرًا', 'رائع', 'gracias', 'merci', 'ありがとう'], emotion: 'POSITIVE', urgency: 'LOW' },
];

const responseTemplates = {
  RESTROOM: {
    en: (loc) => `The nearest restroom is located ${loc || '40 meters ahead on your left'}. Additional restrooms are available near Sections 108 and 214. Look for the blue restroom signs throughout the concourse.`,
    ar: (loc) => `أقرب دورة مياه تقع ${loc || 'على بُعد 40 مترًا على يسارك'}. توجد دورات مياه إضافية بالقرب من القسمين 108 و214.`,
    es: (loc) => `El baño más cercano está ${loc || 'a 40 metros a su izquierda'}. Hay baños adicionales cerca de las Secciones 108 y 214.`,
    fr: (loc) => `Les toilettes les plus proches sont ${loc || 'à 40 mètres sur votre gauche'}. Des toilettes supplémentaires sont disponibles près des Sections 108 et 214.`,
  },
  MEDICAL: {
    en: () => `URGENT: Medical assistance has been dispatched to your location. Please stay where you are and keep the patient calm and seated. Help will arrive in approximately 2 minutes. Do not move the patient unless there is immediate danger.`,
    ar: () => `عاجل: تم إرسال فريق طبي إلى موقعك. يُرجى البقاء في مكانك والحفاظ على هدوء المريض في وضعية الجلوس. ستصل المساعدة في غضون دقيقتين.`,
    ary: () => `سارع: الفريق الطبي كيجي ليك دابا. بقى فبلاصتك وخلي المريض جالس وهادئ. المساعدة غادي توصل دقيقتين.`,
    es: () => `URGENTE: Se ha enviado asistencia médica a su ubicación. Por favor permanezca donde está. La ayuda llegará en aproximadamente 2 minutos.`,
    fr: () => `URGENT: Une assistance médicale a été dépêchée à votre position. Restez sur place. L'aide arrivera dans environ 2 minutes.`,
    pt: () => `URGENTE: Assistência médica foi despachada. Por favor fique onde está. A ajuda chegará em aproximadamente 2 minutos.`,
  },
  LOST_CHILD: {
    en: () => `We have activated our Lost Child Protocol (Case #LC-${Math.floor(Math.random() * 900) + 100}). Please proceed immediately to the Family Reunification Point at Gate C. Security cameras have been activated to assist in locating your child. A volunteer will meet you at Gate C.`,
    ar: () => `لقد فعّلنا بروتوكول الطفل الضائع. يُرجى التوجه فورًا إلى نقطة لمّ شمل العائلة عند البوابة C. تم تفعيل الكاميرات الأمنية للمساعدة.`,
    es: () => `Hemos activado el Protocolo de Niño Perdido. Por favor diríjase inmediatamente al Punto de Reunificación Familiar en la Puerta C. Las cámaras de seguridad han sido activadas.`,
  },
  DIRECTION: {
    en: (dest) => `To reach ${dest || 'your destination'}: Follow the main concourse signs. Staff members wearing yellow vests are positioned throughout the stadium to assist. You can also use the PulseGrid mobile app for turn-by-turn navigation.`,
    ar: (dest) => `للوصول إلى ${dest || 'وجهتك'}: اتبع لافتات الممر الرئيسي. أعضاء الطاقم يرتدون سترات صفراء ومتواجدون في جميع أنحاء الملعب.`,
  },
  ACCESSIBILITY: {
    en: () => `Accessibility services are available throughout the stadium. Wheelchair-accessible routes are marked with blue signs. For immediate assistance, press the orange Accessibility button on the PulseGrid app, or approach any staff member in a teal vest.`,
    ar: () => `تتوفر خدمات إمكانية الوصول في جميع أنحاء الملعب. مسارات الكراسي المتحركة مُحددة بعلامات زرقاء.`,
  },
};

const detectIntent = (text) => {
  const lower = text.toLowerCase();
  if (/restroom|bathroom|toilet|wc|باث|دورة المياه|المرحاض|toilettes|baño/i.test(lower)) return 'RESTROOM';
  if (/dizzy|sick|pain|faint|emergency|ambulance|medical|دوخة|مريض|ألم|طوارئ|마련|urgence médicale/i.test(lower)) return 'MEDICAL';
  if (/lost.child|child.missing|missing.child|طفل ضائع|niño perdido|enfant perdu|不见.孩子|孩子.不见/i.test(lower)) return 'LOST_CHILD';
  if (/accessible|wheelchair|blind|deaf|disability|كرسي متحركة|handicap/i.test(lower)) return 'ACCESSIBILITY';
  return 'DIRECTION';
};

export const translationService = {
  async analyzeMessage(text) {
    await sleep(500 + Math.random() * 800);

    // Language detection
    let detectedLang = { code: 'en', label: 'English', confidence: 85 };
    for (const rule of languageDetectionRules) {
      if (rule.pattern.test(text)) {
        detectedLang = { code: rule.code, label: rule.label, confidence: rule.confidence };
        break;
      }
    }

    // Emotion & urgency detection
    let emotion = 'NEUTRAL';
    let urgency = 'LOW';
    let intentTriggered = null;
    for (const rule of emotionDetection) {
      const matched = rule.keywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase()));
      if (matched) {
        emotion = rule.emotion;
        urgency = rule.urgency;
        break;
      }
    }

    const intent = detectIntent(text);
    const responseMap = responseTemplates[intent] || responseTemplates.DIRECTION;
    const primaryResponse = responseMap[detectedLang.code]?.() || responseMap.en?.() || 'Our staff will assist you shortly.';

    const reasoningMap = {
      RESTROOM: `Simple directional query detected in ${detectedLang.label}. Fan is calm. Providing nearest facilities with multilingual signs reference.`,
      MEDICAL: `Medical emergency detected. ${detectedLang.label} message indicates potential health crisis. Emotion: ${emotion}. Auto-triggering medical dispatch protocol and alerting first aid team.`,
      LOST_CHILD: `Child safety protocol triggered from ${detectedLang.label} message. Panic emotion detected. Lost Child Protocol activated, Case ID assigned, Gate C reunification point notified.`,
      ACCESSIBILITY: `Accessibility request detected. ${detectedLang.label} speaker requires special assistance routing. Nearest accessible-route volunteer being identified.`,
      DIRECTION: `General navigation query in ${detectedLang.label}. Providing stadium orientation guidance with multilingual signage reference.`,
    };

    const allTranslations = {};
    for (const [lang, template] of Object.entries(responseMap)) {
      if (typeof template === 'function' && lang !== detectedLang.code) {
        allTranslations[lang] = template();
      }
    }

    return {
      id: `TL-${Date.now()}`,
      input: text,
      detectedLanguage: detectedLang.code,
      detectedLanguageLabel: detectedLang.label,
      langConfidence: detectedLang.confidence,
      detectedEmotion: emotion,
      urgency,
      intent,
      confidence: detectedLang.confidence,
      response: primaryResponse,
      translations: allTranslations,
      reasoning: reasoningMap[intent] || 'Analyzing context...',
      medicalAlert: intent === 'MEDICAL',
      securityAlert: intent === 'LOST_CHILD',
      timestamp: new Date().toISOString(),
    };
  },

  async getSupportedLanguages() {
    await sleep(100);
    return [
      { code: 'en', label: 'English', flag: '🇺🇸' },
      { code: 'es', label: 'Spanish', flag: '🇪🇸' },
      { code: 'fr', label: 'French', flag: '🇫🇷' },
      { code: 'pt', label: 'Portuguese', flag: '🇧🇷' },
      { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
      { code: 'ary', label: 'Moroccan Arabic', flag: '🇲🇦' },
      { code: 'de', label: 'German', flag: '🇩🇪' },
      { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
      { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
      { code: 'ko', label: 'Korean', flag: '🇰🇷' },
    ];
  },

  simulateVoiceInput(lang = 'en') {
    const voiceSamples = {
      en: ["Where is the nearest restroom?", "My grandfather feels dizzy suddenly", "Where is Section 214?", "I need a wheelchair"],
      ar: ["أين دورة المياه؟", "جدي فجأة يشعر بالدوار", "أين المقعد رقم 214؟", "أحتاج كرسي متحرك"],
      ary: ["فين بيت الما؟", "جدي فجأة حس بدوخة كبيرة", "أين المقعد ديالي؟"],
      es: ["¿Dónde está el baño?", "Mi abuelo se siente mareado", "Perdí a mi hijo"],
      fr: ["Où sont les toilettes?", "Mon grand-père se sent étourdi", "J'ai perdu mon enfant"],
      zh: ["厕所在哪里？", "我的孩子不见了，他穿着蓝色的球衣"],
    };
    const samples = voiceSamples[lang] || voiceSamples.en;
    return samples[Math.floor(Math.random() * samples.length)];
  },
};

export default translationService;
