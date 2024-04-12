import { LanguageCodes } from "./constants";

export type Language = typeof LanguageCodes[number];

export type LanguagePriority = Language[];

export type I18NDictionary = {
  [key in Language]?: string;
};

export type I18NString = string | string[] | I18NDictionary;

export type I18NOptions = {
  priority?: LanguagePriority | "popularity";
};