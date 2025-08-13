import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart } from "lucide-react"

interface BudgetItem {
  category: string
  amount: number
  percentage: number
  color: string
}

interface BudgetBreakdownProps {
  totalBudget: string
  breakdown: BudgetItem[]
}

export function BudgetBreakdown({ totalBudget, breakdown }: BudgetBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-green-600" />
          预算明细
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalBudget}</div>
          <div className="text-sm text-gray-500">总预算</div>
        </div>

        <div className="space-y-3">
          {breakdown.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.category}</span>
                <span className="text-sm text-gray-600">¥{item.amount}</span>
              </div>
              <Progress
                value={item.percentage}
                className="h-2"
                style={
                  {
                    "--progress-background": item.color,
                  } as React.CSSProperties
                }
              />
              <div className="text-xs text-gray-500 text-right">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
