import type { Language, LanguagePriority, I18NDictionary, I18NString, I18NOptions } from "./types";
import { LanguageCodes, I18NStringRegex } from "./constants";

export class I18NContext {
  private lang: Language | undefined;
  private priority: LanguagePriority;

  constructor(lang?: Language, priority?: LanguagePriority) {
    this.lang = undefined;
    this.priority = "first-order";

    // Set default language and priority
    // If browser default locale can get, set it.
    if (!lang && !priority && navigator && navigator.languages) {
      // Filter out the languages that are not in the LanguageCodes
      const langs = navigator.languages.filter((lang) => LanguageCodes.includes(lang as Language));
      if (langs.length > 0) {
        this.lang = langs[0] as Language;
      }

      this.priority = langs as LanguagePriority;
    }

    // Overriding the default language and priority if provided
    if (lang) this.setLanguage(lang);
    if (priority) this.setPriority(priority);

    // Set the primary language if provided priority but not language
    if (!lang && Array.isArray(priority)) {
      this.setLanguage(this.priority[0] as Language);
    }
  }

  getLanguage() {
    return this.lang;
  }

  setLanguage(lang: Language) {
    if (!LanguageCodes.includes(lang)) {
      throw new Error(`Invalid language: ${lang}`);
    }
    this.lang = lang;
  }

  getPriority() {
    return this.priority;
  }

  setPriority(priority: LanguagePriority) {
    if (priority === "first-order") {
      this.priority = priority;
      return;
    }

    if (priority.some((lang) => !LanguageCodes.includes(lang))) {
      throw new Error(`Invalid language priority: ${priority}`);
    }
    this.priority = priority;
  }

  t(str: I18NString): string {
    return i18n(str, {
      lang: this.lang,
      priority: this.priority
    });
  }
}

// Default i18n context
export const i18nContext = new I18NContext();

/**
 * i18n function
 *
 * @author Hoya Kim
 * @version 1.0.0
 * @apiVersion 1.0.0
 *
 * @param str     One of the following types: string, string[], I18NDictionary
 * @param option  One of the following types: Language, LanguagePriority, I18NOptions object
 * @returns       matched string
 * @throws        Error if the given option is invalid
 */
export function i18n(str: I18NString, option?: I18NOptions): string {
  // Parse options
  let lang: Language | undefined;
  let priority: LanguagePriority = "first-order";

  if (option === undefined) { // Default
    lang = i18nContext.getLanguage();
    priority = i18nContext.getPriority();
  } else if (typeof option === "string") { // set language directly
    lang = option as Language;
  } else if (Array.isArray(option)) { // set language priority
    priority = option;
    lang = priority[0];
  } else if (typeof option === "object") { // set language and priority via options object
    lang = option.lang;
    priority = option.priority || "first-order";
  } else {
    throw new Error(`Invalid i18n option: ${option}`);
  }

  // # Condition 1
  // If str type is string, return this.
  if (typeof str === "string") {
    if (I18NStringRegex.test(str)) {
      const [_, t] = str.split(":", 2);
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

  const langMap = new Map<Language, string>();

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

  // # Match try 1
  // If there is exact matching language, return it
  if (lang && langMap.has(lang)) {
    return langMap.get(lang) as string;
  }

  // # Match try 2
  // If there is priority, return the first matching language
  if (Array.isArray(priority)) {
    for (const p of priority) {
      if (langMap.has(p)) {
        return langMap.get(p) as string;
      }
    }
  }

  // # Match try 3
  // If priority defined as "first-order", return the first element
  if (priority === "first-order" && langMap.size > 0) {
    const firstLang = langMap.values().next().value;
    return firstLang;
  }

  // # Match try 4 - fallback
  // If still not found, return the first element
  // Condition: No matching language, no priority exists
  // but there is at least one element in the langMap
  if (langMap.size > 0) {
    const firstLang = langMap.values().next().value;
    return firstLang;
  }

  // This function must not reach here
  throw new Error("Unexpected error");
}
