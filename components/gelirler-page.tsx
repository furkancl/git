"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { PlusCircle, Search, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Income {
  id: number
  date: string
  description: string
  category: string
  amount: number
}

export function GelirlerPage() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Income[]>([
    { id: 1, date: "2024-07-15", description: "Randevu Ücreti - Ayşe Yılmaz", category: "Randevu Ücreti", amount: 750 },
    {
      id: 2,
      date: "2024-07-14",
      description: "Danışmanlık Hizmeti - ABC Şirketi",
      category: "Danışmanlık",
      amount: 2000,
    },
    {
      id: 3,
      date: "2024-07-13",
      description: "Randevu Ücreti - Mehmet Demir",
      category: "Randevu Ücreti",
      amount: 600,
    },
    { id: 4, date: "2024-07-12", description: "Eğitim Geliri - Online Kurs", category: "Eğitim", amount: 1500 },
    { id: 5, date: "2024-07-11", description: "Randevu Ücreti - Zeynep Kaya", category: "Randevu Ücreti", amount: 750 },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")

  const categories = ["Randevu Ücreti", "Danışmanlık", "Eğitim", "Diğer"]

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory
    return matchesSearch && matchesCategory
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000) // Simulate data fetching
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Gelir verileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gelirler</h1>

      {/* Add New Income Button */}
      <div className="flex justify-end mb-4 flex-shrink-0">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Yeni Gelir Ekle
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 flex-shrink-0">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Gelirlerde ara..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="mr-2 h-4 w-4 text-gray-500" />
            <SelectValue placeholder="Kategoriye göre filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Recent Incomes Table */}
      <Card className="shadow-sm border-none flex-grow flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-xl font-bold text-gray-800">Son Gelirler</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    Gösterilecek gelir hareketi bulunamadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
