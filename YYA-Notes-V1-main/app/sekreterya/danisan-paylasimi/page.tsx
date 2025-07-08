"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { FormBuilder } from "@/components/form-builder"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Share2, AlertTriangle } from "lucide-react"

const initialPaylasilanDanisanlar = [
  {
    id: 1,
    danisan_adi: "A.K.",
    paylasan_psikolog: "Dr. Ahmet Yılmaz",
    alan_psikolog: "Dr. Ayşe Demir",
    tarih: "2024-01-15",
    sebep: "Uzmanlık Alanı",
    durum: "Aktif",
    aciliyet: "Normal",
  },
  {
    id: 2,
    danisan_adi: "M.D.",
    paylasan_psikolog: "Dr. Ayşe Demir",
    alan_psikolog: "Dr. Mehmet Kaya",
    tarih: "2024-01-10",
    sebep: "İkinci Görüş",
    durum: "Tamamlandı",
    aciliyet: "Yüksek",
  },
  {
    id: 3,
    danisan_adi: "Z.Y.",
    paylasan_psikolog: "Dr. Ahmet Yılmaz",
    alan_psikolog: "Dr. Fatma Özkan",
    tarih: "2024-01-08",
    sebep: "Süpervizyon",
    durum: "Beklemede",
    aciliyet: "Normal",
  },
]

const columns = [
  { key: "danisan_adi", label: "Danışan", sortable: true },
  { key: "paylasan_psikolog", label: "Paylaşan Psikolog" },
  { key: "alan_psikolog", label: "Alan Psikolog" },
  { key: "tarih", label: "Tarih", sortable: true },
  { key: "sebep", label: "Paylaşım Sebebi" },
  { key: "durum", label: "Durum" },
  { key: "aciliyet", label: "Aciliyet" },
]

const formFields = [
  {
    name: "danisan_adi",
    label: "Danışan Adı",
    type: "select" as const,
    options: ["Ayşe Kaya", "Mehmet Demir", "Zeynep Yılmaz", "Can Özkan"],
    required: true,
  },
  {
    name: "alan_psikolog",
    label: "Paylaşılacak Psikolog",
    type: "select" as const,
    options: ["Dr. Ayşe Demir", "Dr. Mehmet Kaya", "Dr. Fatma Özkan", "Dr. Ali Yıldız"],
    required: true,
  },
  {
    name: "paylasim_sebebi",
    label: "Paylaşım Sebebi",
    type: "select" as const,
    options: ["Uzmanlık Alanı", "İkinci Görüş", "Süpervizyon", "Konsültasyon", "Acil Durum"],
    required: true,
  },
  {
    name: "aciliyet",
    label: "Aciliyet Durumu",
    type: "select" as const,
    options: ["Düşük", "Normal", "Yüksek", "Acil"],
    required: true,
  },
  { name: "paylasim_detayi", label: "Paylaşım Detayı", type: "textarea" as const, required: true },
  { name: "beklenen_geri_donus", label: "Beklenen Geri Dönüş", type: "textarea" as const },
  { name: "gizlilik_notu", label: "Gizlilik Notu", type: "textarea" as const },
  {
    name: "paylasim_suresi",
    label: "Paylaşım Süresi",
    type: "select" as const,
    options: ["1 Hafta", "2 Hafta", "1 Ay", "3 Ay", "Süresiz"],
    required: true,
  },
]

export default function DanisanPaylasimiPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [paylasilanDanisanlar, setPaylasilanDanisanlar] = useState(initialPaylasilanDanisanlar)

  const handleSubmit = (data: any) => {
    if (editingItem) {
      setPaylasilanDanisanlar((prev) =>
        prev.map((item) => (item.id === editingItem.id ? { ...data, id: editingItem.id } : item)),
      )
    } else {
      const newId = Math.max(...paylasilanDanisanlar.map((item) => item.id)) + 1
      setPaylasilanDanisanlar((prev) => [...prev, { ...data, id: newId }])
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const handleImport = (importedData: any[]) => {
    const formattedData = importedData.map((item, index) => ({
      id: Math.max(...paylasilanDanisanlar.map((p) => p.id)) + index + 1,
      danisan_adi: item.danisan_adi || item["Danışan Adı"] || "",
      paylasan_psikolog: item.paylasan_psikolog || item["Paylaşan Psikolog"] || "",
      alan_psikolog: item.alan_psikolog || item["Alan Psikolog"] || "",
      tarih: item.tarih || item.Tarih || "",
      sebep: item.sebep || item.Sebep || item["Paylaşım Sebebi"] || "",
      durum: item.durum || item.Durum || "Beklemede",
      aciliyet: item.aciliyet || item.Aciliyet || "Normal",
    }))
    setPaylasilanDanisanlar((prev) => [...prev, ...formattedData])
  }

  const getDurumBadge = (durum: string) => {
    const variants = {
      Aktif: "default",
      Tamamlandı: "secondary",
      Beklemede: "destructive",
    }
    return <Badge variant={variants[durum as keyof typeof variants] as any}>{durum}</Badge>
  }

  const getAciliyetBadge = (aciliyet: string) => {
    const variants = {
      Normal: "secondary",
      Yüksek: "destructive",
      Acil: "destructive",
    }
    return <Badge variant={variants[aciliyet as keyof typeof variants] as any}>{aciliyet}</Badge>
  }

  const handleDelete = (item: any) => {
    setPaylasilanDanisanlar((prev) => prev.filter((paylasim) => paylasim.id !== item.id))
  }

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="Danışan Paylaşımı" description="Danışan bilgilerini güvenli şekilde paylaşın">
        <Button onClick={() => setShowForm(true)}>
          <Share2 className="h-4 w-4 mr-2" />
          Yeni Paylaşım
        </Button>
      </PageHeader>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Aktif Paylaşımlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">8</div>
            <p className="text-xs text-muted-foreground">Devam eden</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bu Ay Paylaşılan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">15</div>
            <p className="text-xs text-muted-foreground">Toplam</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bekleyen Onaylar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-muted-foreground">Onay bekliyor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Acil Durumlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1</div>
            <p className="text-xs text-muted-foreground">Hemen işlem gerekli</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Danışan Paylaşım Listesi"
        columns={columns}
        data={paylasilanDanisanlar.map((item) => ({
          ...item,
          durum: getDurumBadge(item.durum),
          aciliyet: getAciliyetBadge(item.aciliyet),
        }))}
        onAdd={() => setShowForm(true)}
        onEdit={setEditingItem}
        onDelete={handleDelete}
        onImport={handleImport}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Danışan Paylaşımı</DialogTitle>
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

      {/* Uyarı Kartı */}
      <Card className="mt-6 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            <span>Gizlilik ve Güvenlik Uyarısı</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-orange-700 space-y-2">
            <p>• Danışan bilgileri sadece profesyonel amaçlarla paylaşılmalıdır.</p>
            <p>• Paylaşım öncesi danışan onayı alınmalıdır.</p>
            <p>• Tüm paylaşımlar kayıt altına alınır ve denetlenir.</p>
            <p>• KVKK ve etik kurallara uygun hareket edilmelidir.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
