import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock expense data
    const mockExpenses = [
      {
        id: "exp-1",
        date: "2024-03-15",
        category: "交通",
        description: "机票 - 北京到东京",
        amount: 3200,
        currency: "CNY",
      },
      {
        id: "exp-2",
        date: "2024-03-16",
        category: "住宿",
        description: "东京酒店 - 2晚",
        amount: 1800,
        currency: "CNY",
      },
      {
        id: "exp-3",
        date: "2024-03-16",
        category: "餐饮",
        description: "寿司晚餐",
        amount: 280,
        currency: "CNY",
      },
      {
        id: "exp-4",
        date: "2024-03-17",
        category: "景点",
        description: "东京塔门票",
        amount: 120,
        currency: "CNY",
      },
    ]

    const summary = {
      totalExpenses: mockExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      categoryBreakdown: {
        交通: 3200,
        住宿: 1800,
        餐饮: 280,
        景点: 120,
      },
      dailyAverage: 1350,
      budget: 8000,
      remaining: 2400,
    }

    return NextResponse.json({
      success: true,
      expenses: mockExpenses,
      summary,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const expenseData = await request.json()

    // Mock expense creation
    const newExpense = {
      id: `exp-${Date.now()}`,
      ...expenseData,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      expense: newExpense,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
