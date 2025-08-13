"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: any) => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login")

  const handleSuccess = (user: any) => {
    onSuccess(user)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {mode === "login" ? (
          <LoginForm onSuccess={handleSuccess} onSwitchToRegister={() => setMode("register")} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={() => setMode("login")} />
        )}
      </DialogContent>
    </Dialog>
  )
}
