"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { i18nService, type Language } from "@/lib/i18n"

export function LanguageSelector() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("zh")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await i18nService.getLanguage()
        setCurrentLanguage(savedLanguage)
        i18nService.currentLanguage = savedLanguage
      } catch (error) {
        console.error("Failed to load language preference:", error)
        setCurrentLanguage("zh")
      }
    }

    loadLanguage()
  }, [])

  const handleLanguageChange = async (language: Language) => {
    setIsLoading(true)
    try {
      await i18nService.setLanguage(language)
      setCurrentLanguage(language)
      // In a real app, this would trigger a re-render of the entire app
      window.location.reload()
    } catch (error) {
      console.error("Failed to change language:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const supportedLanguages = i18nService.getSupportedLanguages()
  const currentLang = supportedLanguages.find((lang) => lang.code === currentLanguage)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" disabled={isLoading}>
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLang?.name}</span>
          <span className="sm:hidden">{currentLang?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code as Language)}
            className={`flex items-center gap-2 ${currentLanguage === language.code ? "bg-blue-50" : ""}`}
            disabled={isLoading}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
