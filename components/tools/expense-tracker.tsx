"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet, Plus, TrendingUp, TrendingDown } from "lucide-react"
import type { ExpenseItem, Budget } from "@/lib/tools"
import { toolsService } from "@/lib/tools"

export function ExpenseTracker() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showSetBudget, setShowSetBudget] = useState(false)

  // New expense form
  const [newExpense, setNewExpense] = useState({
    category: "",
    description: "",
    amount: "",
    currency: "CNY",
    location: "",
  })

  // New budget form
  const [newBudget, setNewBudget] = useState({
    category: "",
    planned: "",
    currency: "CNY",
  })

  const categories = ["住宿", "交通", "餐饮", "景点", "购物", "其他"]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [budgetData, expenseData] = await Promise.all([toolsService.loadBudget(), toolsService.loadExpenses()])
      setBudgets(budgetData)
      setExpenses(expenseData)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.description || !newExpense.amount) return

    const expense: ExpenseItem = {
      id: Date.now().toString(),
      category: newExpense.category,
      description: newExpense.description,
      amount: Number.parseFloat(newExpense.amount),
      currency: newExpense.currency,
      date: new Date(),
      location: newExpense.location,
    }

    try {
      await toolsService.saveExpense(expense)
      setExpenses([...expenses, expense])
      setNewExpense({
        category: "",
        description: "",
        amount: "",
        currency: "CNY",
        location: "",
      })
      setShowAddExpense(false)
    } catch (error) {
      console.error("Failed to save expense:", error)
    }
  }

  const handleSetBudget = async () => {
    if (!newBudget.category || !newBudget.planned) return

    const budget: Budget = {
      category: newBudget.category,
      planned: Number.parseFloat(newBudget.planned),
      actual: 0,
      currency: newBudget.currency,
    }

    const updatedBudgets = [...budgets.filter((b) => b.category !== budget.category), budget]

    try {
      await toolsService.saveBudget(updatedBudgets)
      setBudgets(updatedBudgets)
      setNewBudget({
        category: "",
        planned: "",
        currency: "CNY",
      })
      setShowSetBudget(false)
    } catch (error) {
      console.error("Failed to save budget:", error)
    }
  }

  const getBudgetStatus = (category: string) => {
    const budget = budgets.find((b) => b.category === category)
    if (!budget) return null

    const actual = expenses.filter((e) => e.category === category).reduce((sum, e) => sum + e.amount, 0)

    const percentage = (actual / budget.planned) * 100
    const remaining = budget.planned - actual

    return {
      budget,
      actual,
      percentage: Math.min(percentage, 100),
      remaining,
      isOverBudget: actual > budget.planned,
    }
  }

  const getTotalSpent = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getTotalBudget = () => {
    return budgets.reduce((sum, budget) => sum + budget.planned, 0)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>费用追踪器</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          费用追踪器
        </CardTitle>
        <CardDescription>记录旅行支出，对比预算计划</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">¥{getTotalBudget().toFixed(2)}</div>
            <div className="text-sm text-gray-600">总预算</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">¥{getTotalSpent().toFixed(2)}</div>
            <div className="text-sm text-gray-600">已花费</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">¥{(getTotalBudget() - getTotalSpent()).toFixed(2)}</div>
            <div className="text-sm text-gray-600">剩余预算</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Dialog open={showSetBudget} onOpenChange={setShowSetBudget}>
            <DialogTrigger asChild>
              <Button variant="outline">设置预算</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>设置分类预算</DialogTitle>
                <DialogDescription>为不同支出类别设置预算限额</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>支出类别</Label>
                  <Select
                    value={newBudget.category}
                    onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择类别" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>预算金额</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newBudget.planned}
                    onChange={(e) => setNewBudget({ ...newBudget, planned: e.target.value })}
                  />
                </div>
                <Button onClick={handleSetBudget} className="w-full">
                  设置预算
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加支出
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加支出记录</DialogTitle>
                <DialogDescription>记录您的旅行支出</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>支出类别</Label>
                    <Select
                      value={newExpense.category}
                      onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择类别" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>金额</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>描述</Label>
                  <Input
                    placeholder="例如：午餐 - 拉面店"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>地点（可选）</Label>
                  <Input
                    placeholder="例如：东京新宿"
                    value={newExpense.location}
                    onChange={(e) => setNewExpense({ ...newExpense, location: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddExpense} className="w-full">
                  添加支出
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Budget Progress */}
        {budgets.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">预算进度</h3>
            {categories.map((category) => {
              const status = getBudgetStatus(category)
              if (!status) return null

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        ¥{status.actual.toFixed(2)} / ¥{status.budget.planned.toFixed(2)}
                      </span>
                      {status.isOverBudget ? (
                        <Badge variant="destructive" className="text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          超支
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          正常
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress value={status.percentage} className={`h-2 ${status.isOverBudget ? "bg-red-100" : ""}`} />
                  <div className="text-xs text-gray-500">
                    {status.isOverBudget
                      ? `超支 ¥${Math.abs(status.remaining).toFixed(2)}`
                      : `剩余 ¥${status.remaining.toFixed(2)}`}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Recent Expenses */}
        {expenses.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">最近支出</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {expenses
                .slice(-10)
                .reverse()
                .map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-gray-600">
                        {expense.category} • {expense.location} • {expense.date.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">¥{expense.amount.toFixed(2)}</div>
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
