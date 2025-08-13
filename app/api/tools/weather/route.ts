import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")

    if (!city) {
      return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
    }

    // Mock weather data
    const mockWeatherData = {
      city,
      country: "Japan",
      current: {
        temperature: 18,
        condition: "晴朗",
        humidity: 65,
        windSpeed: 12,
        icon: "sunny",
      },
      forecast: [
        {
          date: "2024-03-20",
          high: 22,
          low: 15,
          condition: "晴朗",
          icon: "sunny",
          precipitation: 0,
        },
        {
          date: "2024-03-21",
          high: 20,
          low: 13,
          condition: "多云",
          icon: "cloudy",
          precipitation: 10,
        },
        {
          date: "2024-03-22",
          high: 17,
          low: 11,
          condition: "小雨",
          icon: "rainy",
          precipitation: 80,
        },
        {
          date: "2024-03-23",
          high: 19,
          low: 12,
          condition: "阴天",
          icon: "overcast",
          precipitation: 20,
        },
        {
          date: "2024-03-24",
          high: 23,
          low: 16,
          condition: "晴朗",
          icon: "sunny",
          precipitation: 0,
        },
      ],
      alerts: [],
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      weather: mockWeatherData,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
