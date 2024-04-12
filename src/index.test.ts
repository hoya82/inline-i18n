import { beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';

import type { Language, LanguagePriority, I18NDictionary, I18NString, I18NOptions } from "./types";
import { LanguageCodes, I18NStringRegex } from "./constants";
import { I18NContext, i18n } from './index';

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

  test("array(with language code, ['en', ja])", () => {
    expect(ctx.t([`en:${strDict.en}`, `ja:${strDict.ja}`])).toBe(strDict.en);
  });

  test("language on the middle of array", () => {
    expect(ctx.t([`en:${strDict.en}`, `ko:${strDict.ko}`, `ru:${strDict.ru}`, `ja:${strDict.ja}`])).toBe(strDict.ko);
  });

  test("use dictionary object - ko", () => {
    expect(ctx.t(strDict)).toBe(strDict.ko);
  });

  test("use dictionary object - en", () => {
    const omittedDict = { ...strDict };
    delete omittedDict.ko;
    expect(ctx.t(omittedDict)).toBe(strDict.en);
  });

  test("no preferred language, array parameter", () => {
    expect(ctx.t([`zh:${strDict.zh}`, `fr:${strDict.fr}`])).toBe(strDict.zh);
  });

  test("no preferred language, object parameter", () => {
    const dict = {
      "fr": "Bonjour, le monde!",
      "zh": "你好，世界！",
    }
    expect(ctx.t(dict)).toBe(strDict.fr);
  });
});

describe('i18n - Browser environment, set language option(ja, en)', () => {
  let ctx: I18NContext;

  beforeAll(() => {
    jest.spyOn(console, "warn").mockImplementation(() => { });
    jest.spyOn(navigator, "languages", "get").mockReturnValue(["ja-JP", "ja", "en-US", "en"]);
    ctx = new I18NContext();
  });

  test("string(ja match)", () => {
    expect(ctx.t(`ja:${strDict.ja}`)).toBe(strDict.ja);
  });

  test("array(ja match)", () => {
    expect(ctx.t([`ja:${strDict.ja}`])).toBe(strDict.ja);
  });

  test("object(ja match)", () => {
    expect(ctx.t(strDict)).toBe(strDict.ja);
  });

  test("object(en match)", () => {
    const omittedDict = { ...strDict };
    delete omittedDict.ja;
    expect(ctx.t(omittedDict)).toBe(strDict.en);
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
    expect(ctx.t([`en:${strDict.en}`, `ja:${strDict.ja}`])).toBe(strDict.ja);
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

    ctxKo = new I18NContext(["ko", "en"]);
    ctxEn = new I18NContext(["en", "ja"]);
    ctxJa = new I18NContext(["ja", "en"]);
    ctxRu = new I18NContext(["ru", "en"]);
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

describe("Check README.md examples", () => {
  let ctx: I18NContext;

  beforeAll(() => {
    jest.spyOn(console, "warn").mockImplementation(() => { });
    jest.spyOn(navigator, "languages", "get").mockReturnValue(["ko-KR", "ko", "en-US", "en"]);
  });

  beforeEach(() => {
    ctx = new I18NContext();
  });

  test("Example 1 - Wrap string", () => {
    expect(ctx.t(`${strDict.en}`)).toBe(strDict.en);
  });

  test("Example 2 - Simple usage", () => {
    expect(ctx.t([`en:${strDict.en}`, `ko:${strDict.ko}`])).toBe(strDict.ko);
    expect(ctx.t([`en:${strDict.en}`, `${strDict.ko}`])).toBe(strDict.en);
  });

  test("Example 3 - Set priority", () => {
    ctx.setPriority(["en", "ko"]);
    expect(ctx.t([`ko:${strDict.ko}`, `en:${strDict.en}`])).toBe(strDict.en);

    // Use Global instance
    i18n.setPriority(["ko", "en"]);
    expect(i18n([`ko:${strDict.ko}`, `en:${strDict.en}`])).toBe(strDict.ko);
    i18n.setPriority(navigator.languages as LanguagePriority); // Clear priority
  });

  test("Example 4 - Use Context", () => {
    const ctxEn = new I18NContext(['en', 'ko']);
    const ctxKo = new I18NContext(['ko', 'en']);

    expect(ctxEn.t([`en:${strDict.en}`, `ko:${strDict.ko}`])).toBe(strDict.en);
    expect(ctxKo.t([`en:${strDict.en}`, `ko:${strDict.ko}`])).toBe(strDict.ko);
  });

  test("Example 5 - Use Dict", () => {
    expect(ctx.t(strDict)).toBe(strDict.ko); // Default language is ko
    ctx.setPriority(['en', 'ko']);
    expect(ctx.t(strDict)).toBe(strDict.en);
  });

  test("Example 6 - Order by popularity", () => {
    ctx.setPriority("popularity");
    expect(ctx.t([`uz:${strDict.uz}`, `ru:${strDict.ru}`])).toBe(strDict.ru);
  });
});