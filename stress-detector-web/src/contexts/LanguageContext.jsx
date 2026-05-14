import React, { useState, createContext, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  id: {
    // LeftPanel
    Heading1: "Analisis Klinis Untuk",
    Heading2: "Keseimbangan Anda.",
    Deskripsi: "Optimalkan kesehatan mental Anda dengan teknologi analisis biometrik tercanggih untuk performa yang lebih tenang dan terukur.",
    Subheading1: "Analisis Biometrik Real-time",
    Subdeskripsi1: "Pantau fluktuasi kortisol secara instan dengan akurasi dengan teknologi Artificial Intelligence.",
    Subheading2: "Laporan Klinis Harian dan Mingguan",
    Subdeskripsi2: "Dapatkan ringkasan data mendalam yang disusun oleh algoritma medis untuk performa optimal.",

    // Register Pages
    Create: "Buat Akun",
    Form: "Silakan lengkapi formulir di bawah ini.",
    LabelName: "Nama Lengkap",
    InputName: "Masukan Nama Anda",
    InputEmail: "Masukan Email Anda",
    LabelPassword: "Kata Sandi",
    LabelConfirmPassword: "Konfirmasi Kata Sandi",
    SubmitRegister: "Daftar Sekarang",
    LabelLogin: "Sudah Punya Akun?",
    LinkLogin: "Masuk Di sini",
    Google: "Lanjut Dengan Google",

    // Login Pages
    

  },
  en: {
    // LeftPanel
    Heading1: "Clinical Analysis For",
    Heading2: "Your Balance.",
    Deskripsi: "Optimize your mental health with state-of-the-art biometric analysis technology for calmer, more measured performance.",
    Subheading1: "Real-time Biometric Analysis",
    Subdeskripsi1: "Monitor cortisol fluctuations instantly with accuracy with Artificial Intelligence technology.  ",
    Subheading2: "Weekly Clinical Report",
    Subdeskripsi2: "Get in-depth data summaries compiled by medical algorithms for optimal performance.",

    //Register Pages
    Create: "Create Account",
    Form: "Please complete the form below.",
    LabelName: "Full Name",
    InputName: "Enter Your Name",
    InputEmail: "Enter Your Email",
    LabelPassword: "Password",
    LabelConfirmPassword: "Confirm Password",
    SubmitRegister: "Register Now",
    LabelLogin: "Already Have an Account?",
    LinkLogin: "Login here",
    Google: "Continue With Google",


  },
};

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'id';
  });

  function toggleLanguage() {
    setLanguage((prev) => {
      const next = prev === 'id' ? 'en' : 'id';
      localStorage.setItem('language', next);
      return next;
    });
  }

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

function useLanguage() {
  return useContext(LanguageContext);
}

export { LanguageContext, LanguageProvider, useLanguage };