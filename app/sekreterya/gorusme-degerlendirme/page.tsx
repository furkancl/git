"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { FormBuilder } from "@/components/form-builder"
import { DataTable } from "@/components/data-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, TrendingUp } from "lucide-react"

const initialDegerlendirmeler = [
  {
    id: 1,
    danisan: "Ayşe K.",
    tarih: "2024-01-15",
    seans_no: "3",
    degerlendiren: "Dr. Ahmet Yılmaz",
    ilerleme: "İyi",
    sonraki_hedef: "Anksiyete yönetimi",
  },
  {
    id: 2,
    danisan: "Mehmet D.",
    tarih: "2024-01-14",
    seans_no: "7",
    degerlendiren: "Dr. Ayşe Demir",
    ilerleme: "Çok İyi",
    sonraki_hedef: "İlişki becerileri",
  },
  {
    id: 3,
    danisan: "Zeynep Y.",
    tarih: "2024-01-13",
    seans_no: "1",
    degerlendiren: "Dr. Ahmet Yılmaz",
    ilerleme: "Başlangıç",
    sonraki_hedef: "Güven oluşturma",
  },
]

const columns = [
  { key: "danisan", label: "Danışan", sortable: true },
  { key: "tarih", label: "Tarih", sortable: true },
  { key: "seans_no", label: "Seans No" },
  { key: "degerlendiren", label: "Değerlendiren" },
  { key: "ilerleme", label: "İlerleme" },
  { key: "sonraki_hedef", label: "Sonraki Hedef" },
]

const formFields = [
  {
    name: "danisan_adi",
    label: "Danışan Adı",
    type: "select" as const,
    options: ["Ayşe Kaya", "Mehmet Demir", "Zeynep Yılmaz", "Can Özkan"],
    required: true,
  },
  { name: "gorusme_tarihi", label: "Görüşme Tarihi", type: "date" as const, required: true },
  { name: "seans_no", label: "Seans Numarası", type: "number" as const, required: true },
  { name: "gorusme_suresi", label: "Görüşme Süresi (dakika)", type: "number" as const, required: true },
  {
    name: "gorusme_tipi",
    label: "Görüşme Tipi",
    type: "select" as const,
    options: ["Bireysel Terapi", "Çift Terapisi", "Aile Terapisi", "Grup Terapisi"],
    required: true,
  },
  { name: "seansta_ele_alinanlar", label: "Seansta Ele Alınan Konular", type: "textarea" as const, required: true },
  { name: "danisan_tepkileri", label: "Danışan Tepkileri ve Katılımı", type: "textarea" as const, required: true },
  {
    name: "kullanilan_teknikler",
    label: "Kullanılan Teknikler",
    type: "select" as const,
    options: [
      "Bilişsel Yeniden Yapılandırma",
      "Davranışsal Aktivasyon",
      "Mindfulness",
      "EMDR",
      "Boş Sandalye Tekniği",
      "Rol Oynama",
      "Ev Ödevi",
    ],
  },
  {
    name: "ilerleme_degerlendirmesi",
    label: "İlerleme Değerlendirmesi",
    type: "select" as const,
    options: ["Çok İyi", "İyi", "Orta", "Yavaş", "İlerleme Yok"],
    required: true,
  },
  { name: "gozlenen_degisiklikler", label: "Gözlenen Değişiklikler", type: "textarea" as const },
  { name: "ev_odevleri", label: "Verilen Ev Ödevleri", type: "textarea" as const },
  { name: "sonraki_seans_hedefleri", label: "Sonraki Seans Hedefleri", type: "textarea" as const, required: true },
  {
    name: "risk_degerlendirmesi",
    label: "Risk Değerlendirmesi",
    type: "select" as const,
    options: ["Düşük Risk", "Orta Risk", "Yüksek Risk"],
    required: true,
  },
  { name: "ek_notlar", label: "Ek Notlar", type: "textarea" as const },
]

export default function GorusmeDegerlendirmePage() {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [degerlendirmeler, setDegerlendirmeler] = useState(initialDegerlendirmeler)

  const handleSubmit = (data: any) => {
    if (editingItem) {
      setDegerlendirmeler((prev) =>
        prev.map((item) => (item.id === editingItem.id ? { ...data, id: editingItem.id } : item)),
      )
    } else {
      const newId = Math.max(...degerlendirmeler.map((item) => item.id)) + 1
      setDegerlendirmeler((prev) => [...prev, { ...data, id: newId }])
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const handleImport = (importedData: any[]) => {
    const formattedData = importedData.map((item, index) => ({
      id: Math.max(...degerlendirmeler.map((d) => d.id)) + index + 1,
      danisan: item.danisan || item.Danisan || item["Danışan"] || "",
      tarih: item.tarih || item.Tarih || "",
      seans_no: item.seans_no || item["Seans No"] || item.seans_no || "",
      degerlendiren: item.degerlendiren || item.Değerlendiren || "",
      ilerleme: item.ilerleme || item.İlerleme || "Orta",
      sonraki_hedef: item.sonraki_hedef || item["Sonraki Hedef"] || "",
    }))
    setDegerlendirmeler((prev) => [...prev, ...formattedData])
  }

  const getIlerlemeColor = (ilerleme: string) => {
    const colors = {
      "Çok İyi": "text-green-600",
      İyi: "text-blue-600",
      Orta: "text-yellow-600",
      Yavaş: "text-orange-600",
      Başlangıç: "text-gray-600",
    }
    return colors[ilerleme as keyof typeof colors] || "text-gray-600"
  }

  const handleDelete = (item: any) => {
    setDegerlendirmeler((prev) => prev.filter((degerlendirme) => degerlendirme.id !== item.id))
  }

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="Görüşme Değerlendirme Formu" description="Görüşme sonrası değerlendirme ve takip">
        <Button onClick={() => setShowForm(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Yeni Değerlendirme
        </Button>
      </PageHeader>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bu Hafta Değerlendirilen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">12</div>
            <p className="text-xs text-muted-foreground">Görüşme</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ortalama İlerleme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">İyi</div>
            <p className="text-xs text-muted-foreground">Genel durum</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Risk Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">2</div>
            <p className="text-xs text-muted-foreground">Yüksek risk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tamamlanan Hedef</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">8</div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Görüşme Değerlendirme Listesi"
        columns={columns}
        data={degerlendirmeler.map((item) => ({
          ...item,
          ilerleme: <span className={`font-medium ${getIlerlemeColor(item.ilerleme)}`}>{item.ilerleme}</span>,
        }))}
        onAdd={() => setShowForm(true)}
        onEdit={setEditingItem}
        onDelete={handleDelete}
        onImport={handleImport}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Görüşme Değerlendirme Formu</DialogTitle>
          </DialogHeader>
          <FormBuilder
            title=""
            fields={formFields}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            initialData={editingItem}
          />
        </DialogContent>
      </Dialog>

      {/* Değerlendirme Özeti */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>İlerleme Analizi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Çok İyi İlerleme</span>
                <span className="font-medium text-green-600">5 danışan</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "42%" }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">İyi İlerleme</span>
                <span className="font-medium text-blue-600">4 danışan</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "33%" }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Orta İlerleme</span>
                <span className="font-medium text-yellow-600">2 danışan</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "17%" }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Yavaş İlerleme</span>
                <span className="font-medium text-orange-600">1 danışan</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: "8%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popüler Teknikler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="text-sm">Bilişsel Yeniden Yapılandırma</span>
                <Badge variant="secondary">8</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="text-sm">Mindfulness</span>
                <Badge variant="secondary">6</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="text-sm">Davranışsal Aktivasyon</span>
                <Badge variant="secondary">5</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="text-sm">EMDR</span>
                <Badge variant="secondary">3</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
