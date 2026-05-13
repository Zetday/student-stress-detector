// import React from "react"
import LeftPanel from "../layouts/LeftPanel"
import { LanguageProvider } from "./contexts/LanguageContext"
import { Route, Routes } from "react-router-dom"

//Pages
import RegisterPage from "./pages/RegisterPages"
import LoginPage from "./pages/LoginPages"

export default function App() {
  return (
    <LanguageProvider>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
    </LanguageProvider>
  )
}