
import { Language } from '../contexts/LanguageContext';

/**
 * Helper to get the localized string from an object.
 * It looks for `field + '_en'` if language is 'en', otherwise returns `field`.
 * If the English version is missing, it falls back to the original field (Hindi).
 */
export function getLocalized(obj: any, field: string, language: Language): string {
  if (!obj) return '';

  if (language === 'en') {
    const enValue = obj[`${field}_en`];
    if (enValue) return enValue;
  }

  return obj[field] || '';
}
