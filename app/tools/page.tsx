"use client"

import { PackingListGenerator } from "@/components/tools/packing-list-generator"
import { ExpenseTracker } from "@/components/tools/expense-tracker"
import { WeatherWidget } from "@/components/tools/weather-widget"
import { CurrencyConverter } from "@/components/tools/currency-converter"

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            实用工具
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">一站式旅行工具集，让您的旅程更加便捷和有序</p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PackingListGenerator />
          <ExpenseTracker />
          <WeatherWidget />
          <CurrencyConverter />
        </div>
      </div>
    </div>
  )
}
