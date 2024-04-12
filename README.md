# Simple, inline internationalization library

Simple i18n library for Browser and nodejs environments.

## Install

```bash
npm install @webstory/inline-i18n
```

## Simple usage
Safely wrap your strings with `i18n` function without modification.
```javascript
/// Example 1
import i18n from '@webstory/inline-i18n';
// import { i18n } from '@webstory/inline-i18n'; // Alternate import

console.log(i18n('Hello, world!')); // Hello, world!
```

This library will automatically detect the user's preferred language if this is running in a browser environment.
```javascript
/// Example 2
import i18n from '@webstory/inline-i18n';
console.log(navigator.languages); // ['ko-KR', 'ko', 'en-US', 'en']

console.log(i18n(['en:Hello, world!','ko:안녕, 세계!'])); // 안녕, 세계!
console.log(i18n(['en:fr:ko:ja'])); // fr:ko:ja (Language code is trimmed)
```

You will get warning if invalid syntax is given.
```javascript
import i18n from '@webstory/inline-i18n';

// Will get warning on console
console.log(i18n(['en:Hello, world!','안녕, 세계!']));
// prints "Hello, world!"
// because '안녕, 세계!' has no language code.
```

To set language manually, you can use `i18nContext.setPriority` function.
```javascript
/// Example 3
import i18n from '@webstory/inline-i18n';

// Set Language priority list
// Warning: This will override the default language detection
//          And this change will be applied globally
i18n.setPriority(['en', 'ko']);

console.log(i18n(['en:Hello, world!','ko:안녕, 세계!'])); // Hello, world!
```

## Advanced usage
### Use Context
Could be useful when your application have separated pages which have country-specific contents.
```javascript
/// Example 4
import { I18NContext } from '@webstory/inline-i18n';

const i18nEn = new I18NContext(['en', 'ko']);
const i18nKo = new I18NContext(['ko', 'en']);

console.log(i18nEn.t(['en:Hello, world!','ko:안녕, 세계!'])); // Hello, world!
console.log(i18nKo.t(['en:Hello, world!','ko:안녕, 세계!'])); // 안녕, 세계!
```

### Use I18NDictionary
You can use `I18NDictionary` type to define your dictionary.
This is mostly equal to `{ [key: string]: string }` type. Therefore you can use a plain object as a dictionary.
```javascript
/// Example 5
import type { I18NDictionary } from '@webstory/inline-i18n';
import { i18n } from '@webstory/inline-i18n';

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

i18n.setPriority(['en', 'ko']); // Optional; follows `navigator.languages` by default
console.log(i18n(strDict)); // Hello, World!
```

### Order by popularity
💥EXPERIMENTAL💥 You can use 'popularity' option on the `setPriority()` function.
```javascript
/// Example 6
import i18n from '@webstory/inline-i18n';

i18n.setPriority('popularity');
console.log(i18n(['uz:Salom Dunyo!','ru:Привет, мир!'])); // Привет, мир!
```

## License
MIT

