"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Wallet, CreditCard, Banknote, ChevronDown, CalendarIcon, Search, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Transaction {
  id: string
  date: string
  personName: string // İsim Soyisim için yeni alan
  details: string // Ek açıklama için yeni alan
  amount: number
  type: "in" | "out"
  accountType: "cash" | "bank1" | "bank2"
}

export function KasaPage() {
  const [loading, setLoading] = useState(true)
  const [isNewTransactionDialogOpen, setIsNewTransactionDialogOpen] = useState(false)
  const [newTransactionType, setNewTransactionType] = useState<"cash-in" | "cash-out" | "card-in" | "card-out" | null>(
    null,
  )
  const [newTransactionPersonName, setNewTransactionPersonName] = useState("") // İsim Soyisim için state
  const [newTransactionDetails, setNewTransactionDetails] = useState("") // Ek açıklama için state
  const [newTransactionAmount, setNewTransactionAmount] = useState("")
  const [newTransactionDate, setNewTransactionDate] = useState<Date | undefined>(new Date())
  const [newTransactionBankAccount, setNewTransactionBankAccount] = useState<"Banka 1" | "Banka 2" | null>(null)

  // Tüm işlemleri tek bir state'te tutuyoruz
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([
    {
      id: "CASH001",
      date: "2024-07-16",
      personName: "Randevu Ödemesi",
      details: "Nakit ödeme",
      amount: 500,
      type: "in",
      accountType: "cash",
    },
    {
      id: "CASH002",
      date: "2024-07-15",
      personName: "Ofis Temizliği",
      details: "Temizlik hizmeti ödemesi",
      amount: 200,
      type: "out",
      accountType: "cash",
    },
    {
      id: "CASH003",
      date: "2024-07-15",
      personName: "Kitap Satışı",
      details: "Eski kitap satışı",
      amount: 100,
      type: "in",
      accountType: "cash",
    },
    {
      id: "CASH004",
      date: "2024-07-14",
      personName: "Kırtasiye Alımı",
      details: "Kalem, defter vb.",
      amount: 75,
      type: "out",
      accountType: "cash",
    },
    {
      id: "BANK101",
      date: "2024-07-16",
      personName: "Randevu Ödemesi",
      details: "Banka 1 hesabına gelen ödeme",
      amount: 750,
      type: "in",
      accountType: "bank1",
    },
    {
      id: "BANK102",
      date: "2024-07-14",
      personName: "Kira Ödemesi",
      details: "Aylık ofis kirası",
      amount: 3000,
      type: "out",
      accountType: "bank1",
    },
    {
      id: "BANK103",
      date: "2024-07-13",
      personName: "Online Seans",
      details: "Online randevu ödemesi",
      amount: 600,
      type: "in",
      accountType: "bank1",
    },
    {
      id: "BANK104",
      date: "2024-07-11",
      personName: "Yazılım Aboneliği",
      details: "Yıllık yazılım aboneliği",
      amount: 150,
      type: "out",
      accountType: "bank1",
    },
    {
      id: "BANK201",
      date: "2024-07-16",
      personName: "Randevu Ödemesi",
      details: "Banka 2 hesabına gelen ödeme",
      amount: 400,
      type: "in",
      accountType: "bank2",
    },
    {
      id: "BANK202",
      date: "2024-07-15",
      personName: "Eğitim Ücreti",
      details: "Seminer katılım ücreti",
      amount: 1000,
      type: "out",
      accountType: "bank2",
    },
    {
      id: "BANK203",
      date: "2024-07-12",
      personName: "Kitap Satışı",
      details: "E-kitap satışı",
      amount: 200,
      type: "in",
      accountType: "bank2",
    },
    {
      id: "BANK204",
      date: "2024-07-09",
      personName: "Ofis Malzemesi",
      details: "Yeni ofis malzemeleri alımı",
      amount: 100,
      type: "out",
      accountType: "bank2",
    },
  ])

  const [selectedAccountFilter, setSelectedAccountFilter] = useState<"all" | "cash" | "bank1" | "bank2">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Toplamları hesapla
  const calculateTotals = (transactions: Transaction[], accountType?: "cash" | "bank1" | "bank2") => {
    const filtered = accountType ? transactions.filter((t) => t.accountType === accountType) : transactions
    const totalIn = filtered.filter((t) => t.type === "in").reduce((sum, t) => sum + t.amount, 0)
    const totalOut = filtered.filter((t) => t.type === "out").reduce((sum, t) => sum + t.amount, 0)
    return { totalIn, totalOut }
  }

  // Use useMemo for performance if transactions list is very large
  const cashTotals = useMemo(() => calculateTotals(allTransactions, "cash"), [allTransactions])
  const bank1Totals = useMemo(() => calculateTotals(allTransactions, "bank1"), [allTransactions])
  const bank2Totals = useMemo(() => calculateTotals(allTransactions, "bank2"), [allTransactions])

  // Başlangıç bakiyeleri (gerçek uygulamada veritabanından gelmeli)
  const initialCashBalance = 7500
  const initialBank1Balance = 10000
  const initialBank2Balance = 5000

  const currentCashBalance = initialCashBalance + cashTotals.totalIn - cashTotals.totalOut
  const currentBank1Balance = initialBank1Balance + bank1Totals.totalIn - bank1Totals.totalOut
  const currentBank2Balance = initialBank2Balance + bank2Totals.totalIn - bank2Totals.totalOut

  const overallCurrentBalance = currentCashBalance + currentBank1Balance + currentBank2Balance

  const openNewTransactionDialog = (type: "cash-in" | "cash-out" | "card-in" | "card-out") => {
    setNewTransactionType(type)
    setNewTransactionPersonName("") // Reset
    setNewTransactionDetails("") // Reset
    setNewTransactionAmount("")
    setNewTransactionDate(new Date())
    setNewTransactionBankAccount(null) // Reset bank selection
    setIsNewTransactionDialogOpen(true)
  }

  const handleAddNewTransaction = () => {
    if (!newTransactionPersonName || !newTransactionAmount || !newTransactionDate) {
      alert("Lütfen 'İsim Soyisim', 'Tutar' ve 'Tarih' alanlarını doldurun.")
      return
    }
    if ((newTransactionType === "card-in" || newTransactionType === "card-out") && !newTransactionBankAccount) {
      alert("Lütfen banka hesabı seçin.")
      return
    }

    const newId = `TRX${Date.now().toString().slice(-6)}` // Basit bir ID oluşturma
    let accountType: "cash" | "bank1" | "bank2"
    if (newTransactionType?.includes("cash")) {
      accountType = "cash"
    } else if (newTransactionBankAccount === "Banka 1") {
      accountType = "bank1"
    } else {
      accountType = "bank2"
    }

    const newTransaction: Transaction = {
      id: newId,
      date: format(newTransactionDate, "yyyy-MM-dd"),
      personName: newTransactionPersonName,
      details: newTransactionDetails,
      amount: Number.parseFloat(newTransactionAmount),
      type: newTransactionType?.includes("in") ? "in" : "out",
      accountType: accountType,
    }

    setAllTransactions((prev) => [...prev, newTransaction])
    setIsNewTransactionDialogOpen(false)
    // Form alanlarını sıfırla
    setNewTransactionType(null)
    setNewTransactionPersonName("")
    setNewTransactionDetails("")
    setNewTransactionAmount("")
    setNewTransactionDate(new Date())
    setNewTransactionBankAccount(null)
  }

  // Seçilen filtreye göre işlemleri filtrele
  const filteredTransactions = useMemo(() => {
    if (selectedAccountFilter === "all") {
      return allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
    return allTransactions
      .filter((t) => t.accountType === selectedAccountFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [allTransactions, selectedAccountFilter])

  const filteredCashTransactions = allTransactions.filter((transaction) => {
    const matchesSearch = transaction.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || transaction.type === filterType
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Kasa verileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kasa Yönetimi</h1>
          <p className="text-gray-600 text-sm">Nakit ve banka hesaplarınızdaki giriş/çıkışları takip edin</p>
        </div>
        <Button onClick={() => openNewTransactionDialog("cash-in")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni Kasa Hareketi Ekle
        </Button>
      </div>

      {/* Yeniden Tasarlanmış Özet Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 flex-shrink-0">
        {/* Toplam Bakiye Kartı */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 col-span-full lg:col-span-1">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Bakiye</p>
              <p className="text-3xl font-bold text-blue-700">₺{overallCurrentBalance.toLocaleString()}</p>
            </div>
            <Wallet className="h-10 w-10 text-blue-500 opacity-70" />
          </CardContent>
        </Card>

        {/* Nakit Durumu Kartı */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Nakit Durumu</p>
              <Wallet className="h-6 w-6 text-blue-500 opacity-70" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-2">₺{currentCashBalance.toLocaleString()}</p>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="text-green-600">Giriş: ₺{cashTotals.totalIn.toLocaleString()}</span>
              <span className="text-red-600">Çıkış: ₺{cashTotals.totalOut.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Banka 1 Durumu Kartı */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Banka 1 Durumu</p>
              <Banknote className="h-6 w-6 text-green-500 opacity-70" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-2">₺{currentBank1Balance.toLocaleString()}</p>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="text-green-600">Giriş: ₺{bank1Totals.totalIn.toLocaleString()}</span>
              <span className="text-red-600">Çıkış: ₺{bank1Totals.totalOut.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Banka 2 Durumu Kartı */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Banka 2 Durumu</p>
              <Banknote className="h-6 w-6 text-purple-500 opacity-70" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-2">₺{currentBank2Balance.toLocaleString()}</p>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="text-green-600">Giriş: ₺{bank2Totals.totalIn.toLocaleString()}</span>
              <span className="text-red-600">Çıkış: ₺{bank2Totals.totalOut.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Subtract Cash and Card Buttons */}
      <div className="flex justify-end gap-2 mb-6 flex-shrink-0 flex-wrap">
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => openNewTransactionDialog("cash-in")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nakit Girişi
        </Button>
        <Button
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
          onClick={() => openNewTransactionDialog("cash-out")}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Nakit Çıkışı
        </Button>
        {/* Kart Girişi/Çıkışı Butonları */}
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => openNewTransactionDialog("card-in")}>
          <CreditCard className="mr-2 h-4 w-4" /> Kart Girişi
        </Button>
        <Button
          variant="outline"
          className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
          onClick={() => openNewTransactionDialog("card-out")}
        >
          <CreditCard className="mr-2 h-4 w-4" /> Kart Çıkışı
        </Button>
      </div>

      {/* Tek İşlem Tablosu */}
      <Card className="shadow-sm border-none flex-grow flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-800">Tüm Hareketler</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedAccountFilter === "all" ? "default" : "outline"}
                onClick={() => setSelectedAccountFilter("all")}
                className={selectedAccountFilter === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                Tümü
              </Button>
              <Button
                variant={selectedAccountFilter === "cash" ? "default" : "outline"}
                onClick={() => setSelectedAccountFilter("cash")}
                className={selectedAccountFilter === "cash" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                Nakit
              </Button>
              <Button
                variant={selectedAccountFilter === "bank1" ? "default" : "outline"}
                onClick={() => setSelectedAccountFilter("bank1")}
                className={selectedAccountFilter === "bank1" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                Banka 1
              </Button>
              <Button
                variant={selectedAccountFilter === "bank2" ? "default" : "outline"}
                onClick={() => setSelectedAccountFilter("bank2")}
                className={selectedAccountFilter === "bank2" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                Banka 2
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Açıklamaya göre ara..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Türe göre filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="in">Giriş</SelectItem>
                <SelectItem value="out">Çıkış</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>İsim&nbsp;Soyisim</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Hesap</TableHead>
                <TableHead className="text-right">Miktar</TableHead>
                <TableHead className="text-center">Tip</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCashTransactions.length > 0 ? (
                filteredCashTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.date}</TableCell>
                    <TableCell>{transaction.personName}</TableCell>
                    <TableCell>{transaction.details}</TableCell>
                    <TableCell>
                      {transaction.accountType === "cash"
                        ? "Nakit"
                        : transaction.accountType === "bank1"
                          ? "Banka 1"
                          : "Banka 2"}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${transaction.type === "in" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type === "in" ? "+" : "-"}₺{transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          transaction.type === "in"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {transaction.type === "in" ? "Giriş" : "Çıkış"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    Seçilen hesap için henüz bir hareket bulunmamaktadır.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Yeni İşlem Ekle Diyaloğu */}
      <Dialog open={isNewTransactionDialogOpen} onOpenChange={setIsNewTransactionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {newTransactionType === "cash-in" && "Nakit Girişi Ekle"}
              {newTransactionType === "cash-out" && "Nakit Çıkışı Ekle"}
              {newTransactionType === "card-in" && "Kart Girişi Ekle"}
              {newTransactionType === "card-out" && "Kart Çıkışı Ekle"}
            </DialogTitle>
            <DialogDescription>Lütfen işlem detaylarını girin.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* İsim Soyisim */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="personName" className="text-right">
                İsim Soyisim
              </Label>
              <Input
                id="personName"
                value={newTransactionPersonName}
                onChange={(e) => setNewTransactionPersonName(e.target.value)}
                className="col-span-3"
                placeholder="İlgili kişi/kurum adı"
              />
            </div>
            {/* Ek Açıklama */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="details" className="text-right">
                Ek Açıklama
              </Label>
              <Textarea
                id="details"
                value={newTransactionDetails}
                onChange={(e) => setNewTransactionDetails(e.target.value)}
                className="col-span-3"
                placeholder="İşlemle ilgili detaylar (isteğe bağlı)"
              />
            </div>
            {/* Tutar */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Tutar
              </Label>
              <Input
                id="amount"
                type="number"
                value={newTransactionAmount}
                onChange={(e) => setNewTransactionAmount(e.target.value)}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
            {/* Tarih */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Tarih
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`col-span-3 justify-start text-left font-normal ${
                      !newTransactionDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTransactionDate ? format(newTransactionDate, "dd/MM/yyyy", { locale: tr }) : "Tarih Seç"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newTransactionDate}
                    onSelect={setNewTransactionDate}
                    initialFocus
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Banka Hesabı Seçimi (Sadece Kart İşlemleri İçin) */}
            {(newTransactionType === "card-in" || newTransactionType === "card-out") && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bankAccount" className="text-right">
                  Banka Hesabı
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="col-span-3 justify-between bg-transparent">
                      {newTransactionBankAccount || "Banka Seçin"} <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                    <DropdownMenuItem onClick={() => setNewTransactionBankAccount("Banka 1")}>Banka 1</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNewTransactionBankAccount("Banka 2")}>Banka 2</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTransactionDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleAddNewTransaction}
              disabled={
                !newTransactionPersonName ||
                !newTransactionAmount ||
                !newTransactionDate ||
                ((newTransactionType === "card-in" || newTransactionType === "card-out") && !newTransactionBankAccount)
              }
            >
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
