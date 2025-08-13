"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpDown, Loader2, DollarSign } from "lucide-react"
import type { ExchangeRate } from "@/lib/tools"
import { toolsService } from "@/lib/tools"

export function CurrencyConverter() {
  const [amount, setAmount] = useState("100")
  const [fromCurrency, setFromCurrency] = useState("CNY")
  const [toCurrency, setToCurrency] = useState("USD")
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)

  const currencies = [
    { code: "CNY", name: "人民币", symbol: "¥" },
    { code: "USD", name: "美元", symbol: "$" },
    { code: "EUR", name: "欧元", symbol: "€" },
    { code: "JPY", name: "日元", symbol: "¥" },
    { code: "GBP", name: "英镑", symbol: "£" },
    { code: "AUD", name: "澳元", symbol: "A$" },
    { code: "CAD", name: "加元", symbol: "C$" },
    { code: "CHF", name: "瑞士法郎", symbol: "CHF" },
    { code: "HKD", name: "港币", symbol: "HK$" },
  ]

  useEffect(() => {
    loadRates()
  }, [fromCurrency])

  const loadRates = async () => {
    setIsLoading(true)
    try {
      const rateData = await toolsService.getExchangeRates(fromCurrency)
      setRates(rateData)
    } catch (error) {
      console.error("Failed to load exchange rates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConvert = () => {
    const rate = rates.find((r) => r.to === toCurrency)
    if (rate && amount) {
      const result = Number.parseFloat(amount) * rate.rate
      setConvertedAmount(result)
    }
  }

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setConvertedAmount(null)
  }

  const getCurrencySymbol = (code: string) => {
    return currencies.find((c) => c.code === code)?.symbol || code
  }

  const getCurrencyName = (code: string) => {
    return currencies.find((c) => c.code === code)?.name || code
  }

  const formatLastUpdated = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          汇率转换器
        </CardTitle>
        <CardDescription>实时汇率查询和货币转换</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">金额</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="输入金额" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">从</label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="icon" onClick={handleSwapCurrencies}>
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">到</label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleConvert} disabled={isLoading || !amount}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "转换"}
            </Button>
          </div>

          {convertedAmount !== null && (
            <div className="text-center p-6 bg-secondary rounded-lg">
              <div className="text-3xl font-bold text-foreground mb-2">
                {getCurrencySymbol(toCurrency)} {convertedAmount.toFixed(2)}
              </div>
              <div className="text-muted-foreground">
                {getCurrencySymbol(fromCurrency)} {amount} {getCurrencyName(fromCurrency)} ={" "}
                {getCurrencySymbol(toCurrency)} {convertedAmount.toFixed(2)} {getCurrencyName(toCurrency)}
              </div>
            </div>
          )}
        </div>

        {/* Exchange Rates Table */}
        {rates.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">当前汇率</h4>
              <span className="text-xs text-muted-foreground">更新时间: {formatLastUpdated(rates[0].lastUpdated)}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {rates.map((rate) => (
                <div key={rate.to} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {rate.from}/{rate.to}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{rate.rate.toFixed(4)}</div>
                    <div className="text-xs text-muted-foreground">
                      1 {rate.from} = {rate.rate.toFixed(4)} {rate.to}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
