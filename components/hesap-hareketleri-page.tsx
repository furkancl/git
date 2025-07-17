"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { PlusCircle, Search, Filter } from "lucide-react"

// Dummy Data
const initialTransactions = [
  {
    id: 1,
    date: "2024-07-15",
    description: "Randevu Ücreti - Ayşe Yılmaz",
    type: "Gelir",
    category: "Randevu Ücreti",
    amount: 750,
  },
  { id: 2, date: "2024-07-14", description: "Ofis Kirası", type: "Gider", category: "Kira", amount: 1500 },
  {
    id: 3,
    date: "2024-07-13",
    description: "Randevu Ücreti - Mehmet Demir",
    type: "Gelir",
    category: "Randevu Ücreti",
    amount: 600,
  },
  { id: 4, date: "2024-07-12", description: "Pazarlama Gideri", type: "Gider", category: "Pazarlama", amount: 700 },
  {
    id: 5,
    date: "2024-07-11",
    description: "Eğitim Geliri - Online Kurs",
    type: "Gelir",
    category: "Eğitim",
    amount: 1500,
  },
  { id: 6, date: "2024-07-10", description: "Personel Maaşı", type: "Gider", category: "Personel Maaşı", amount: 2500 },
]

export default function HesapHareketleriPage() {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")

  const categories = [
    "Randevu Ücreti",
    "Danışmanlık",
    "Eğitim",
    "Kira",
    "Personel Maaşı",
    "Ofis Giderleri",
    "Pazarlama",
    "Diğer",
  ]

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory
    return matchesSearch && matchesType && matchesCategory
  })

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow p-6 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Hesap Hareketleri</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Hareket Ekle
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Tüm Hareketler</CardTitle>
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
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <Filter className="mr-2 h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Türe göre filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Türler</SelectItem>
                  <SelectItem value="Gelir">Gelir</SelectItem>
                  <SelectItem value="Gider">Gider</SelectItem>
                </SelectContent>
              </Select>
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
                  <TableHead>Tür</TableHead>
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
                      <TableCell>
                        <span
                          className={`font-medium ${transaction.type === "Gelir" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${transaction.type === "Gelir" ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Gösterilecek hesap hareketi bulunamadı.
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
