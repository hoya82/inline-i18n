import type { Language, LanguageWithRegion, LanguagePriority, I18NDictionary, I18NString, I18NOptions } from "./types";
import { LanguageCodes, I18NStringRegex, LanguageCodeRegex } from "./constants";

export class I18NContext {
  private priority: LanguagePriority;

  constructor(priority?: LanguagePriority) {
    this.priority = [];

    // Set default language and priority
    // If browser default locale can get, set it.
    if (!priority && navigator && navigator.languages) {
      this.setPriority(navigator.languages as LanguagePriority);
      return;
    }

    // Override the default language priority if provided
    if (priority) this.setPriority(priority);
    else this.priority = [...LanguageCodes];
  }

  getLanguage() {
    if (this.priority.length === 0) {
      throw new Error("No language is set");
    }

    for (let lang of this.priority) {
      const [l, /*c*/] = lang.split("-");
      if (LanguageCodes.includes(l as Language)) {
        return l as Language;
      }
    }

    return this.priority[0] as LanguageWithRegion;
  }

  getPriority() {
    return this.priority;
  }

  setPriority(priority: LanguagePriority | "popularity") {
    if (priority === "popularity") {
      this.priority = [...LanguageCodes];
      return;
    }

    const languageCodeWithRegionList = priority.filter((langCode) => {
      if (LanguageCodeRegex.test(langCode)) {
        const [l, c] = langCode.split("-", 2);
        if (typeof c === 'string' && !/^[A-Z]{2,3}$/.test(c)) {
          return false;
        }

        return LanguageCodes.includes(l as Language);
      }

      return false;
    });

    this.priority = languageCodeWithRegionList;
  }

  t(str: I18NString): string {
    return i18n(str, {
      priority: this.priority
    });
  }
}

// Global i18n context(shadowing)
const i18nContext = new I18NContext();

/**
 * i18n function
 *
 * @author Hoya Kim
 * @version 1.1.0
 * @apiVersion 1.0.0
 *
 * @param str     One of the following types: string, string[], I18NDictionary
 * @param option  I18NOptions object
 * @returns       matched string
 * @throws        Error if the given option is invalid
 */
function i18nFnImpl(str: I18NString, option?: I18NOptions): string {
  // Parse options
  let priority: LanguagePriority = [];

  // Default: option is undefined
  if (option === undefined) {
    priority = i18nContext.getPriority();
  } else if (typeof option === "object") {
    // set language and priority via options object
    if (Array.isArray(option.priority)) {
      if (option.priority.length === 0) {
        throw new Error(`Invalid i18n option: ${JSON.stringify(option)}`);
      }

      priority = option.priority;
    } else if (typeof option.priority === "string") {
      // option given as string
      switch (option.priority) {
        case "popularity":
          priority = [...LanguageCodes];
          break;
        default:
          throw new Error(`Invalid i18n option: ${JSON.stringify(option)}`);
      }
    }
  } else {
    throw new Error(`Invalid i18n option: ${option}`);
  }

  // # Condition 1
  // If str type is string, return this.
  if (typeof str === "string") {
    if (I18NStringRegex.test(str)) {
      const [/*l*/, t] = str.split(":", 2);
      if (typeof t !== "string") {
        console.warn(`Invalid i18n syntax: ${str}`);
        return str;
      }
      return t;
    } else {
      // Not i18n syntax but this is string anyway
      return str;
    }
  }

  const langMap = new Map<LanguageWithRegion, string>();

  // # Condition 2
  // If str type is array, parse it.
  if (Array.isArray(str)) {
    let i = 0;
    for (const s of str) {
      // Regex check
      if (I18NStringRegex.test(s)) {
        const [l, t] = s.split(":", 2);
        if (typeof l !== "string" || typeof t !== "string") {
          throw new Error(`Invalid i18n syntax: ${s}`);
        }
        langMap.set(l as Language, t as string);
      } else {
        console.warn(`Invalid i18n syntax: ${s}`);
        langMap.set(`${i++}` as Language, s as string);
      }
    }
  } else if (typeof str === "object") {
    // # Condition 3
    // If str type is object, handle this as I18NDictionary.
    // assign it to langMap in order.
    const langDict = str as I18NDictionary;
    for (const [l, t] of Object.entries(langDict)) {
      if (typeof l !== "string" || typeof t !== "string") {
        throw new Error(`Invalid i18n dictionary`);
      }
      langMap.set(l as Language, t);
    }
  }

  // Fallback: If parse failed then return unknown character
  if (langMap.size === 0) {
    return "�";
  }

  // If there is priority, return the first matching language
  if (Array.isArray(priority)) {
    // First try: language with region
    for (const p of priority) {
      if (langMap.has(p)) {
        return langMap.get(p) as string;
      }
    }

    // Second try: language only
    for (const p of priority) {
      const [l, /*c*/] = p.split("-");
      if (langMap.has(l as Language)) {
        return langMap.get(l as Language) as string;
      }
    }
  }

  // # Fallback
  // If still not found, return the first element
  // Condition: No language priority exists
  // but there is at least one element in the langMap
  if (langMap.size > 0) {
    const firstLang = langMap.values().next().value;
    return firstLang;
  }

  // This function must not reach here
  throw new Error("Unexpected error");
}

export type i18nFn = typeof i18nFnImpl & {
  getLanguage: typeof i18nContext.getLanguage;
  getPriority: typeof i18nContext.getPriority;
  setPriority: typeof i18nContext.setPriority;
};

i18nFnImpl.getLanguage = i18nContext.getLanguage.bind(i18nContext);
i18nFnImpl.getPriority = i18nContext.getPriority.bind(i18nContext);
i18nFnImpl.setPriority = i18nContext.setPriority.bind(i18nContext);

export const i18n = i18nFnImpl as i18nFn;
export default i18n as i18nFn;