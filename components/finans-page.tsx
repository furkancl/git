"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"

// Dummy Data
const dummyData = {
  income: [
    { category: "Randevu Ücreti", amount: 5000, color: "#82ca9d" },
    { category: "Danışmanlık", amount: 3000, color: "#8884d8" },
    { category: "Eğitim", amount: 2000, color: "#ffc658" },
    { category: "Diğer", amount: 500, color: "#a4de6c" },
  ],
  expenses: [
    { category: "Kira", amount: 1500, color: "#ff7f50" },
    { category: "Personel Maaşı", amount: 2500, color: "#ffbb28" },
    { category: "Ofis Giderleri", amount: 800, color: "#0088fe" },
    { category: "Pazarlama", amount: 700, color: "#00c49f" },
    { category: "Diğer", amount: 300, color: "#ff8042" },
  ],
}

export default function FinansPage() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [selectedCategoryType, setSelectedCategoryType] = useState<"income" | "expense">("income")
  const [hoveredCategoryName, setHoveredCategoryName] = useState<string | null>(null)

  const totalIncome = dummyData.income.reduce((sum, item) => sum + item.amount, 0)
  const totalExpenses = dummyData.expenses.reduce((sum, item) => sum + item.amount, 0)
  const netBalance = totalIncome - totalExpenses

  const dataToDisplay = selectedCategoryType === "income" ? dummyData.income : dummyData.expenses

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-2 border rounded shadow-md text-sm">
          <p className="font-semibold">{data.category}</p>
          <p>{`Tutar: ${formatCurrency(data.amount)}`}</p>
          <p>{`Oran: ${(data.percent * 100).toFixed(2)}%`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow p-6 md:p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Finansal Genel Bakış</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
              <span className="text-green-500 text-lg">+</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground">Bu dönemdeki toplam geliriniz</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
              <span className="text-red-500 text-lg">-</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">Bu dönemdeki toplam gideriniz</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Bakiye</CardTitle>
              <span className={netBalance >= 0 ? "text-blue-500 text-lg" : "text-red-500 text-lg"}>
                {netBalance >= 0 ? "↑" : "↓"}
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(netBalance)}</div>
              <p className="text-xs text-muted-foreground">Gelirlerinizden giderlerinizin çıkarılmasıyla kalan</p>
            </CardContent>
          </Card>
        </div>

        {/* Date Filter */}
        <div className="flex justify-end mb-8">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y", { locale: tr })} -{" "}
                      {format(dateRange.to, "LLL dd, y", { locale: tr })}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y", { locale: tr })
                  )
                ) : (
                  <span>Tarih Aralığı Seçin</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange as any}
                onSelect={setDateRange as any}
                numberOfMonths={2}
                locale={tr}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Category Distribution Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Kategori Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4 space-x-4">
              <Button
                variant={selectedCategoryType === "income" ? "default" : "outline"}
                onClick={() => setSelectedCategoryType("income")}
              >
                Gelir Kategorileri
              </Button>
              <Button
                variant={selectedCategoryType === "expense" ? "default" : "outline"}
                onClick={() => setSelectedCategoryType("expense")}
              >
                Gider Kategorileri
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              <div className="w-full max-w-md h-[400px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataToDisplay}
                      cx="50%"
                      cy="50%"
                      outerRadius={150} // Grafiği büyüttük
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="category"
                      onMouseEnter={(_, index) => setHoveredCategoryName(dataToDisplay[index].category)}
                      onMouseLeave={() => setHoveredCategoryName(null)}
                    >
                      {dataToDisplay.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="transition-all duration-200 ease-in-out"
                          style={{
                            filter: hoveredCategoryName === entry.category ? "brightness(1.1)" : "none",
                            transform: hoveredCategoryName === entry.category ? "scale(1.03)" : "scale(1)",
                            transformOrigin: "center center",
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-grow w-full lg:w-auto">
                <h3 className="text-lg font-semibold mb-3">Kategori Detayları:</h3>
                <ul className="space-y-2">
                  {dataToDisplay.map((item, index) => (
                    <li
                      key={item.category}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md transition-colors duration-200",
                        hoveredCategoryName === item.category && "bg-gray-100 font-semibold",
                      )}
                      onMouseEnter={() => setHoveredCategoryName(item.category)}
                      onMouseLeave={() => setHoveredCategoryName(null)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span>{item.category}</span>
                      </div>
                      <span>{formatCurrency(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
