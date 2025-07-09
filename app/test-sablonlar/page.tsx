"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormBuilder } from "@/components/form-builder"
import { toast } from "@/components/ui/use-toast"
import { FileText, Users, CheckCircle, Heart, Copy, ExternalLink, Clock, BarChart3, Plus } from "lucide-react"

const initialTestSablonlari = [
  {
    id: "mmpi-sablonu",
    title: "MMPI Şablonu",
    description: "Minnesota Çok Yönlü Kişilik Envanteri - Bireysel değerlendirme",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    url: "/test-sablonlar/mmpi-sablonu",
    estimatedTime: "45-60 dk",
    category: "Kişilik Testi",
  },
  {
    id: "mmpi-cift",
    title: "MMPI Çift Şablonu",
    description: "Çiftler için MMPI değerlendirme şablonu",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    url: "/test-sablonlar/mmpi-cift",
    estimatedTime: "60-90 dk",
    category: "Çift Terapisi",
  },
  {
    id: "mmpi-cevaplar",
    title: "MMPI Cevaplar",
    description: "MMPI test sonuçları ve cevap anahtarı",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    url: "/test-sablonlar/mmpi-cevaplar",
    estimatedTime: "15-20 dk",
    category: "Değerlendirme",
  },
  {
    id: "scid-sablonu",
    title: "SCİD Şablonu",
    description: "Yapılandırılmış Klinik Görüşme - DSM-5 için",
    icon: FileText,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    url: "/test-sablonlar/scid-sablonu",
    estimatedTime: "90-120 dk",
    category: "Klinik Görüşme",
  },
  {
    id: "scid-cift",
    title: "SCİD Çift Şablonu",
    description: "Çiftler için yapılandırılmış klinik görüşme",
    icon: Users,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    url: "/test-sablonlar/scid-cift",
    estimatedTime: "120-150 dk",
    category: "Çift Terapisi",
  },
  {
    id: "scid-cevaplar",
    title: "SCİD Cevaplar",
    description: "SCİD test sonuçları ve değerlendirme rehberi",
    icon: CheckCircle,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    url: "/test-sablonlar/scid-cevaplar",
    estimatedTime: "20-30 dk",
    category: "Değerlendirme",
  },
  {
    id: "sema-terapi",
    title: "Şema Terapi Şablonu",
    description: "Şema terapi değerlendirme ve uygulama formu",
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    url: "/test-sablonlar/sema-terapi",
    estimatedTime: "60-75 dk",
    category: "Terapi Şablonu",
  },
  {
    id: "sema-terapi-cift",
    title: "Şema Terapi Çift",
    description: "Çiftler için şema terapi değerlendirme",
    icon: Users,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    url: "/test-sablonlar/sema-terapi-cift",
    estimatedTime: "75-90 dk",
    category: "Çift Terapisi",
  },
  {
    id: "sema-terapi-cevaplar",
    title: "Şema Terapi Cevaplar",
    description: "Şema terapi sonuçları ve analiz rehberi",
    icon: CheckCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    url: "/test-sablonlar/sema-terapi-cevaplar",
    estimatedTime: "25-35 dk",
    category: "Değerlendirme",
  },
  {
    id: "yakin-iliskiler",
    title: "Yakın İlişkiler Şablonu",
    description: "İlişki kalitesi ve dinamikleri değerlendirme formu",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    url: "/test-sablonlar/yakin-iliskiler",
    estimatedTime: "30-45 dk",
    category: "İlişki Değerlendirme",
  },
  {
    id: "yakin-iliskiler-cevaplar",
    title: "Yakın İlişkiler Cevaplar",
    description: "İlişki değerlendirme sonuçları ve öneriler",
    icon: CheckCircle,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    url: "/test-sablonlar/yakin-iliskiler-cevaplar",
    estimatedTime: "15-25 dk",
    category: "Değerlendirme",
  },
]

const kategoriler = [
  "Tümü",
  "Kişilik Testi",
  "Çift Terapisi",
  "Değerlendirme",
  "Klinik Görüşme",
  "Terapi Şablonu",
  "İlişki Değerlendirme",
]

// Test ekleme formu alanları
const testFormFields = [
  { name: "title", label: "Test Adı", type: "text" as const, required: true },
  { name: "description", label: "Açıklama", type: "textarea" as const, required: true },
  {
    name: "category",
    label: "Kategori",
    type: "select" as const,
    options: kategoriler.slice(1), // "Tümü" hariç
    required: true,
  },
  { name: "estimatedTime", label: "Tahmini Süre", type: "text" as const, required: true, placeholder: "45-60 dk" },
  { name: "url", label: "Test Linki", type: "text" as const, required: true, placeholder: "/test-sablonlar/yeni-test" },
]

// İkon seçenekleri
const iconOptions = [
  { name: "FileText", icon: FileText, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  { name: "Users", icon: Users, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  {
    name: "CheckCircle",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  { name: "Heart", icon: Heart, color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
  {
    name: "BarChart3",
    icon: BarChart3,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
]

export default function TestSablonlarPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tümü")
  const [testSablonlari, setTestSablonlari] = useState(initialTestSablonlari)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0])

  const filteredTests =
    selectedCategory === "Tümü" ? testSablonlari : testSablonlari.filter((test) => test.category === selectedCategory)

  const copyToClipboard = async (url: string, title: string) => {
    try {
      const fullUrl = `${window.location.origin}${url}`
      await navigator.clipboard.writeText(fullUrl)
      toast({
        title: "Bağlantı kopyalandı!",
        description: `${title} bağlantısı panoya kopyalandı.`,
      })
    } catch (err) {
      console.error("Kopyalama hatası:", err)
      toast({
        title: "Hata",
        description: "Bağlantı kopyalanırken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const getCategoryStats = () => {
    const stats = kategoriler.slice(1).map((category) => ({
      category,
      count: testSablonlari.filter((test) => test.category === category).length,
    }))
    return stats
  }

  const handleAddTest = (data: any) => {
    const newTest = {
      id: data.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      title: data.title,
      description: data.description,
      icon: selectedIcon.icon,
      color: selectedIcon.color,
      bgColor: selectedIcon.bgColor,
      borderColor: selectedIcon.borderColor,
      url: data.url,
      estimatedTime: data.estimatedTime,
      category: data.category,
    }

    setTestSablonlari((prev) => [...prev, newTest])
    setShowAddForm(false)
    setSelectedIcon(iconOptions[0]) // Reset icon selection

    toast({
      title: "Test başarıyla eklendi!",
      description: `${data.title} test listesine eklendi.`,
    })
  }

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="Test ve Şablonlar" description="Psikolojik değerlendirme testleri ve şablonları">
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Test Ekle
        </Button>
      </PageHeader>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Toplam Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{testSablonlari.length}</div>
            <p className="text-xs text-muted-foreground">Mevcut şablon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bu Ay Kullanılan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">24</div>
            <p className="text-xs text-muted-foreground">Test uygulaması</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En Popüler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">MMPI</div>
            <p className="text-xs text-muted-foreground">8 kullanım</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ortalama Süre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">52</div>
            <p className="text-xs text-muted-foreground">Dakika</p>
          </CardContent>
        </Card>
      </div>

      {/* Kategori Filtreleri */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Kategoriler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {kategoriler.map((kategori) => (
              <Button
                key={kategori}
                variant={selectedCategory === kategori ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(kategori)}
                className="transition-all duration-200"
              >
                {kategori}
                {kategori !== "Tümü" && (
                  <Badge variant="secondary" className="ml-2">
                    {testSablonlari.filter((test) => test.category === kategori).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTests.map((test) => (
          <Card key={test.id} className={`hover:shadow-lg transition-all duration-200 ${test.borderColor} border-2`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${test.bgColor} ${test.borderColor} border`}>
                    <test.icon className={`size-5 ${test.color}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-lg ${test.color}`}>{test.title}</CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {test.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{test.description}</p>

              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="size-3" />
                  <span>{test.estimatedTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BarChart3 className="size-3" />
                  <span>Değerlendirme</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button asChild className="flex-1" size="sm">
                  <a href={test.url} className="flex items-center space-x-2">
                    <ExternalLink className="size-4" />
                    <span>Teste Git</span>
                  </a>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(test.url, test.title)}
                  className="px-3"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kategori İstatistikleri */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Kategori İstatistikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getCategoryStats().map((stat) => (
              <div key={stat.category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">{stat.category}</span>
                <Badge variant="secondary">{stat.count} test</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Ekleme Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Test Ekle</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* İkon Seçimi */}
            <div className="space-y-2">
              <label className="text-sm font-medium">İkon Seçin</label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setSelectedIcon(option)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedIcon.name === option.name
                        ? `${option.borderColor} ${option.bgColor}`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <option.icon className={`size-6 ${option.color}`} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Seçilen ikon: <span className="font-medium">{selectedIcon.name}</span>
              </p>
            </div>

            {/* Form */}
            <FormBuilder
              title=""
              fields={testFormFields}
              onSubmit={handleAddTest}
              onCancel={() => setShowAddForm(false)}
              submitText="Test Ekle"
              cancelText="İptal"
            />
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
