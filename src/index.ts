import type { Language, LanguagePriority, I18NDictionary, I18NString, I18NOptions } from "./types";
import { LanguageCodes, I18NStringRegex } from "./constants";

export class I18NContext {
  private priority: LanguagePriority;

  constructor(priority?: LanguagePriority) {
    this.priority = [...LanguageCodes];

    // Set default language and priority
    // If browser default locale can get, set it.
    if (!priority && navigator && navigator.languages) {
      // Filter out the languages that are not in the LanguageCodes
      const langs = navigator.languages.filter((lang) => LanguageCodes.includes(lang as Language));
      this.priority = langs as LanguagePriority;
    }

    // Overriding the default language and priority if provided
    if (priority) this.setPriority(priority);
  }

  getLanguage() {
    return this.priority[0] as Language;
  }

  getPriority() {
    return this.priority;
  }

  setPriority(priority: LanguagePriority | "popularity") {
    if (priority === "popularity") {
      this.priority = [...LanguageCodes];
      return;
    }

    this.priority = priority.filter((lang) => LanguageCodes.includes(lang as Language)) as LanguagePriority;
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
 * @version 1.0.0
 * @apiVersion 1.0.0
 *
 * @param str     One of the following types: string, string[], I18NDictionary
 * @param option  I18NOptions object
 * @returns       matched string
 * @throws        Error if the given option is invalid
 */
function i18nFnImpl(str: I18NString, option?: I18NOptions): string {
  // Parse options
  let priority: LanguagePriority;

  if (option === undefined) { // Default
    priority = i18nContext.getPriority();
  } else if (typeof option === "object") { // set language and priority via options object
    if (!option.priority || option.priority === "popularity") {
      priority = [...LanguageCodes];
    } else {
      priority = option.priority;
    }
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

  // If there is priority, return the first matching language
  if (Array.isArray(priority)) {
    for (const p of priority) {
      if (langMap.has(p)) {
        return langMap.get(p) as string;
      }
    }
  }

  // # Fallback
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

export type i18nFn = typeof i18nFnImpl & {
  getPriority: typeof i18nContext.getPriority;
  setPriority: typeof i18nContext.setPriority;
};

i18nFnImpl.getPriority = i18nContext.getPriority.bind(i18nContext);
i18nFnImpl.setPriority = i18nContext.setPriority.bind(i18nContext);

export const i18n = i18nFnImpl as i18nFn;
export default i18n as i18nFn;