export interface PackingItem {
  id: string
  name: string
  category: string
  essential: boolean
  quantity?: number
  packed?: boolean
}

export interface PackingList {
  destination: string
  season: string
  duration: number
  tripType: string
  items: PackingItem[]
}

export interface ExpenseItem {
  id: string
  category: string
  description: string
  amount: number
  currency: string
  date: Date
  location?: string
}

export interface Budget {
  category: string
  planned: number
  actual: number
  currency: string
}

export interface WeatherInfo {
  location: string
  current: {
    temperature: number
    condition: string
    humidity: number
    windSpeed: number
  }
  forecast: Array<{
    date: Date
    high: number
    low: number
    condition: string
    precipitation: number
  }>
}

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  lastUpdated: Date
}

export const toolsService = {
  generatePackingList: async (
    destination: string,
    season: string,
    duration: number,
    tripType: string,
  ): Promise<PackingList> => {
    try {
      const response = await fetch("/api/tools/packing-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ destination, season, duration, tripType }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate packing list")
      }

      const data = await response.json()
      return data.packingList
    } catch (error) {
      console.error("Error generating packing list:", error)
      throw error
    }
  },

  getWeatherInfo: async (location: string): Promise<WeatherInfo> => {
    try {
      const response = await fetch(`/api/tools/weather?location=${encodeURIComponent(location)}`)

      if (!response.ok) {
        throw new Error("Failed to fetch weather info")
      }

      const data = await response.json()
      // Convert date strings back to Date objects
      data.weatherInfo.forecast = data.weatherInfo.forecast.map((item: any) => ({
        ...item,
        date: new Date(item.date),
      }))
      return data.weatherInfo
    } catch (error) {
      console.error("Error fetching weather info:", error)
      throw error
    }
  },

  getExchangeRates: async (baseCurrency: string): Promise<ExchangeRate[]> => {
    try {
      const response = await fetch(`/api/tools/currency?base=${baseCurrency}`)

      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates")
      }

      const data = await response.json()
      // Convert date strings back to Date objects
      return data.rates.map((rate: any) => ({
        ...rate,
        lastUpdated: new Date(rate.lastUpdated),
      }))
    } catch (error) {
      console.error("Error fetching exchange rates:", error)
      throw error
    }
  },

  saveBudget: async (budgets: Budget[]): Promise<void> => {
    try {
      const response = await fetch("/api/tools/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ type: "budget", data: budgets }),
      })

      if (!response.ok) {
        throw new Error("Failed to save budget")
      }
    } catch (error) {
      console.error("Error saving budget:", error)
      // Fallback to localStorage
      localStorage.setItem("travel-budget", JSON.stringify(budgets))
    }
  },

  loadBudget: async (): Promise<Budget[]> => {
    try {
      const response = await fetch("/api/tools/expenses?type=budget", {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to load budget")
      }

      const data = await response.json()
      return data.budget || []
    } catch (error) {
      console.error("Error loading budget:", error)
      // Fallback to localStorage
      const saved = localStorage.getItem("travel-budget")
      return saved ? JSON.parse(saved) : []
    }
  },

  saveExpense: async (expense: ExpenseItem): Promise<void> => {
    try {
      const response = await fetch("/api/tools/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ type: "expense", data: expense }),
      })

      if (!response.ok) {
        throw new Error("Failed to save expense")
      }
    } catch (error) {
      console.error("Error saving expense:", error)
      // Fallback to localStorage
      const expenses = await toolsService.loadExpenses()
      expenses.push(expense)
      localStorage.setItem("travel-expenses", JSON.stringify(expenses))
    }
  },

  loadExpenses: async (): Promise<ExpenseItem[]> => {
    try {
      const response = await fetch("/api/tools/expenses?type=expenses", {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to load expenses")
      }

      const data = await response.json()
      return data.expenses.map((e: any) => ({ ...e, date: new Date(e.date) })) || []
    } catch (error) {
      console.error("Error loading expenses:", error)
      // Fallback to localStorage
      const saved = localStorage.getItem("travel-expenses")
      return saved ? JSON.parse(saved).map((e: any) => ({ ...e, date: new Date(e.date) })) : []
    }
  },

  getFlightInfo: async (from: string, to: string, date: string): Promise<any> => {
    try {
      const response = await fetch(
        `/api/tools/flights?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch flight info")
      }

      const data = await response.json()
      return data.flights
    } catch (error) {
      console.error("Error fetching flight info:", error)
      throw error
    }
  },
}

// Helper function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}
