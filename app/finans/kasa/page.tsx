"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  PlusCircle, 
  Wallet, 
  CreditCard, 
  Banknote, 
  ChevronDown, 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  ArrowRightLeft,
  Trash2
} from "lucide-react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO, isWithinInterval } from "date-fns"
import { tr } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRange } from "react-day-picker"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

type OdemeYontemi = 'nakit' | 'banka1' | 'banka2';

interface Transaction {
  id: number
  tarih: string
  aciklama: string
  kategori: string
  tutar: number
  odeme_yontemi: OdemeYontemi
  type: "in" | "out"
  is_transfer?: boolean
  transfer_id?: string
}

function KasaPage() {
  const [loading, setLoading] = useState(true)
  const [isNewTransactionDialogOpen, setIsNewTransactionDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [newTransactionType, setNewTransactionType] = useState<"cash-in" | "cash-out" | "card-in" | "card-out" | null>(null)
  const [newTransactionDetails, setNewTransactionDetails] = useState("")
  const [newTransactionAmount, setNewTransactionAmount] = useState("")
  const [newTransactionDate, setNewTransactionDate] = useState<Date | undefined>(new Date())
  const [newTransactionBankAccount, setNewTransactionBankAccount] = useState<"banka1" | "banka2" | null>(null)
  const [newTransactionCategory, setNewTransactionCategory] = useState<string>("")  
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  
  // Transfer state
  const [transferFrom, setTransferFrom] = useState<OdemeYontemi>('nakit')
  const [transferTo, setTransferTo] = useState<OdemeYontemi>('banka1')
  const [transferAmount, setTransferAmount] = useState("")
  const [transferDate, setTransferDate] = useState<Date | undefined>(new Date())
  const [transferDescription, setTransferDescription] = useState("")
  
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [initialBalances, setInitialBalances] = useState({
    nakit: 0,
    banka1: 0,
    banka2: 0
  })
  
  // Tab and filter states
  type TabType = 'all' | 'transfers'
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<"all" | OdemeYontemi>("all")
  const [searchTerm, setSearchTerm] = useState("")
  type FilterType = "all" | "in" | "out";
  const [filterType, setFilterType] = useState<FilterType>("all")

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const { data: settings, error: settingsError } = await supabase
          .from('settings')
          .select('*')
          .eq('key', 'initial_balances')
          .single()
          
        if (settingsError) {
          console.warn('Could not fetch initial balances:', settingsError.message)
          setInitialBalances({ nakit: 0, banka1: 0, banka2: 0 })
        } else if (settings) {
          const balances = settings.value || {};
          setInitialBalances({
            nakit: Number(balances.nakit) || 0,
            banka1: Number(balances.banka1) || 0,
            banka2: Number(balances.banka2) || 0
          })
        }
        
        const { data: incomesData, error: incomesError } = await supabase.from('gelirler').select('*')
        if (incomesError) throw incomesError
        
        const { data: expensesData, error: expensesError } = await supabase.from('giderler').select('*')
        if (expensesError) throw expensesError
        
        const processedIncomes = (incomesData || []).map(income => ({
          ...income,
          type: 'in' as const,
          tarih: income.tarih ? format(new Date(income.tarih), 'yyyy-MM-dd') : ''
        }))
        
        const processedExpenses = (expensesData || []).map(expense => ({
          ...expense,
          type: 'out' as const,
          tarih: expense.tarih ? format(new Date(expense.tarih), 'yyyy-MM-dd') : ''
        }))
        
        setAllTransactions([...processedIncomes, ...processedExpenses])
        
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Veriler yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  type AccountTotals = {
    [key in OdemeYontemi]: { in: number; out: number; };
  };

  const calculateAccountTotals = useMemo<AccountTotals>(() => {
    const totals: AccountTotals = {
      nakit: { in: 0, out: 0 },
      banka1: { in: 0, out: 0 },
      banka2: { in: 0, out: 0 }
    }
    
    allTransactions.forEach(transaction => {
      if (transaction.odeme_yontemi in totals) {
        if (transaction.type === 'in') {
          totals[transaction.odeme_yontemi].in += transaction.tutar;
        } else {
          totals[transaction.odeme_yontemi].out += transaction.tutar;
        }
      }
    })
    
    return totals
  }, [allTransactions])

  const bank1Totals = useMemo(() => ({
    totalIn: calculateAccountTotals.banka1.in,
    totalOut: calculateAccountTotals.banka1.out
  }), [calculateAccountTotals]);

  const bank2Totals = useMemo(() => ({
    totalIn: calculateAccountTotals.banka2.in,
    totalOut: calculateAccountTotals.banka2.out
  }), [calculateAccountTotals]);

  const currentBalances = useMemo(() => ({
    nakit: initialBalances.nakit + calculateAccountTotals.nakit.in - calculateAccountTotals.nakit.out,
    banka1: initialBalances.banka1 + calculateAccountTotals.banka1.in - calculateAccountTotals.banka1.out,
    banka2: initialBalances.banka2 + calculateAccountTotals.banka2.in - calculateAccountTotals.banka2.out
  }), [initialBalances, calculateAccountTotals])
  
  const overallCurrentBalance = Object.values(currentBalances).reduce((sum, balance) => sum + balance, 0)

  const openNewTransactionDialog = (type: "cash-in" | "cash-out" | "card-in" | "card-out") => {
    setNewTransactionType(type)
    setNewTransactionDetails("")
    setNewTransactionAmount("")
    setNewTransactionDate(new Date())
    setNewTransactionBankAccount(null)
    setNewTransactionCategory("")
    setIsNewTransactionDialogOpen(true)
  }
  
  const openTransferDialog = () => {
    setTransferFrom('nakit')
    setTransferTo('banka1')
    setTransferAmount("")
    setTransferDate(new Date())
    setTransferDescription("")
    setIsTransferDialogOpen(true)
  }

  const handleAddNewTransaction = async () => {
    if (!newTransactionAmount || !newTransactionDate) {
      toast.error("Lütfen gerekli alanları doldurun.")
      return
    }
    if ((newTransactionType === "card-in" || newTransactionType === "card-out") && !newTransactionBankAccount) {
      toast.error("Lütfen banka hesabı seçin.")
      return
    }

    try {
      setLoading(true)
      
      const paymentMethod = newTransactionType?.includes("cash") ? 'nakit' : (newTransactionBankAccount as OdemeYontemi)
      const transactionType = newTransactionType?.includes("in") ? 'in' as const : 'out' as const
      
      const transactionData = {
        tarih: format(newTransactionDate, "yyyy-MM-dd"),
        aciklama: newTransactionDetails,
        kategori: newTransactionCategory || 'Diğer',
        tutar: parseFloat(newTransactionAmount),
        odeme_yontemi: paymentMethod,
        is_transfer: false
      }
      
      const table = transactionType === 'in' ? 'gelirler' : 'giderler'
      const { data, error } = await supabase
        .from(table)
        .insert([transactionData])
        .select()
        
      if (error) throw error
      
      const newTransaction: Transaction = {
        id: data?.[0]?.id || Date.now(),
        ...transactionData,
        type: transactionType,
        kategori: '',
      }
      
      setAllTransactions(prev => [...prev, newTransaction])
      
      toast.success("İşlem başarıyla eklendi.")
      setIsNewTransactionDialogOpen(false)
      
      setNewTransactionType(null)
      setNewTransactionDetails("")
      setNewTransactionAmount("")
      setNewTransactionDate(new Date())
      setNewTransactionBankAccount(null)
      
    } catch (error) {
      console.error('Error adding transaction:', error)
      toast.error("İşlem eklenirken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }
  
  const transactionsToDisplay = useMemo(() => {
      if (activeTab === 'transfers') {
          return allTransactions.filter(t => t.is_transfer);
      }
      return allTransactions;
  }, [activeTab, allTransactions]);


  const filteredTransactions = useMemo(() => {
    let filtered = [...transactionsToDisplay]
    
    if (selectedAccountFilter !== "all") {
      filtered = filtered.filter(t => t.odeme_yontemi === selectedAccountFilter)
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(transaction => 
        transaction.aciklama?.toLowerCase().includes(searchLower) ||
        transaction.kategori?.toLowerCase().includes(searchLower)
      )
    }
    
    if (filterType !== "all") {
      filtered = filtered.filter(transaction => transaction.type === filterType)
    }
    
    if (dateRange?.from || dateRange?.to) {
      filtered = filtered.filter(transaction => {
        if (!transaction.tarih) return false
        const transactionDate = parseISO(transaction.tarih)
        if (dateRange?.from && !dateRange?.to) return transactionDate >= dateRange.from
        if (!dateRange?.from && dateRange?.to) return transactionDate <= dateRange.to
        if (dateRange?.from && dateRange?.to) return isWithinInterval(transactionDate, { start: dateRange.from, end: dateRange.to })
        return true
      })
    }
    
    return filtered.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime())
  }, [transactionsToDisplay, selectedAccountFilter, searchTerm, filterType, dateRange])

  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (!window.confirm('Bu işlemi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      setLoading(true);
      
      // Determine which table to delete from based on transaction type
      const table = transaction.type === 'in' ? 'gelirler' : 'giderler';
      
      // Delete the transaction from the appropriate table
      // Using a direct query with double quotes to ensure case sensitivity
      const { error } = await supabase.rpc('delete_transaction', {
        p_table_name: table,
        p_id: transaction.id
      });
      
      if (error) throw error;
      
      // If it's a transfer, also delete the corresponding transfer record
      if (transaction.is_transfer && transaction.transfer_id) {
        const otherTable = table === 'gelirler' ? 'giderler' : 'gelirler';
        await supabase
          .from(otherTable)
          .delete()
          .eq('transfer_id', transaction.transfer_id);
      }
      
      // Update the transactions list
      setAllTransactions(prev => 
        prev.filter(t => t.id !== transaction.id && 
          !(transaction.is_transfer && t.transfer_id === transaction.transfer_id && t.id !== transaction.id))
      );
      
      toast.success("İşlem başarıyla silindi.");
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error("İşlem silinirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || !transferDate) {
      toast.error("Lütfen tutar ve tarih alanlarını doldurun.")
      return
    }
    if (transferFrom === transferTo) {
      toast.error("Aynı hesaplar arasında aktarım yapılamaz.")
      return
    }
    const amount = parseFloat(transferAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Lütfen geçerli bir tutar girin.")
      return
    }
    if (currentBalances[transferFrom] < amount) {
      toast.error(`Yetersiz bakiye. ${transferFrom === 'nakit' ? 'Nakit' : transferFrom === 'banka1' ? 'Banka 1' : 'Banka 2'} hesabında yeterli bakiye bulunmamaktadır.`)
      return
    }
    
    try {
      setLoading(true)
      
      const transactionDate = format(transferDate, "yyyy-MM-dd")
      const transferId = crypto.randomUUID()
      
      const fromExpenseData = {
        tarih: transactionDate,
        aciklama: transferDescription || `Aktarım: ${transferFrom} → ${transferTo}`,
        tutar: amount,
        odeme_yontemi: transferFrom,
        kategori: 'Hesap Aktarımı',
        is_transfer: true,
        transfer_id: transferId
      }
      
      const toIncomeData = {
        tarih: transactionDate,
        aciklama: transferDescription || `Aktarım: ${transferFrom} → ${transferTo}`,
        tutar: amount,
        odeme_yontemi: transferTo,
        kategori: 'Hesap Aktarımı',
        is_transfer: true,
        transfer_id: transferId
      }
      
      const { data: expenseData, error: expenseError } = await supabase.from('giderler').insert([fromExpenseData]).select()
      if (expenseError) throw expenseError
      
      const { data: incomeData, error: incomeError } = await supabase.from('gelirler').insert([toIncomeData]).select()
      if (incomeError) throw incomeError
      
      const newExpense: Transaction = {
        id: expenseData?.[0]?.id,
        ...fromExpenseData,
        type: 'out',
        kategori: 'Hesap Aktarımı',
      }
      
      const newIncome: Transaction = {
        id: incomeData?.[0]?.id,
        ...toIncomeData,
        type: 'in',
        kategori: 'Hesap Aktarımı',
      }
      
      setAllTransactions(prev => [...prev, newExpense, newIncome])
      
      toast.success("Aktarım başarıyla tamamlandı.")
      setIsTransferDialogOpen(false)
      setActiveTab('transfers')
      
      setTransferAmount("")
      setTransferDescription("")
      setTransferDate(new Date())
      
    } catch (error) {
      console.error('Error processing transfer:', error)
      toast.error("Aktarım sırasında bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

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
    <div className="h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kasa Yönetimi</h1>
            <p className="text-gray-600 text-sm">Nakit ve banka hesaplarınızdaki giriş/çıkışları takip edin</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2" onClick={openTransferDialog}>
              <ArrowRightLeft className="h-4 w-4" />
              Aktarım Yap
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 flex-shrink-0">
          <Card className="shadow-lg rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-0 col-span-full lg:col-span-1">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-lg">💼</span>
                <span className="text-blue-700 text-base font-semibold">Toplam Bakiye</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">₺{overallCurrentBalance.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-0">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-200 text-lg">💵</span>
                <span className="text-green-700 text-base font-semibold">Nakit Durumu</span>
              </div>
              <div className="text-xl font-bold text-gray-800 mb-1">₺{currentBalances.nakit.toLocaleString()}</div>
              <div className="flex justify-between w-full text-xs text-gray-500">
                <span className="text-green-600">Giriş: ₺{calculateAccountTotals.nakit.in.toLocaleString()}</span>
                <span className="text-red-600">Çıkış: ₺{calculateAccountTotals.nakit.out.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border-0">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-200 text-lg">🏦</span>
                <span className="text-purple-700 text-base font-semibold">Banka 1 Durumu</span>
              </div>
              <div className="text-xl font-bold text-gray-800 mb-1">₺{currentBalances.banka1.toLocaleString()}</div>
              <div className="flex justify-between w-full text-xs text-gray-500">
                <span className="text-green-600">Giriş: ₺{bank1Totals.totalIn.toLocaleString()}</span>
                <span className="text-red-600">Çıkış: ₺{bank1Totals.totalOut.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 border-0">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-200 text-lg">🏦</span>
                <span className="text-yellow-700 text-base font-semibold">Banka 2 Durumu</span>
              </div>
              <div className="text-xl font-bold text-gray-800 mb-1">₺{currentBalances.banka2.toLocaleString()}</div>
              <div className="flex justify-between w-full text-xs text-gray-500">
                <span className="text-green-600">Giriş: ₺{bank2Totals.totalIn.toLocaleString()}</span>
                <span className="text-red-600">Çıkış: ₺{bank2Totals.totalOut.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mb-6 flex-shrink-0 flex-wrap">
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => openNewTransactionDialog("cash-in")}> 
            <span className="mr-2 text-xl font-bold">+</span> Nakit Girişi
          </Button>
          <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent" onClick={() => openNewTransactionDialog("cash-out")}>
            <span className="mr-2 text-xl font-bold">-</span> Nakit Çıkışı
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => openNewTransactionDialog("card-in")}> 
            <span className="mr-2 text-xl font-bold">+</span> Kart Girişi
          </Button>
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent" onClick={() => openNewTransactionDialog("card-out")}>
            <span className="mr-2 text-xl font-bold">-</span> Kart Çıkışı
          </Button>
        </div>

        <Card className="shadow-sm border-none flex-grow flex flex-col">
          <CardHeader className="border-b">
             <div className="flex border-b">
                <button onClick={() => setActiveTab('all')} className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    Tüm İşlemler
                </button>
                <button onClick={() => setActiveTab('transfers')} className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${activeTab === 'transfers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    Tüm Aktarımlar
                </button>
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto p-4">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input placeholder="Açıklamaya göre ara..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-[280px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from && dateRange?.to ? `${format(dateRange.from, "dd.MM.yyyy")} - ${format(dateRange.to, "dd.MM.yyyy")}` : "Tarih Aralığı Seç"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar initialFocus mode="range" selected={dateRange} onSelect={(range) => setDateRange(range)} numberOfMonths={2} locale={tr} />
                </PopoverContent>
              </Popover>
              <Select value={selectedAccountFilter} onValueChange={(value) => setSelectedAccountFilter(value as "all" | OdemeYontemi)}>
                <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Hesap Filtrele" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Hesaplar</SelectItem>
                  <SelectItem value="nakit">Nakit</SelectItem>
                  <SelectItem value="banka1">Banka 1</SelectItem>
                  <SelectItem value="banka2">Banka 2</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={(value) => setFilterType(value as FilterType)}>
                <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Tüm İşlemler" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm İşlemler</SelectItem>
                  <SelectItem value="in">Sadece Girişler</SelectItem>
                  <SelectItem value="out">Sadece Çıkışlar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Hesap</TableHead>
                    <TableHead className="text-right">Miktar</TableHead>
                    <TableHead className="text-center">Tip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                    <TableRow key={`${transaction.id}-${transaction.type}`}>
                      <TableCell>{format(parseISO(transaction.tarih), 'dd.MM.yyyy')}</TableCell>
                      <TableCell>{transaction.aciklama}</TableCell>
                      <TableCell>{transaction.odeme_yontemi === "nakit" ? "Nakit" : transaction.odeme_yontemi === "banka1" ? "Banka 1" : "Banka 2"}</TableCell>
                      <TableCell className={`text-right font-semibold ${transaction.type === "in" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "in" ? "+" : "-"}₺{transaction.tutar.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={transaction.type === "in" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
                          {transaction.type === "in" ? "Giriş" : "Çıkış"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeleteTransaction(transaction)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        Filtre kriterlerine uygun işlem bulunamadı.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Dialog */}
        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Hesap Arası Aktarım</DialogTitle>
              <DialogDescription>Hesaplar arasında para transferi yapın.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transferFrom" className="text-right">Gönderen</Label>
                <Select value={transferFrom} onValueChange={(value) => setTransferFrom(value as OdemeYontemi)}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Hesap seçin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nakit">Nakit</SelectItem>
                    <SelectItem value="banka1">Banka 1</SelectItem>
                    <SelectItem value="banka2">Banka 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transferTo" className="text-right">Alıcı</Label>
                <Select value={transferTo} onValueChange={(value) => setTransferTo(value as OdemeYontemi)}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Hesap seçin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nakit">Nakit</SelectItem>
                    <SelectItem value="banka1">Banka 1</SelectItem>
                    <SelectItem value="banka2">Banka 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transferAmount" className="text-right">Tutar</Label>
                <Input id="transferAmount" type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="col-span-3" placeholder="0.00" min="0.01" step="0.01" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transferDate" className="text-right">Tarih</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={`col-span-3 justify-start text-left font-normal ${!transferDate ? 'text-muted-foreground' : ''}`}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {transferDate ? format(transferDate, 'PPP', { locale: tr }) : 'Tarih seçin'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={transferDate} onSelect={setTransferDate} initialFocus locale={tr} /></PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transferDescription" className="text-right">Açıklama</Label>
                <Input id="transferDescription" value={transferDescription} onChange={(e) => setTransferDescription(e.target.value)} className="col-span-3" placeholder="Açıklama (isteğe bağlı)" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>İptal</Button>
              <Button onClick={handleTransfer} disabled={!transferAmount || !transferDate || transferFrom === transferTo}>Aktarım Yap</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Kategori</Label>
                <Select value={newTransactionCategory} onValueChange={setNewTransactionCategory}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Danışmanlık Ücreti">Danışmanlık Ücreti</SelectItem>
                    <SelectItem value="Eğitim">Eğitim</SelectItem>
                    <SelectItem value="Seminer">Seminer</SelectItem>
                    <SelectItem value="Online Danışmanlık">Online Danışmanlık</SelectItem>
                    <SelectItem value="Diğer">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="details" className="text-right">Açıklama</Label>
                <Textarea 
                  id="details" 
                  value={newTransactionDetails} 
                  onChange={(e) => setNewTransactionDetails(e.target.value)} 
                  className="col-span-3" 
                  placeholder="İşlem açıklaması giriniz" 
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={`col-span-3 justify-start text-left font-normal ${!newTransactionDate && "text-muted-foreground"}`}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTransactionDate ? format(newTransactionDate, "dd/MM/yyyy", { locale: tr }) : "Tarih Seç"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newTransactionDate} onSelect={setNewTransactionDate} initialFocus locale={tr} /></PopoverContent>
                </Popover>
              </div>
              {(newTransactionType === "card-in" || newTransactionType === "card-out") && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bankAccount" className="text-right">Banka Hesabı</Label>
                  <Select value={newTransactionBankAccount || ""} onValueChange={(value) => setNewTransactionBankAccount(value as "banka1" | "banka2")}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Banka Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="banka1">Banka 1</SelectItem>
                        <SelectItem value="banka2">Banka 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTransactionDialogOpen(false)}>İptal</Button>
              <Button onClick={handleAddNewTransaction} disabled={!newTransactionAmount || !newTransactionDate || ((newTransactionType === "card-in" || newTransactionType === "card-out") && !newTransactionBankAccount)}>
                Ekle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function Kasa() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <KasaPage />
      </main>
    </div>
  )
}

export { KasaPage }
