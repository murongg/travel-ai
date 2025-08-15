"use client"

import { Button } from "@/components/ui/button"
import { LanguageSelector } from "./enhanced/language-selector"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            旅游攻略助手
          </h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">首页</a>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>
    </header>
  )
}
