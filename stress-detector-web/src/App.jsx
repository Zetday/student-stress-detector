// import React from "react"
import LeftPanel from "../layouts/LeftPanel"
import AuthLayout from "../layouts/AuthLayout"
import { LanguageProvider } from "./contexts/LanguageContext"

export default function App() {
  return (
    <LanguageProvider>
    <div className="min-h-screen flex items-center justify-center bg-blue-500">
      <h1 className="text-3xl font-bold text-white">
        <AuthLayout/>
      </h1>
    </div>
    </LanguageProvider>
  )
}