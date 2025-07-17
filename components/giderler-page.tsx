"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"

interface Expense {
  id: number
  date: string
  description: string
  category: string
  amount: number
}

export function GiderlerPage() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Expense[]>([
    { id: 1, date: "2024-07-15", description: "Ofis Kirası", category: "Kira", amount: 1500 },
    { id: 2, date: "2024-07-14", description: "Personel Maaşı - Ayşe", category: "Personel Maaşı", amount: 2500 },
    { id: 3, date: "2024-07-13", description: "İnternet Faturası", category: "Ofis Giderleri", amount: 250 },
    { id: 4, date: "2024-07-12", description: "Sosyal Medya Reklamı", category: "Pazarlama", amount: 700 },
    { id: 5, date: "2024-07-11", description: "Su Faturası", category: "Ofis Giderleri", amount: 100 },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")

  const categories = ["Kira", "Personel Maaşı", "Ofis Giderleri", "Pazarlama", "Diğer"]

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
          <p className="text-gray-600">Veriler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow p-6 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Giderler</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Gider Ekle
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Gider Hareketleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Açıklama veya kategoriye göre ara..."
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
                      <TableCell className="text-right font-medium text-red-600">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Gösterilecek gider hareketi bulunamadı.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
