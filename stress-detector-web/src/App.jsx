// import React from "react"
import LeftPanel from "../layouts/LeftPanel"
import RegisterPage from "./pages/RegisterPages"
import { LanguageProvider } from "./contexts/LanguageContext"

export default function App() {
  return (
    <LanguageProvider>
        <RegisterPage/>
    </LanguageProvider>
  )
}