import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../src/assets/i18n/en.json";
import al from "../src/assets/i18n/al.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      al: { translation: al },
    },
    lng: "en", 
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
