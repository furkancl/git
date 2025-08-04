"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { PlusCircle, Search, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { isWithinInterval, parseISO } from "date-fns"
import type { DateRange } from "react-day-picker"
import { CalendarIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Income {
  id: number
  date: string
  description: string
  category: string
  amount: number
}

function GelirlerPage() {
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newIncomeDescription, setNewIncomeDescription] = useState("")
  const [newIncomeAmount, setNewIncomeAmount] = useState("")
  const [newIncomeDate, setNewIncomeDate] = useState<string>("")
  const [newIncomeCategory, setNewIncomeCategory] = useState<string>("")

  const categories = ["Randevu Ücreti", "Danışmanlık", "Eğitim", "Diğer"]

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory
    // Tarih aralığı filtresi
    const transactionDate = parseISO(transaction.date)
    let matchesDate = true
    
    if (dateRange?.from || dateRange?.to) {
      // If only 'from' date is selected, filter from that date onwards
      if (dateRange?.from && !dateRange?.to) {
        matchesDate = transactionDate >= dateRange.from
      }
      // If only 'to' date is selected, filter up to that date
      else if (!dateRange?.from && dateRange?.to) {
        matchesDate = transactionDate <= dateRange.to
      }
      // If both dates are selected, use interval check
      else if (dateRange?.from && dateRange?.to) {
        matchesDate = isWithinInterval(transactionDate, { 
          start: dateRange.from, 
          end: dateRange.to 
        })
      }
    }
    return matchesSearch && matchesCategory && matchesDate
  })

  // Kategori filtresi değiştiğinde formda da güncelle
  useEffect(() => {
    if (filterCategory !== "all") {
      setNewIncomeCategory(filterCategory)
    } else {
      setNewIncomeCategory("")
    }
  }, [filterCategory])

  const handleAddIncome = () => {
    if (!newIncomeDescription || !newIncomeAmount || !newIncomeDate || !newIncomeCategory) return
    const newIncome: Income = {
      id: Date.now(),
      date: newIncomeDate,
      description: newIncomeDescription,
      category: newIncomeCategory,
      amount: Number(newIncomeAmount),
    }
    setTransactions((prev) => [newIncome, ...prev])
    setIsDialogOpen(false)
    setNewIncomeDescription("")
    setNewIncomeAmount("")
    setNewIncomeDate("")
    setNewIncomeCategory(filterCategory !== "all" ? filterCategory : "")
  }

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

  // Kartlar için hesaplamalar
  const toplamGelir = transactions.reduce((sum, t) => sum + t.amount, 0)
  const islemSayisi = transactions.length
  // En büyük gelir kategorisini bul
  const gelirKategoriToplamlari = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)
  const enBuyukGelirKategori = Object.entries(gelirKategoriToplamlari).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gelirler</h1>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
        <Card className="shadow-lg rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-lg">
                📈
              </span>
              <CardTitle className="text-blue-700 text-base font-semibold">En Büyük Gelir Kategorisi</CardTitle>
            </div>
            <div className="text-base font-semibold text-blue-700">{enBuyukGelirKategori ? enBuyukGelirKategori[0] : '-'}</div>
            <div className="text-xl font-bold text-blue-700">{enBuyukGelirKategori ? formatCurrency(enBuyukGelirKategori[1]) : '-'}</div>
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

      {/* Add New Income Button */}
      <div className="flex justify-end mb-4 flex-shrink-0">
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Yeni Gelir Ekle
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Gelir Ekle</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Açıklama</Label>
                <Textarea
                  id="description"
                  value={newIncomeDescription}
                  onChange={(e) => setNewIncomeDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Gelir açıklaması"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Tutar</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newIncomeAmount}
                  onChange={(e) => setNewIncomeAmount(e.target.value)}
                  className="col-span-3"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Tarih</Label>
                <Input
                  id="date"
                  type="date"
                  value={newIncomeDate}
                  onChange={(e) => setNewIncomeDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Kategori</Label>
                <Select value={newIncomeCategory} onValueChange={setNewIncomeCategory}>
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
                onClick={handleAddIncome}
                disabled={
                  !newIncomeDescription ||
                  !newIncomeAmount ||
                  !newIncomeDate ||
                  !newIncomeCategory
                }
              >Ekle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
        {/* Tarih Aralığı Seçici */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-[220px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from && dateRange?.to
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

export default function Gelirler() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <GelirlerPage />
      </main>
    </div>
  )
}