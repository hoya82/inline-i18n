// This LanguageCodes is popularity order.
export const LanguageCodes = [
  "en", // English
  "zh", // Mandarin Chinese
  "es", // Spanish
  "hi", // Hindi
  "ar", // Arabic
  "pt", // Portuguese
  "bn", // Bengali
  "ru", // Russian
  "ja", // Japanese
  "de", // German
  "fr", // French
  "ko", // Korean
  "pa", // Punjabi
  "jv", // Javanese
  "te", // Telugu
  "vi", // Vietnamese
  "tr", // Turkish
  "it", // Italian
  "th", // Thai
  "gu", // Gujarati
  "fa", // Persian
  "pl", // Polish
  "uk", // Ukrainian
  "ro", // Romanian
  "nl", // Dutch
  "el", // Greek
  "hu", // Hungarian
  "sv", // Swedish
  "cs", // Czech
  "da", // Danish
  "fi", // Finnish
  "sk", // Slovak
  "no", // Norwegian
  "bg", // Bulgarian
  "hr", // Croatian
  "lt", // Lithuanian
  "sl", // Slovenian
  "lv", // Latvian
  "et", // Estonian
  "mt", // Maltese
  "mk", // Macedonian
  "sq", // Albanian
  "be", // Belarusian
  "is", // Icelandic
  "ms", // Malay
  "ml", // Malayalam
  "kn", // Kannada
  "ta", // Tamil
  "mr", // Marathi
  "ur", // Urdu
  "ne", // Nepali
  "si", // Sinhala
  "ka", // Georgian
  "am", // Amharic
  "hy", // Armenian
  "az", // Azerbaijani
  "eu", // Basque
  "bs", // Bosnian
  "gl", // Galician
  "ka", // Georgian
  "ht", // Haitian Creole
  "yi", // Yiddish
  "yo", // Yoruba
  "zu", // Zulu
  "mn", // Mongolian
  "km", // Khmer
  "ku", // Kurdish
  "ky", // Kyrgyz
  "lo", // Lao
  "la", // Latin
  "lb", // Luxembourgish
  "mg", // Malagasy
  "mi", // Maori
  "mo", // Moldavian
  "my", // Myanmar
  "ps", // Pashto
  "sd", // Sindhi
  "sn", // Shona
  "so", // Somali
  "st", // Sesotho
  "su", // Sundanese
  "sw", // Swahili
  "tg", // Tajik
  "tt", // Tatar
  "tk", // Turkmen
  "uz", // Uzbek
  "cy", // Welsh
  "fy", // Western Frisian
  "xh", // Xhosa
] as const;

export const I18NStringRegex = new RegExp(
  `^(${LanguageCodes.join("|")}):(.+)$`
);
