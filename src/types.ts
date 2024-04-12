import { LanguageCodes } from "./constants";

export type Language = typeof LanguageCodes[number];

// TODO: Language similarity map is not implemented yet
export type LanguagePriority = Language[] | "first-order" /*| "similarity"*/;

export type I18NDictionary = {
  [key in Language]?: string;
};

export type I18NString = string | string[] | I18NDictionary;

export type I18NOptions = undefined // Default
  | Language // set language directly
  | LanguagePriority // set language priority
  | { // set language and priority via options object
    lang?: Language | undefined;
    priority?: LanguagePriority;
  };