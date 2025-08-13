export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
}

export interface AuthState {
  user: User | null
  isLoading: boolean
}

// Real authentication functions using API
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "登录失败")
    }

    const data = await response.json()
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("auth_token", data.token)
    }
    return data.user
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "注册失败")
    }

    const data = await response.json()
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("auth_token", data.token)
    }
    return data.user
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    }
    localStorage.removeItem("auth_token")
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem("auth_token")
    if (!token) return null

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        localStorage.removeItem("auth_token")
        return null
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      localStorage.removeItem("auth_token")
      return null
    }
  },

  // Helper function to get auth headers
  getAuthHeaders: (): Record<string, string> => {
    const token = localStorage.getItem("auth_token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  },
}
