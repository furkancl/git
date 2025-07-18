"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { PlusCircle, Search, Filter } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { isWithinInterval, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import React from "react"

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
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTransactionDescription, setNewTransactionDescription] = useState("")
  const [newTransactionAmount, setNewTransactionAmount] = useState("")
  const [newTransactionDate, setNewTransactionDate] = useState<string>("")
  const [newTransactionType, setNewTransactionType] = useState<string>("")
  const [newTransactionCategory, setNewTransactionCategory] = useState<string>("")

  // Filtre değiştiğinde formda da güncelle
  React.useEffect(() => {
    if (filterType !== "all") {
      setNewTransactionType(filterType)
    } else {
      setNewTransactionType("")
    }
  }, [filterType])
  React.useEffect(() => {
    if (filterCategory !== "all") {
      setNewTransactionCategory(filterCategory)
    } else {
      setNewTransactionCategory("")
    }
  }, [filterCategory])

  const handleAddTransaction = () => {
    if (!newTransactionDescription || !newTransactionAmount || !newTransactionDate || !newTransactionType || !newTransactionCategory) return
    const newTransaction = {
      id: Date.now(),
      date: newTransactionDate,
      description: newTransactionDescription,
      type: newTransactionType,
      category: newTransactionCategory,
      amount: Number(newTransactionAmount),
    }
    setTransactions((prev) => [newTransaction, ...prev])
    setIsDialogOpen(false)
    setNewTransactionDescription("")
    setNewTransactionAmount("")
    setNewTransactionDate("")
    setNewTransactionType(filterType !== "all" ? filterType : "")
    setNewTransactionCategory(filterCategory !== "all" ? filterCategory : "")
  }

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
    // Tarih aralığı filtresi
    const transactionDate = parseISO(transaction.date)
    const matchesDate =
      (!dateRange.from || isWithinInterval(transactionDate, { start: dateRange.from, end: dateRange.to || new Date() })) &&
      (!dateRange.to || isWithinInterval(transactionDate, { start: dateRange.from || new Date(0), end: dateRange.to }))
    return matchesSearch && matchesType && matchesCategory && matchesDate
  })

  // Kartlar için hesaplamalar
  const toplamGelir = transactions.filter(t => t.type === "Gelir").reduce((sum, t) => sum + t.amount, 0)
  const toplamGider = transactions.filter(t => t.type === "Gider").reduce((sum, t) => sum + t.amount, 0)
  const netBakiye = toplamGelir - toplamGider
  const islemSayisi = transactions.length

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow p-6 md:p-10">
        {/* Özet Kartlar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-lg rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-0">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-200 text-lg">
                  💰
                </span>
                <CardTitle className="text-green-700 text-base font-semibold">Toplam Gelir</CardTitle>
              </div>
              <div className="text-2xl font-bold text-green-700">{formatCurrency(toplamGelir)}</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-xl bg-gradient-to-br from-red-50 to-red-100 border-0">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-200 text-lg">
                  💸
                </span>
                <CardTitle className="text-red-700 text-base font-semibold">Toplam Gider</CardTitle>
              </div>
              <div className="text-2xl font-bold text-red-700">{formatCurrency(toplamGider)}</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-0">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-lg">
                  🧮
                </span>
                <CardTitle className="text-blue-700 text-base font-semibold">Net Bakiye</CardTitle>
              </div>
              <div className="text-2xl font-bold text-blue-700">{formatCurrency(netBakiye)}</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-0">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-lg">
                  🔢
                </span>
                <CardTitle className="text-gray-700 text-base font-semibold">İşlem Sayısı</CardTitle>
              </div>
              <div className="text-2xl font-bold text-gray-700">{islemSayisi}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Hesap Hareketleri</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
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
              {/* Tarih Aralığı Seçici */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-[220px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, "dd.MM.yyyy")} - ${format(dateRange.to, "dd.MM.yyyy")}`
                      : "Tarih Aralığı Seç"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Hareket Ekle</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={newTransactionDescription}
                    onChange={(e) => setNewTransactionDescription(e.target.value)}
                    className="col-span-3"
                    placeholder="Hareket açıklaması"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">Tutar</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newTransactionAmount}
                    onChange={(e) => setNewTransactionAmount(e.target.value)}
                    className="col-span-3"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Tarih</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTransactionDate}
                    onChange={(e) => setNewTransactionDate(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Tür</Label>
                  <Select value={newTransactionType} onValueChange={setNewTransactionType}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Tür seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gelir">Gelir</SelectItem>
                      <SelectItem value="Gider">Gider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Kategori</Label>
                  <Select value={newTransactionCategory} onValueChange={setNewTransactionCategory}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Kategori seç" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
                <Button
                  onClick={handleAddTransaction}
                  disabled={
                    !newTransactionDescription ||
                    !newTransactionAmount ||
                    !newTransactionDate ||
                    !newTransactionType ||
                    !newTransactionCategory
                  }
                >Ekle</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </main>
    </div>
  )
}
