"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Filter, Trash2, Pencil } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { tr } from "date-fns/locale"
import { isWithinInterval, parseISO } from "date-fns"
import { DateRange } from "react-day-picker"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

type OdemeYontemi = 'nakit' | 'banka1' | 'banka2';

interface Expense {
  id: number
  tarih: string
  aciklama: string
  kategori: string
  tutar: number
  odeme_yontemi: OdemeYontemi
}

function GiderlerPage() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Expense[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [newExpenseDescription, setNewExpenseDescription] = useState("")
  const [newExpenseAmount, setNewExpenseAmount] = useState("")
  const [newExpenseDate, setNewExpenseDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [newExpenseCategory, setNewExpenseCategory] = useState<string>("")
  const [newExpenseOdemeYontemi, setNewExpenseOdemeYontemi] = useState<OdemeYontemi>('nakit')

  // Fetch expenses on component mount
  useEffect(() => {
    const fetchExpenses = async () => {
      console.log('Starting to fetch expenses...');
      try {
        setLoading(true);
        
        console.log('Attempting to fetch data from giderler table...');
        const { data, error } = await supabase
          .from('giderler')
          .select('*')
          .order('tarih', { ascending: false });
          
        console.log('Supabase response:', { data, error });

        if (error) {
          console.error('Supabase error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          toast.error(`Veri yüklenirken hata: ${error.message}`);
          return;
        }
        
        console.log(`Successfully fetched ${data?.length || 0} expense records`);
        setTransactions(data || []);
        
      } catch (error: any) {
        console.error("Detailed error fetching expenses:", error);
        toast.error('Giderler yüklenirken beklenmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpenses();
  }, []);

  const categories = ["Kira", "Personel Maaşı", "Ofis Giderleri", "Pazarlama", "Diğer"]

  // Kategori renklerini belirle
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Kira':
        return 'bg-red-100 text-red-800';
      case 'Personel Maaşı':
        return 'bg-purple-100 text-purple-800';
      case 'Ofis Giderleri':
        return 'bg-orange-100 text-orange-800';
      case 'Pazarlama':
        return 'bg-pink-100 text-pink-800';
      case 'Diğer':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesSearch =
        searchTerm === "" ||
        transaction.aciklama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.kategori.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || transaction.kategori === filterCategory;
      const matchesDate = dateRange
        ? isWithinInterval(parseISO(transaction.tarih), {
            start: dateRange.from || new Date(0),
            end: dateRange.to || new Date(),
          })
        : true;

      return matchesSearch && matchesCategory && matchesDate;
    });

    return filtered.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
  }, [transactions, searchTerm, filterCategory, dateRange]);


  // Kategori filtresi değiştiğinde formda da güncelle
  useEffect(() => {
    if (filterCategory !== "all") {
      setNewExpenseCategory(filterCategory)
    } else {
      setNewExpenseCategory("")
    }
  }, [filterCategory])

  const handleAddExpense = async () => {
    if (!newExpenseDescription || !newExpenseAmount || !newExpenseDate || !newExpenseCategory) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Format the date properly for PostgreSQL
      const formattedDate = format(new Date(newExpenseDate), 'yyyy-MM-dd');
      
      const expenseData = {
        tarih: formattedDate,
        aciklama: newExpenseDescription,
        kategori: newExpenseCategory,
        tutar: parseFloat(newExpenseAmount),
        odeme_yontemi: newExpenseOdemeYontemi
      };
      
      console.log('Sending data to Supabase:', expenseData);
      
      if (editingExpense) {
        // Update existing expense
        const { data: updatedExpense, error } = await supabase
          .from('giderler')
          .update(expenseData)
          .eq('id', editingExpense.id)
          .select()
          .single();
          
        if (error) {
          console.error('Update error:', error);
          toast.error(`Güncelleme hatası: ${error.message}`);
          return;
        }
        
        // Gider güncellendikten sonra listeyi yeniden sırala
        setTransactions(prev => {
          const updatedList = prev.map(t => 
            t.id === editingExpense.id ? updatedExpense : t
          );
          return updatedList.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
        });

        setEditingExpense(null);
        toast.success('Gider başarıyla güncellendi.');
        
      } else {
        // Add new expense
        const { data: newExpense, error } = await supabase
          .from('giderler')
          .insert([expenseData])
          .select()
          .single();
          
        if (error) {
          console.error('Insert error:', error);
          toast.error(`Ekleme hatası: ${error.message}`);
          return;
        }
        
        // Yeni gider eklendikten sonra listeyi yeniden sırala
        setTransactions(prev => {
          const updatedTransactions = [newExpense, ...prev];
          return updatedTransactions.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
        });

        toast.success('Yeni gider başarıyla eklendi.');
      }
      
      // Reset form
      setIsDialogOpen(false)
      setNewExpenseDescription("")
      setNewExpenseAmount("")
      setNewExpenseDate(format(new Date(), "yyyy-MM-dd"))
      setNewExpenseOdemeYontemi('nakit')
      setNewExpenseCategory(filterCategory !== "all" ? filterCategory : "")
      
    } catch (error: any) {
      console.error("Error saving expense:", error)
      toast.error('Gider kaydedilirken beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false)
    }
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpenseDescription(expense.aciklama);
    setNewExpenseAmount(expense.tutar.toString());
    setNewExpenseDate(expense.tarih);
    setNewExpenseCategory(expense.kategori);
    setNewExpenseOdemeYontemi(expense.odeme_yontemi);
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = (expense: Expense) => {
    setEditingExpense(expense)
    setIsDeleteDialogOpen(true)
  }
  
  const confirmDeleteExpense = async () => {
    if (!editingExpense) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('giderler')
        .delete()
        .eq('id', editingExpense.id);
        
      if (error) {
        console.error('Delete error:', error);
        toast.error(`Silme hatası: ${error.message}`);
        return;
      }
      
      setTransactions(transactions.filter(t => t.id !== editingExpense.id));
      setIsDeleteDialogOpen(false);
      setEditingExpense(null);
      toast.success('Gider başarıyla silindi.');
      
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast.error('Gider silinirken beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Gider verileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Kartlar için hesaplamalar
  const toplamGider = filteredTransactions.reduce((sum, t) => sum + t.tutar, 0)
  const islemSayisi = transactions.length
  // En büyük gider kategorisini bul
  const giderKategoriToplamlari = filteredTransactions.reduce((acc, t) => {
    acc[t.kategori] = (acc[t.kategori] || 0) + t.tutar
    return acc
  }, {} as Record<string, number>)
  const enBuyukGiderKategori = Object.entries(giderKategoriToplamlari).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Giderler</h1>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
                📉
              </span>
              <CardTitle className="text-blue-700 text-base font-semibold">En Büyük Gider Kategorisi</CardTitle>
            </div>
            <div className="text-base font-semibold text-blue-700">{enBuyukGiderKategori ? enBuyukGiderKategori[0] : '-'}</div>
            <div className="text-xl font-bold text-blue-700">{enBuyukGiderKategori ? formatCurrency(enBuyukGiderKategori[1]) : '-'}</div>
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

      {/* Yeni Gider Ekle Butonu */}
      <div className="flex justify-end mb-4 flex-shrink-0">
        <Button className="bg-red-600 hover:bg-red-700" onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Yeni Gider Ekle
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setEditingExpense(null)
            setNewExpenseDescription("")
            setNewExpenseAmount("")
            setNewExpenseDate(format(new Date(), "yyyy-MM-dd"))
            setNewExpenseCategory(filterCategory !== "all" ? filterCategory : "")
          }
          setIsDialogOpen(open)
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Gider Düzenle' : 'Yeni Gider Ekle'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Açıklama</Label>
                <Textarea
                  id="description"
                  value={newExpenseDescription}
                  onChange={(e) => setNewExpenseDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Gider açıklaması"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Tutar</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  className="col-span-3"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Tarih</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpenseDate}
                  onChange={(e) => setNewExpenseDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Kategori</Label>
                <Select value={newExpenseCategory} onValueChange={setNewExpenseCategory}>
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="odemeYontemi" className="text-right">Ödeme Yöntemi</Label>
                <Select 
                  value={newExpenseOdemeYontemi} 
                  onValueChange={(value: OdemeYontemi) => setNewExpenseOdemeYontemi(value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Ödeme yöntemi seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nakit">Nakit</SelectItem>
                    <SelectItem value="banka1">Banka 1</SelectItem>
                    <SelectItem value="banka2">Banka 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button 
                  type="button" 
                  onClick={handleAddExpense}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Kaydediliyor...' : (editingExpense ? 'Güncelle' : 'Kaydet')}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Silme Onay Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gider Kaydını Sil</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Bu gider kaydını silmek istediğinizden emin misiniz?</p>
              {editingExpense && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{editingExpense.aciklama}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(editingExpense.tarih), 'dd.MM.yyyy')} • {editingExpense.kategori} • {formatCurrency(editingExpense.tutar)}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                İptal
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteExpense}
                className="bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Siliniyor...' : 'Sil'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 flex-shrink-0">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Giderlerde ara..."
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

      {/* Recent Expenses Table */}
      <Card className="shadow-sm border-none flex-grow flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-xl font-bold text-gray-800">Gider Hareketleri</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Tarih</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="w-[150px]">Kategori</TableHead>
                <TableHead className="w-[120px]">Ödeme Yöntemi</TableHead>
                <TableHead className="text-right w-[120px]">Tutar</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="group">
                    <TableCell className="font-medium">{format(new Date(transaction.tarih), 'dd.MM.yyyy')}</TableCell>
                    <TableCell>{transaction.aciklama}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(transaction.kategori)}`}>
                        {transaction.kategori}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        {transaction.odeme_yontemi === 'nakit' ? 'Nakit' : 
                         transaction.odeme_yontemi === 'banka1' ? 'Banka 1' : 'Banka 2'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">{formatCurrency(transaction.tutar)}</TableCell>
                    <TableCell className="w-20 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditExpense(transaction)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(transaction)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Gösterilecek gider hareketi bulunamadı.
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

export default function Giderler() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <GiderlerPage />
      </main>
    </div>
  )
}