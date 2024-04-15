import { LanguageCodes } from "./constants";

export type Language = typeof LanguageCodes[number];
export type LanguageWithRegion = Language | `${Lowercase<string>}-${Uppercase<string>}`;

export type LanguagePriority = LanguageWithRegion[];

export type I18NDictionary = {
  [key in LanguageWithRegion]?: string;
};

export type I18NString = string | string[] | I18NDictionary;

export type I18NOptions = {
  priority?: LanguagePriority | "popularity";
};