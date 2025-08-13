import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const date = searchParams.get("date")

    if (!from || !to || !date) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Mock flight data
    const mockFlights = [
      {
        id: "flight-1",
        airline: "中国国际航空",
        flightNumber: "CA183",
        departure: {
          airport: from,
          time: "08:30",
          terminal: "T3",
        },
        arrival: {
          airport: to,
          time: "12:45",
          terminal: "T1",
        },
        duration: "3h 15m",
        price: 2800,
        currency: "CNY",
        stops: 0,
        aircraft: "Boeing 737-800",
      },
      {
        id: "flight-2",
        airline: "东方航空",
        flightNumber: "MU271",
        departure: {
          airport: from,
          time: "14:20",
          terminal: "T1",
        },
        arrival: {
          airport: to,
          time: "18:50",
          terminal: "T2",
        },
        duration: "3h 30m",
        price: 2650,
        currency: "CNY",
        stops: 0,
        aircraft: "Airbus A320",
      },
      {
        id: "flight-3",
        airline: "全日空",
        flightNumber: "NH956",
        departure: {
          airport: from,
          time: "19:45",
          terminal: "T3",
        },
        arrival: {
          airport: to,
          time: "23:30",
          terminal: "T1",
        },
        duration: "2h 45m",
        price: 3200,
        currency: "CNY",
        stops: 0,
        aircraft: "Boeing 787-8",
      },
    ]

    return NextResponse.json({
      success: true,
      flights: mockFlights,
      searchParams: {
        from,
        to,
        date,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
