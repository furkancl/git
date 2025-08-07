"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { PlusCircle, Search, Filter, Trash2, Pencil } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { isWithinInterval, parseISO } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"

type OdemeYontemi = 'nakit' | 'banka1' | 'banka2';

interface Income {
  id: number
  tarih: string
  aciklama: string
  kategori: string
  tutar: number
  odeme_yontemi: OdemeYontemi
}

type TabType = 'gelirler' | 'borclar';

function GelirlerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('gelirler');
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Income[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [newIncomeDescription, setNewIncomeDescription] = useState("")
  const [newIncomeAmount, setNewIncomeAmount] = useState("")
  const [newIncomeDate, setNewIncomeDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [newIncomeCategory, setNewIncomeCategory] = useState<string>("")
  const [newIncomeOdemeYontemi, setNewIncomeOdemeYontemi] = useState<OdemeYontemi>('nakit')
  
  // Fetch incomes on component mount
  useEffect(() => {
    const fetchIncomes = async () => {
      console.log('Starting to fetch incomes...');
      try {
        setLoading(true);
        
        console.log('Attempting to fetch data from Gelirler table...');
        const { data, error } = await supabase
          .from('gelirler')
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
        
        console.log(`Successfully fetched ${data?.length || 0} income records`);
        setTransactions(data || []);
        
      } catch (error: any) {
        console.error("Detailed error fetching incomes:", error);
        toast.error('Gelirler yüklenirken beklenmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchIncomes();
  }, []);

  // Kategoriler
  const categories = [
    'Randevu Ücreti',
    'Danışmanlık',
    'Eğitim',
    'Diğer'
  ]

  // Borç kategorileri
  const debtCategories = [
    'Kredi Kartı',
    'Kira',
    'Fatura',
    'Diğer Borçlar'
  ]

  // Kategori renklerini belirle
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Randevu Ücreti':
        return 'bg-blue-100 text-blue-800';
      case 'Danışmanlık':
        return 'bg-green-100 text-green-800';
      case 'Eğitim':
        return 'bg-yellow-100 text-yellow-800';
      case 'Diğer':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // If we're on the 'borclar' tab but this isn't a debt transaction, filter it out
      if (activeTab === 'borclar' && (!transaction.kategori || !transaction.kategori.includes('Borç'))) {
        return false;
      }
      // If we're on the 'gelirler' tab but this is a debt transaction, filter it out
      if (activeTab === 'gelirler' && transaction.kategori && transaction.kategori.includes('Borç')) {
        return false;
      }

      const matchesSearch =
        searchTerm === "" ||
        transaction.aciklama.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || transaction.kategori === filterCategory;
      const matchesDate = dateRange
        ? isWithinInterval(parseISO(transaction.tarih), {
            start: dateRange.from || new Date(0),
            end: dateRange.to || new Date(),
          })
        : true;

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [transactions, searchTerm, filterCategory, dateRange, activeTab]);

  // Kategori filtresi değiştiğinde formda da güncelle
  useEffect(() => {
    if (filterCategory !== "all") {
      setNewIncomeCategory(filterCategory)
    } else {
      setNewIncomeCategory("")
    }
  }, [filterCategory])

  // Aktif tab değiştiğinde kategori listesini güncelle
  useEffect(() => {
    // Reset filter when switching tabs
    setFilterCategory("all");
  }, [activeTab]);

  const handleAddIncome = async () => {
    if (!newIncomeDescription || !newIncomeAmount || !newIncomeDate || !newIncomeCategory) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Format the date properly for PostgreSQL
      const formattedDate = format(new Date(newIncomeDate), 'yyyy-MM-dd');
      
      const incomeData = {
        tarih: formattedDate,
        aciklama: newIncomeDescription,
        kategori: newIncomeCategory,
        tutar: parseFloat(newIncomeAmount),
        odeme_yontemi: newIncomeOdemeYontemi
      };
      
      console.log('Sending data to Supabase:', incomeData);
      
      if (editingIncome) {
        // Update existing income
        const { data: updatedIncome, error } = await supabase
          .from('gelirler')
          .update(incomeData)
          .eq('id', editingIncome.id)
          .select()
          .single();
          
        if (error) {
          console.error('Update error:', error);
          toast.error(`Güncelleme hatası: ${error.message}`);
          return;
        }
        
        setTransactions(transactions.map(t => 
          t.id === editingIncome.id ? updatedIncome : t
        ));
        setEditingIncome(null);
        toast.success('Gelir başarıyla güncellendi.');
        
      } else {
        // Add new income
        const { data: newIncome, error } = await supabase
          .from('gelirler')
          .insert([incomeData])
          .select()
          .single();
          
        if (error) {
          console.error('Insert error:', error);
          toast.error(`Ekleme hatası: ${error.message}`);
          return;
        }
        
        setTransactions(prev => [newIncome, ...prev]);
        toast.success('Yeni gelir başarıyla eklendi.');
      }
      
      // Reset form
      setIsDialogOpen(false)
      setNewIncomeDescription("")
      setNewIncomeAmount("")
      setNewIncomeDate(format(new Date(), "yyyy-MM-dd"))
      setNewIncomeCategory(filterCategory !== "all" ? filterCategory : "")
      setNewIncomeOdemeYontemi('nakit')
      
    } catch (error: any) {
      console.error("Error saving income:", error)
      toast.error('Gelir kaydedilirken beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false)
    }
  }
  
  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setNewIncomeDescription(income.aciklama);
    setNewIncomeAmount(income.tutar.toString());
    // Format date for input field
    setNewIncomeDate(format(new Date(income.tarih), 'yyyy-MM-dd'));
    setNewIncomeCategory(income.kategori);
    setNewIncomeOdemeYontemi(income.odeme_yontemi);
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = (income: Income) => {
    setEditingIncome(income)
    setIsDeleteDialogOpen(true)
  }
  
  const confirmDeleteIncome = async () => {
    if (!editingIncome) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('gelirler')  // Fixed: was 'gelirler' (lowercase)
        .delete()
        .eq('id', editingIncome.id);
        
      if (error) {
        console.error('Delete error:', error);
        toast.error(`Silme hatası: ${error.message}`);
        return;
      }
      
      setTransactions(transactions.filter(t => t.id !== editingIncome.id));
      setIsDeleteDialogOpen(false);
      setEditingIncome(null);
      toast.success('Gelir başarıyla silindi.');
      
    } catch (error: any) {
      console.error('Error deleting income:', error);
      toast.error('Gelir silinirken beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

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
  const totalAmount = filteredTransactions.reduce(
    (sum, transaction) => sum + transaction.tutar,
    0
  );
  const islemSayisi = transactions.length;
  
  // En büyük gelir kategorisini bul
  const categoryTotals = filteredTransactions.reduce<Record<string, number>>(
    (acc, transaction) => {
      acc[transaction.kategori] = (acc[transaction.kategori] || 0) + transaction.tutar;
      return acc;
    },
    {}
  );
  const enBuyukGelirKategori = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

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
            <div className="text-2xl font-bold text-green-700">{formatCurrency(totalAmount)}</div>
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

      {/* Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex border-b w-full">
          <button 
            onClick={() => setActiveTab('gelirler')} 
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${
              activeTab === 'gelirler' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Gelirler
          </button>
          <button 
            onClick={() => setActiveTab('borclar')} 
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${
              activeTab === 'borclar' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Borçlar
          </button>
        </div>
      </div>

      {/* Add New Button */}
      <div className="flex justify-end mb-4 flex-shrink-0">
        <Button 
          className="bg-blue-600 hover:bg-blue-700" 
          onClick={() => setIsDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> 
          {activeTab === 'gelirler' ? 'Yeni Gelir Ekle' : 'Yeni Borç Ekle'}
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setEditingIncome(null)
            setNewIncomeDescription("")
            setNewIncomeAmount("")
            setNewIncomeDate(format(new Date(), "yyyy-MM-dd"))
            setNewIncomeCategory(filterCategory !== "all" ? filterCategory : "")
          }
          setIsDialogOpen(open)
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingIncome ? 'Gelir Düzenle' : 'Yeni Gelir Ekle'}</DialogTitle>
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
                  step="0.01"
                  min="0"
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
                    {(activeTab === 'gelirler' ? categories : debtCategories).map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="odemeYontemi" className="text-right">Ödeme Yöntemi</Label>
                <Select 
                  value={newIncomeOdemeYontemi} 
                  onValueChange={(value: OdemeYontemi) => setNewIncomeOdemeYontemi(value)}
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
                  onClick={handleAddIncome}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Kaydediliyor...' : (editingIncome ? 'Güncelle' : 'Kaydet')}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Silme Onay Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gelir Kaydını Sil</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Bu gelir kaydını silmek istediğinizden emin misiniz?</p>
              {editingIncome && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{editingIncome.aciklama}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(editingIncome.tarih), 'dd.MM.yyyy')} • {editingIncome.kategori} • {formatCurrency(editingIncome.tutar)}
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
                onClick={confirmDeleteIncome}
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
        <CardHeader className="border-b">
          <CardTitle>
            {activeTab === 'gelirler' ? 'Gelir Hareketleri' : 'Borç Hareketleri'}
          </CardTitle>
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
                    <TableCell className="text-right">{formatCurrency(transaction.tutar)}</TableCell>
                    <TableCell className="w-20 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditIncome(transaction)}
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