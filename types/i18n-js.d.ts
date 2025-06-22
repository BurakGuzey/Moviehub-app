declare module 'i18n-js' {
  interface Translations {
    [key: string]: Record<string, string>;
  }

  export interface I18n {
    t(scope: string, options?: any): string;
    locale: string;
    fallbacks: boolean;
    translations: Translations;
  }

  const i18n: I18n;
  export default i18n;
}
