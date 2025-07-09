"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { FormBuilder } from "@/components/form-builder"
import { DataTable } from "@/components/data-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Plus } from "lucide-react"

const initialSeanslar = [
  {
    id: 1,
    danisan: "Ayşe Kaya",
    tarih: "2024-01-20",
    saat: "14:00",
    sure: "50",
    tip: "Bireysel Terapi",
    durum: "Planlandı",
    notlar: "İlk seans",
  },
  {
    id: 2,
    danisan: "Mehmet Demir",
    tarih: "2024-01-21",
    saat: "16:00",
    sure: "60",
    tip: "Çift Terapisi",
    durum: "Onaylandı",
    notlar: "3. seans",
  },
  {
    id: 3,
    danisan: "Zeynep Yılmaz",
    tarih: "2024-01-22",
    saat: "10:00",
    sure: "45",
    tip: "MMPI Testi",
    durum: "Beklemede",
    notlar: "Test uygulaması",
  },
]

const columns = [
  { key: "danisan", label: "Danışan", sortable: true },
  { key: "tarih", label: "Tarih", sortable: true },
  { key: "saat", label: "Saat" },
  { key: "sure", label: "Süre (dk)" },
  { key: "tip", label: "Seans Tipi" },
  { key: "durum", label: "Durum" },
  { key: "notlar", label: "Notlar" },
]

const formFields = [
  {
    name: "danisan",
    label: "Danışan",
    type: "select" as const,
    options: ["Ayşe Kaya", "Mehmet Demir", "Zeynep Yılmaz", "Can Özkan", "Fatma Demir"],
    required: true,
  },
  { name: "tarih", label: "Tarih", type: "date" as const, required: true },
  { name: "saat", label: "Saat", type: "text" as const, required: true, placeholder: "14:00" },
  { name: "sure", label: "Süre (dakika)", type: "number" as const, required: true, placeholder: "50" },
  {
    name: "tip",
    label: "Seans Tipi",
    type: "select" as const,
    options: ["Bireysel Terapi", "Çift Terapisi", "Aile Terapisi", "Grup Terapisi", "MMPI Testi", "SCİD Testi"],
    required: true,
  },
  {
    name: "durum",
    label: "Durum",
    type: "select" as const,
    options: ["Planlandı", "Onaylandı", "Beklemede", "İptal Edildi", "Tamamlandı"],
    required: true,
  },
  { name: "notlar", label: "Notlar", type: "textarea" as const },
  { name: "hatirlatma", label: "Hatırlatma", type: "select" as const, options: ["1 saat önce", "1 gün önce", "Yok"] },
]

export default function SeansPlanlamaPage() {
  const [seanslar, setSeanslar] = useState(initialSeanslar)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const handleSubmit = (data: any) => {
    if (editingItem) {
      setSeanslar((prev) => prev.map((item) => (item.id === editingItem.id ? { ...data, id: editingItem.id } : item)))
    } else {
      const newId = Math.max(...seanslar.map((item) => item.id)) + 1
      setSeanslar((prev) => [...prev, { ...data, id: newId }])
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const handleDelete = (item: any) => {
    setSeanslar((prev) => prev.filter((seans) => seans.id !== item.id))
  }

  const handleImport = (importedData: any[]) => {
    const formattedData = importedData.map((item, index) => ({
      id: Math.max(...seanslar.map((s) => s.id)) + index + 1,
      danisan: item.danisan || item.Danisan || "",
      tarih: item.tarih || item.Tarih || "",
      saat: item.saat || item.Saat || "",
      sure: item.sure || item.Süre || "50",
      tip: item.tip || item.Tip || item["Seans Tipi"] || "Bireysel Terapi",
      durum: item.durum || item.Durum || "Planlandı",
      notlar: item.notlar || item.Notlar || "",
    }))
    setSeanslar((prev) => [...prev, ...formattedData])
  }

  const getDurumBadge = (durum: string) => {
    const variants = {
      Planlandı: "secondary",
      Onaylandı: "default",
      Beklemede: "destructive",
      "İptal Edildi": "destructive",
      Tamamlandı: "default",
    }
    return <Badge variant={variants[durum as keyof typeof variants] as any}>{durum}</Badge>
  }

  // İstatistikler
  const bugunSeanslar = seanslar.filter((s) => s.tarih === new Date().toISOString().split("T")[0])
  const bekleyenSeanslar = seanslar.filter((s) => s.durum === "Beklemede")
  const onaylananSeanslar = seanslar.filter((s) => s.durum === "Onaylandı")

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="Seans Planlama" description="Danışan seanslarını planlayın ve yönetin">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Seans
        </Button>
      </PageHeader>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünün Seansları</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{bugunSeanslar.length}</div>
            <p className="text-xs text-muted-foreground">Bugün planlanmış</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Seanslar</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{bekleyenSeanslar.length}</div>
            <p className="text-xs text-muted-foreground">Onay bekliyor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan Seanslar</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onaylananSeanslar.length}</div>
            <p className="text-xs text-muted-foreground">Hazır</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Seans</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{seanslar.length}</div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Seans Listesi"
        columns={columns}
        data={seanslar.map((item) => ({
          ...item,
          durum: getDurumBadge(item.durum),
        }))}
        onAdd={() => setShowForm(true)}
        onEdit={setEditingItem}
        onDelete={handleDelete}
        onImport={handleImport}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Seans Düzenle" : "Yeni Seans Planla"}</DialogTitle>
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
    </main>
  )
}
