import { beforeAll, describe, expect, jest, test } from '@jest/globals';

import type { Language, LanguagePriority, I18NDictionary, I18NString, I18NOptions } from "./types";
import { LanguageCodes, I18NStringRegex } from "./constants";
import { i18nContext, i18n, I18NContext } from './index';

const strDict: I18NDictionary = {
  en: "Hello, World!",
  es: "¡Hola, Mundo!",
  fr: "Bonjour, le monde!",
  de: "Hallo, Welt!",
  it: "Ciao, mondo!",
  pt: "Olá, mundo!",
  ru: "Привет, мир!",
  zh: "你好，世界！",
  ja: "こんにちは、世界！",
  ko: "안녕, 세상!",
};

const strArrWithCode: I18NString = [`ko:${strDict.ko}`, `en:${strDict.en}`, `ja:${strDict.ja}`];

describe('Regex test', () => {
  test("Simple", () => {
    expect(I18NStringRegex.test(`ko:${strDict.ko}`)).toBe(true);
    expect(I18NStringRegex.test("Hello, World!")).toBe(false);
    expect(I18NStringRegex.test("zz:Hello, World!")).toBe(false);
  });

  test("Containing colon in the string", () => {
    expect(I18NStringRegex.test("ko:안녕, 세상:반가워~❤")).toBe(true);
    expect(I18NStringRegex.test("en:ko:fr")).toBe(true);
    expect(I18NStringRegex.test("zz:Unknown code")).toBe(false);
  });
});

describe('i18n - Browser environment, set language option(ko, en)', () => {
  let ctx: I18NContext;

  beforeAll(() => {
    jest.spyOn(console, "warn").mockImplementation(() => { });
    jest.spyOn(navigator, "languages", "get").mockReturnValue(["ko-KR", "ko", "en-US", "en"]);
    ctx = new I18NContext();
  });

  test("string(no language code)", () => {
    expect(ctx.t(`${strDict.en}`)).toBe(strDict.en);
  });

  test("string(with language code)", () => {
    expect(ctx.t(`ko:${strDict.ko}`)).toBe(strDict.ko);
  });

  test("array(no language code)", () => {
    expect(ctx.t([`${strDict.en}`, `${strDict.ko}`])).toBe(strDict.en);
  });

  test("array(with language code, first order)", () => {
    expect(ctx.t([`ko:${strDict.ko}`, `en:${strDict.en}`])).toBe(strDict.ko);
  });

  test("array(with language code, second order)", () => {
    expect(ctx.t([`en:${strDict.en}`, `ko:${strDict.ko}`])).toBe(strDict.ko);
  });
});

describe('i18n - Browser environment, set language option(jp, en)', () => {
  let ctx: I18NContext;

  beforeAll(() => {
    jest.spyOn(console, "warn").mockImplementation(() => { });
    jest.spyOn(navigator, "languages", "get").mockReturnValue(["ja-JP", "ja", "en-US", "en"]);
    ctx = new I18NContext();
  });

  test("string(no language code)", () => {
    expect(ctx.t(`${strDict.en}`)).toBe(strDict.en);
  });

  test("string(no match)", () => {
    expect(ctx.t(`ko:${strDict.ko}`)).toBe(strDict.ko);
  });

  test("array(no language code)", () => {
    expect(ctx.t([`${strDict.en}`, `${strDict.ko}`])).toBe(strDict.en);
  });

  test("array(with language code, first order)", () => {
    expect(ctx.t([`ko:${strDict.ko}`, `en:${strDict.en}`])).toBe(strDict.en);
  });

  test("array(with language code, second order)", () => {
    expect(ctx.t([`en:${strDict.en}`, `ko:${strDict.ko}`])).toBe(strDict.en);
  });

  test("invalid syntax, but have matching language", () => {
    expect(ctx.t([`${strDict.en}`, `ko:${strDict.ko}`, `${strDict.ru}`, `ja:${strDict.ja}`])).toBe(strDict.ja);
    expect(ctx.t([`en:${strDict.en}`, `ko:${strDict.ko}`, `${strDict.ru}`])).toBe(strDict.en);
  });
});


describe('i18n - Multiple contexts', () => {
  let ctxKo: I18NContext;
  let ctxEn: I18NContext;
  let ctxJa: I18NContext;
  let ctxRu: I18NContext;

  beforeAll(() => {
    jest.spyOn(console, "warn").mockImplementation(() => { });

    ctxKo = new I18NContext("ko", ["ko", "en"]);
    ctxEn = new I18NContext("en", ["en", "ja"]);
    ctxJa = new I18NContext("ja", ["ja", "en"]);
    ctxRu = new I18NContext("ru", ["ru", "en"]);
  });

  test("Matching language", () => {
    expect(ctxKo.t(strDict)).toBe(strDict.ko);
    expect(ctxEn.t(strDict)).toBe(strDict.en);
    expect(ctxJa.t(strDict)).toBe(strDict.ja);
    expect(ctxRu.t(strDict)).toBe(strDict.ru);
  });

  test("Matching language with array", () => {
    expect(ctxKo.t(strArrWithCode)).toBe(strDict.ko);
    expect(ctxEn.t(strArrWithCode)).toBe(strDict.en);
    expect(ctxJa.t(strArrWithCode)).toBe(strDict.ja);
  });

  test("No matching language", () => {
    expect(ctxRu.t(strArrWithCode)).toBe(strDict.en);
  });

  test("No matching language, no priority", () => {
    expect(ctxEn.t([`zh:${strDict.zh}`, `fr:${strDict.fr}`])).toBe(strDict.zh);
  });
});