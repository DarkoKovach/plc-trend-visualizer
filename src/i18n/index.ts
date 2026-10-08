import { createI18n } from 'vue-i18n'
import en from './locales/en'
import no from './locales/no'

export type MessageSchema = typeof en
export type SupportedLocale = 'en' | 'no'
export type FlagCode = 'gb' | 'no'

export const SUPPORTED_LOCALES: { code: SupportedLocale; name: string; flagCode: FlagCode }[] = [
  { code: 'en', name: 'English', flagCode: 'gb' },
  { code: 'no', name: 'Norsk', flagCode: 'no' },
]

const i18n = createI18n<[MessageSchema], SupportedLocale>({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    no: no as unknown as MessageSchema,
  },
})

export default i18n
