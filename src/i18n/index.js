import { createI18n } from 'vue-i18n'
import vi from './locales/vi.json'
import km from './locales/km.json'
import zh from './locales/zh.json'
import en from './locales/en.json'

const messages = {
  en,
  vi,
  km,
  zh
}

// Get saved language from localStorage or default to English
const savedLocale = localStorage.getItem('hotel-language') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages,
  globalInjection: true
})

export default i18n
