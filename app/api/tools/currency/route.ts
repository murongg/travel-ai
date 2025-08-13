import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from") || "USD"
    const to = searchParams.get("to") || "CNY"
    const amount = Number.parseFloat(searchParams.get("amount") || "1")

    // Mock exchange rates
    const exchangeRates = {
      USD: {
        CNY: 7.25,
        EUR: 0.92,
        JPY: 149.5,
        GBP: 0.79,
        KRW: 1320.0,
        THB: 35.8,
      },
      CNY: {
        USD: 0.138,
        EUR: 0.127,
        JPY: 20.62,
        GBP: 0.109,
        KRW: 182.07,
        THB: 4.94,
      },
      EUR: {
        USD: 1.09,
        CNY: 7.89,
        JPY: 162.45,
        GBP: 0.86,
        KRW: 1434.5,
        THB: 38.92,
      },
      JPY: {
        USD: 0.0067,
        CNY: 0.0485,
        EUR: 0.0062,
        GBP: 0.0053,
        KRW: 8.83,
        THB: 0.239,
      },
    }

    const rate = exchangeRates[from as keyof typeof exchangeRates]?.[to as keyof typeof exchangeRates.USD] || 1
    const convertedAmount = amount * rate

    return NextResponse.json({
      success: true,
      conversion: {
        from,
        to,
        amount,
        rate,
        convertedAmount: Number.parseFloat(convertedAmount.toFixed(2)),
        lastUpdated: new Date().toISOString(),
      },
      popularRates: [
        { from: "USD", to: "CNY", rate: 7.25 },
        { from: "EUR", to: "CNY", rate: 7.89 },
        { from: "JPY", to: "CNY", rate: 0.0485 },
        { from: "GBP", to: "CNY", rate: 9.17 },
      ],
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
