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

### Valid string syntax:
```
`<language_code>:your_string`
`<language_code>-<region_code>:your_string`
```

Valid:
> - `"en:Hello, world!"`, `"ko:안녕, 세계!"`
> - `"en:fr:ko:ja"` (multiple colons are allowed - use only the first one)
> - `"en-US:Hello, world!"` (language code with region)

Not valid:
> - `"Hello, world!"`(no language code)
> - `"␣ko:안녕, 세계!"`(space before language code)
> - `"ko␣:안녕, 세계!"`(space between language code and colon)
> - `"EN:Hello, world!"`(uppercase language code)
> - `"GB:Hello, world!"`(region code only)
> - `"en-gb:Hello, UK!"`(lowercase region code)

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

Priority set with region code
```javascript
/// Example 4
import i18n from '@webstory/inline-i18n';

i18n.setPriority(['en-GB', 'en-US', 'en']);

console.log(i18n(['en:Hello, world!','ko:안녕, 세계!'])); // Hello, world!
console.log(i18n(['en-GB:Hello, UK!','en:Hello World!'])); // Hello, UK!
```

### Fallback behavior: Return the first item
If no matching language is found, the first item will be returned.
```javascript
/// Example 5
import i18n from '@webstory/inline-i18n';

i18n.setPriority(['zh']);

console.log(i18n(['en:Hello, world!','ko:안녕, 세계!', "ru:Привет, мир!"])); // Hello, world!
```

## Advanced usage
### Use Context
Could be useful when your application have separated pages which have country-specific contents.
```javascript
/// Example 6
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
/// Example 7
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
/// Example 8
import i18n from '@webstory/inline-i18n';

i18n.setPriority('popularity');
console.log(i18n(['uz:Salom Dunyo!','ru:Привет, мир!'])); // Привет, мир!
```

## API
### `i18n(strings: string | string[] | I18NDictionary ): string`
Returns the best matching string from the given list of strings.

### `i18n.setPriority(priority: string[] | 'popularity'): void`
Sets the priority list of languages. This will override the default language detection.

### `i18n.getPriority(): string[]`
Returns the current priority list of languages.

Unlike `i18n.getLanguage()`, this won't trim the region code.

Result can be 'popularity' or empty array.

### `i18n.getLanguage(): string`
Returns the first language code of the current priority list.

This will trim the region code if it exists.

Will throw an error if the priority list is empty.

### `class I18NContext`
#### `new I18NContext(priority: string[] | 'popularity'): I18NContext`
Creates a new I18NContext instance with the given priority list.
If no priority list is given, it will follow the default language detection.

#### `I18NContext.t(strings: string | string[] | I18NDictionary): string`
Returns the best matching string from the given list of strings.
Same as `i18n()` function, but this will use the priority list of the context.

#### `I18NContext.setPriority(priority: string[] | 'popularity'): void`
Same as above, but this will only affect the context.
#### `I18NContext.getPriority(): string[]`
Same as above, but this will only affect the context.
#### `I18NContext.getLanguage(): string`
Same as above, but this will only affect the context.

## Constants
### `LanguageCodes: string[]`
An array of language codes sorted by popularity.
Full list is available in the [constants.ts](src/constants.ts) file.

### `I18NStringRegex: RegExp`
A regular expression to match the i18n string format. Useful for debug.
> `/^<language_code>(-<region_code)?:.+$/`
> actual regex:
> `/^[a-z]{2}(-[A-Z]{2,3})?:.+$/`

### `LanguageCodeRegex: RegExp`
A regular expression to match the language code format. Useful for debug.
> `/^[a-z]{2}(-[A-Z]{2,3})?$/`

## Types
Full type definitions are available in the [types.ts](src/types.ts) file.

### `I18NDictionary`
```typescript
type I18NDictionary = { [key: string]: string };
```

### `I18NOption`
```typescript
type I18NOption = {
  priority?: string[] | 'popularity';
};
```

## Browser compatibility
This library uses `navigator.languages` to detect the user's preferred language.
Check [caniuse.com - navigator.languages](https://caniuse.com/mdn-api_navigator_languages) for more information.

## License
MIT

