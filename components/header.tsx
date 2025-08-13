"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, BookOpen, Settings } from "lucide-react"
import { AuthModal } from "./auth/auth-modal"
import { authService, type User as UserType } from "@/lib/auth"
import { LanguageSelector } from "./enhanced/language-selector"

export function Header() {
  const [user, setUser] = useState<UserType | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Failed to load user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleLogin = (userData: UserType) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    await authService.logout()
    setUser(null)
  }

  const getUserInitial = (user: UserType | null): string => {
    if (!user || !user.name) return "U"
    return user.name.charAt(0).toUpperCase()
  }

  return (
    <>
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
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
            <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              首页
            </a>
            <a href="/templates" className="text-gray-600 hover:text-gray-900 transition-colors">
              攻略模板
            </a>
            <a href="/community" className="text-gray-600 hover:text-gray-900 transition-colors">
              社区
            </a>
            <a href="/tools" className="text-gray-600 hover:text-gray-900 transition-colors">
              实用工具
            </a>
            <a href="/enhanced" className="text-gray-600 hover:text-gray-900 transition-colors">
              技术增强
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSelector />

            {!isLoading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || "用户"} />
                      <AvatarFallback>{getUserInitial(user)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name || "用户"}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email || ""}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    个人资料
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BookOpen className="mr-2 h-4 w-4" />
                    我的攻略
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    设置
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isLoading ? (
              <Button onClick={() => setShowAuthModal(true)}>登录 / 注册</Button>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleLogin} />
    </>
  )
}
