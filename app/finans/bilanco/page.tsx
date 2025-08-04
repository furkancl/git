"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Wallet, CreditCard, Banknote, ChevronDown, CalendarIcon, Search, Filter, ArrowUpCircle, ArrowDownCircle, User, BookOpen, BabyIcon as Child, FileText, Users, MoreHorizontal } from "lucide-react" // Yeni ikonlar eklendi
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO, isWithinInterval } from "date-fns" // parseISO ve isWithinInterval eklendi
import { tr } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRange } from "react-day-picker" // DateRange tekrar import edildi

// bilanco-page.tsx'ten taşınan arayüzler
// TransactionKasa kaldırıldı
interface TransactionBilanco { // Bilanço için Transaction interface'i
  id: string
  date: string
  description: string
  amount: number
  category: string
  type: "income" | "expense"
  status: "paid" | "pending"
}

interface CategoryData {
  name: string
  value: number
  color: string
  icon?: React.ElementType
}

// Yeniden kullanılabilir daire grafiği bileşeni (bilanco-page.tsx'ten taşındı)
const PieChart = ({ data, onHover }: { data: CategoryData[]; onHover: (categoryName: string | null) => void }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-center text-gray-500">Gösterilecek veri yok.</p>
      </div>
    )
  }

  let startAngle = 0
  const slices = data.map((item, index) => {
    const angle = (item.value / total) * 360
    const endAngle = startAngle + angle

    const radius = 80
    const cx = 100
    const cy = 100

    const getCoordinatesForAngle = (ang: number) => {
      const radians = ((ang - 90) * Math.PI) / 180
      return {
        x: cx + radius * Math.cos(radians),
        y: cy + radius * Math.sin(radians),
      }
    }

    const p1 = getCoordinatesForAngle(startAngle)
    const p2 = getCoordinatesForAngle(endAngle)

    const largeArcFlag = angle > 180 ? 1 : 0

    const pathData = `M ${cx},${cy} L ${p1.x},${p1.y} A ${radius},${radius} 0 ${largeArcFlag} 1 ${p2.x},${p2.y} Z`

    startAngle = endAngle
    return (
      <path
        key={index}
        d={pathData}
        fill={item.color}
        className="transition-transform duration-200 hover:scale-105 origin-center"
        onMouseEnter={() => onHover(item.name)} // Hover başlangıcı
        onMouseLeave={() => onHover(null)} // Hover bitişi
      >
        <title>{`${item.name}: ₺${item.value.toLocaleString()} (${((item.value / total) * 100).toFixed(1)}%)`}</title>
      </path>
    )
  })

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      {slices}
    </svg>
  )
}

// KasaPageContent fonksiyonu kaldırıldı

function BilancoPageContent() { // BilancoPage fonksiyonunun adını değiştirdim
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedChartType, setSelectedChartType] = useState<"income" | "expense">("income")
  const [hoveredCategoryName, setHoveredCategoryName] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const allTransactions: TransactionBilanco[] = useMemo(
    () => [
      {
        id: "INC001",
        date: "2024-07-15",
        description: "Bireysel Randevu - Ahmet Yılmaz",
        amount: 500,
        category: "Danışan Ödemeleri",
        type: "income",
        status: "paid",
      },
      {
        id: "INC002",
        date: "2024-07-14",
        description: "Çift Randevusu - Ayşe & Can",
        amount: 800,
        category: "Danışan Ödemeleri",
        type: "income",
        status: "pending",
      },
      {
        id: "INC003",
        date: "2024-07-13",
        description: "Online Randevu - Zeynep Kaya",
        amount: 450,
        category: "Danışan Ödemeleri",
        type: "income",
        status: "paid",
      },
      {
        id: "INC004",
        date: "2024-06-20",
        description: "Kitap Satışı",
        amount: 150,
        category: "Kitap Ödemeleri",
        type: "income",
        status: "paid",
      },
      {
        id: "INC005",
        date: "2024-06-10",
        description: "Grup Randevusu",
        amount: 1200,
        category: "Grup Terapisi Ödemeleri",
        type: "income",
        status: "paid",
      },
      {
        id: "INC006",
        date: "2024-05-01",
        description: "Test Uygulaması",
        amount: 200,
        category: "Test Ödemeleri",
        type: "income",
        status: "paid",
      },
      {
        id: "INC007",
        date: "2024-05-15",
        description: "Süpervizyon Geliri",
        amount: 900,
        category: "Diğer Gelirler",
        type: "income",
        status: "paid",
      },
      {
        id: "INC008",
        date: "2024-04-05",
        description: "Bireysel Randevu - Deniz Akın",
        amount: 550,
        category: "Danışan Ödemeleri",
        type: "income",
        status: "paid",
      },
      {
        id: "INC009",
        date: "2024-04-22",
        description: "Online Eğitim Satışı",
        amount: 300,
        category: "Diğer Gelirler",
        type: "income",
        status: "paid",
      },
      {
        id: "EXP001",
        date: "2024-07-14",
        description: "Ofis Kirası",
        amount: 3000,
        category: "Sabit Giderler",
        type: "expense",
        status: "paid",
      },
      {
        id: "EXP002",
        date: "2024-07-12",
        description: "Süpervizyon Ücreti",
        amount: 1500,
        category: "Eğitim Giderleri",
        type: "expense",
        status: "paid",
      },
      {
        id: "EXP003",
        date: "2024-07-05",
        description: "İnternet Faturası",
        amount: 200,
        category: "Sabit Giderler",
        type: "expense",
        status: "paid",
      },
      {
        id: "EXP004",
        date: "2024-06-25",
        description: "Ofis Malzemeleri",
        amount: 250,
        category: "Ofis Giderleri",
        type: "expense",
        status: "paid",
      },
      {
        id: "EXP005",
        date: "2024-06-05",
        description: "Temizlik Hizmeti",
        amount: 400,
        category: "Ofis Giderleri",
        type: "expense",
        status: "paid",
      },
      {
        id: "EXP006",
        date: "2024-05-10",
        description: "Muhasebe Ücreti",
        amount: 600,
        category: "Hizmet Bedelleri",
        type: "expense",
        status: "pending",
      },
      {
        id: "EXP007",
        date: "2024-05-20",
        description: "Yazılım Aboneliği",
        amount: 100,
        category: "Sabit Giderler",
        type: "expense",
        status: "paid",
      },
      {
        id: "EXP008",
        date: "2024-04-10",
        description: "Seminer Katılım",
        amount: 800,
        category: "Eğitim Giderleri",
        type: "expense",
        status: "paid",
      },
      {
        id: "EXP009",
        date: "2024-04-28",
        description: "Personel Maaşı",
        amount: 1500,
        category: "Personel Giderleri",
        type: "expense",
        status: "paid",
      },
    ],
    [],
  )

  const incomeCategories = useMemo(
    () => [
      { name: "Danışan Ödemeleri", icon: User, color: "#3B82F6" },
      { name: "Çocuk Danışan Ödemeleri", icon: Child, color: "#6366F1" },
      { name: "Kitap Ödemeleri", icon: BookOpen, color: "#10B981" },
      { name: "Test Ödemeleri", icon: FileText, color: "#F59E0B" },
      { name: "Grup Terapisi Ödemeleri", icon: Users, color: "#8B5CF6" },
      { name: "Diğer Gelirler", icon: MoreHorizontal, color: "#6B7280" },
    ],
    [],
  )

  const expenseCategories = useMemo(
    () => [
      { name: "Sabit Giderler", icon: FileText, color: "#EF4444" },
      { name: "Ofis Giderleri", icon: MoreHorizontal, color: "#F97316" },
      { name: "Eğitim Giderleri", icon: BookOpen, color: "#EAB308" },
      { name: "Hizmet Bedelleri", icon: Users, color: "#06B6D4" },
      { name: "Personel Giderleri", icon: User, color: "#EC4899" },
      { name: "Diğer Giderler", icon: MoreHorizontal, color: "#6B7280" },
    ],
    [],
  )

  const filteredTransactionsBilanco = useMemo(() => { // Kasa'daki ile çakışmaması için isim değişti
    if (!dateRange?.from && !dateRange?.to) {
      return allTransactions
    }
    
    return allTransactions.filter((transaction) => {
      const transactionDate = parseISO(transaction.date)
      
      if (dateRange?.from && !dateRange?.to) {
        return transactionDate >= dateRange.from
      }
      
      if (!dateRange?.from && dateRange?.to) {
        return transactionDate <= dateRange.to
      }
      
      if (dateRange?.from && dateRange?.to) {
        return isWithinInterval(transactionDate, { 
          start: dateRange.from, 
          end: dateRange.to 
        })
      }
      
      return true
    })
  }, [allTransactions, dateRange])

  const totalIncome = useMemo(
    () => filteredTransactionsBilanco.filter((t) => t.type === "income").reduce((sum, item) => sum + item.amount, 0),
    [filteredTransactionsBilanco],
  )
  const totalExpenses = useMemo(
    () => filteredTransactionsBilanco.filter((t) => t.type === "expense").reduce((sum, item) => sum + item.amount, 0),
    [filteredTransactionsBilanco],
  )
  const netBalance = totalIncome - totalExpenses

  const getCategoryTotals = (
    transactions: TransactionBilanco[], // Burayı da TransactionBilanco olarak güncelledim
    categories: typeof incomeCategories | typeof expenseCategories,
  ) => {
    const totalsMap = new Map<string, number>()
    transactions.forEach((t) => {
      totalsMap.set(t.category, (totalsMap.get(t.category) || 0) + t.amount)
    })

    return categories
      .map((cat) => ({
        name: cat.name,
        value: totalsMap.get(cat.name) || 0,
        color: cat.color,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }

  const incomeCategoryDataForChart = useMemo(
    () =>
      getCategoryTotals(
        filteredTransactionsBilanco.filter((t) => t.type === "income"),
        incomeCategories,
      ),
    [filteredTransactionsBilanco, incomeCategories],
  )

  const expenseCategoryDataForChart = useMemo(
    () =>
      getCategoryTotals(
        filteredTransactionsBilanco.filter((t) => t.type === "expense"),
        expenseCategories,
      ),
    [filteredTransactionsBilanco, expenseCategories],
  )

  const currentChartData = selectedChartType === "income" ? incomeCategoryDataForChart : expenseCategoryDataForChart
  const currentChartTitle =
    selectedChartType === "income" ? "Gelir Kategorileri Dağılımı" : "Gider Kategorileri Dağılımı"
  const currentChartTotal = currentChartData.reduce((sum, item) => sum + item.value, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finansal Özet ve Dağılım</h1>
          <p className="text-gray-600 text-sm">
            Belirli bir tarih aralığındaki gelir ve gider dağılımınızı görüntüleyin
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-full md:w-[280px] justify-start text-left font-normal ${
                !dateRange?.from && !dateRange?.to && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  `${format(dateRange.from, "dd/MM/yyyy", { locale: tr })} - ${format(dateRange.to, "dd/MM/yyyy", {
                    locale: tr,
                  })}`
                ) : (
                  format(dateRange.from, "dd/MM/yyyy", { locale: tr })
                )
              ) : (
                <span>Tarih Aralığı Seç</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={tr} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 flex-shrink-0">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-green-700">₺{totalIncome.toLocaleString()}</p>
            </div>
            <ArrowUpCircle className="h-8 w-8 text-green-500 opacity-70" />
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gider</p>
              <p className="text-2xl font-bold text-red-700">₺{totalExpenses.toLocaleString()}</p>
            </div>
            <ArrowDownCircle className="h-8 w-8 text-red-500 opacity-70" />
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Bakiye</p>
              <p className="text-2xl font-bold text-blue-700">₺{netBalance.toLocaleString()}</p>
            </div>
            <Wallet className="h-8 w-8 text-blue-500 opacity-70" />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mb-6 flex-shrink-0">
        <Button
          variant={selectedChartType === "income" ? "default" : "outline"}
          onClick={() => setSelectedChartType("income")}
          className={selectedChartType === "income" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          Gelir Kategorileri
        </Button>
        <Button
          variant={selectedChartType === "expense" ? "default" : "outline"}
          onClick={() => setSelectedChartType("expense")}
          className={selectedChartType === "expense" ? "bg-red-600 hover:bg-red-700" : ""}
        >
          Gider Kategorileri
        </Button>
      </div>

      <Card className="shadow-sm border-none flex-grow flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-xl font-bold text-gray-800">{currentChartTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col sm:flex-row items-center justify-center gap-8 p-4">
          {currentChartData.length > 0 ? (
            <>
              <div className="flex-shrink-0">
                <PieChart data={currentChartData} onHover={setHoveredCategoryName} />
              </div>
              <div className="mt-4 sm:mt-0 text-sm space-y-2 flex-grow">
                {currentChartData.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center p-1 rounded-md transition-colors duration-150 ${
                      hoveredCategoryName === item.name ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => setHoveredCategoryName(item.name)}
                    onMouseLeave={() => setHoveredCategoryName(null)}
                  >
                    <span
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="flex-grow">
                      {item.name}: ₺{item.value.toLocaleString()} (
                      {currentChartTotal > 0 ? ((item.value / currentChartTotal) * 100).toFixed(1) : 0}
                      %)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <p className="text-center text-gray-500">
                Seçilen tarih aralığı için {selectedChartType === "income" ? "gelir" : "gider"} verisi bulunmamaktadır.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


// Bu ana Kasa sayfası bileşeni, BilancoPageContent'i içerir
export default function BilancoPage() { // Kasa ismi BilancoPage olarak değiştirildi
  // activeTab state'i ve ilgili navigasyon kaldırıldı

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Tab Navigasyonu kaldırıldı */}

          {/* Sadece BilancoPageContent render ediliyor */}
          <BilancoPageContent />
        </div>
      </main>
    </div>
  )
}