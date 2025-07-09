"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { FormBuilder } from "@/components/form-builder"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

const initialSeansNotlari = [
  {
    id: 1,
    danisan: "Ayşe Kaya",
    tarih: "2024-01-20",
    seans_no: "3",
    baslik: "Anksiyete Yönetimi",
    notlar: "Danışan bu seansta nefes egzersizlerini uyguladı. Belirgin ilerleme var.",
    etiketler: "anksiyete, nefes egzersizi",
    durum: "Tamamlandı",
  },
  {
    id: 2,
    danisan: "Mehmet Demir",
    tarih: "2024-01-21",
    seans_no: "7",
    baslik: "İlişki Dinamikleri",
    notlar: "Çift arasındaki iletişim sorunları ele alındı. Ev ödevi verildi.",
    etiketler: "çift terapisi, iletişim",
    durum: "Tamamlandı",
  },
  {
    id: 3,
    danisan: "Zeynep Yılmaz",
    tarih: "2024-01-22",
    seans_no: "1",
    baslik: "İlk Değerlendirme",
    notlar: "İlk görüşme tamamlandı. Ayrıntılı anamnez alındı.",
    etiketler: "ilk görüşme, anamnez",
    durum: "Taslak",
  },
]

const columns = [
  { key: "danisan", label: "Danışan", sortable: true },
  { key: "tarih", label: "Tarih", sortable: true },
  { key: "seans_no", label: "Seans No" },
  { key: "baslik", label: "Başlık" },
  { key: "etiketler", label: "Etiketler" },
  { key: "durum", label: "Durum" },
]

const formFields = [
  {
    name: "danisan",
    label: "Danışan",
    type: "select" as const,
    options: ["Ayşe Kaya", "Mehmet Demir", "Zeynep Yılmaz", "Can Özkan"],
    required: true,
  },
  { name: "tarih", label: "Seans Tarihi", type: "date" as const, required: true },
  { name: "seans_no", label: "Seans Numarası", type: "number" as const, required: true },
  { name: "baslik", label: "Not Başlığı", type: "text" as const, required: true },
  { name: "notlar", label: "Seans Notları", type: "textarea" as const, required: true },
  { name: "etiketler", label: "Etiketler", type: "text" as const, placeholder: "virgülle ayırın" },
  {
    name: "durum",
    label: "Durum",
    type: "select" as const,
    options: ["Taslak", "Tamamlandı", "Gözden Geçirilecek"],
    required: true,
  },
]

export default function SeansNotlariPage() {
  const [seansNotlari, setSeansNotlari] = useState(initialSeansNotlari)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewingNote, setViewingNote] = useState(null)

  const handleSubmit = (data: any) => {
    if (editingItem) {
      setSeansNotlari((prev) =>
        prev.map((item) => (item.id === editingItem.id ? { ...data, id: editingItem.id } : item)),
      )
    } else {
      const newId = Math.max(...seansNotlari.map((item) => item.id)) + 1
      setSeansNotlari((prev) => [...prev, { ...data, id: newId }])
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const handleDelete = (item: any) => {
    setSeansNotlari((prev) => prev.filter((not) => not.id !== item.id))
  }

  const handleImport = (importedData: any[]) => {
    const formattedData = importedData.map((item, index) => ({
      id: Math.max(...seansNotlari.map((n) => n.id)) + index + 1,
      danisan: item.danisan || item.Danisan || "",
      tarih: item.tarih || item.Tarih || "",
      seans_no: item.seans_no || item["Seans No"] || "",
      baslik: item.baslik || item.Başlık || "",
      notlar: item.notlar || item.Notlar || "",
      etiketler: item.etiketler || item.Etiketler || "",
      durum: item.durum || item.Durum || "Taslak",
    }))
    setSeansNotlari((prev) => [...prev, ...formattedData])
  }

  const getDurumBadge = (durum: string) => {
    const variants = {
      Tamamlandı: "default",
      Taslak: "secondary",
      "Gözden Geçirilecek": "destructive",
    }
    return <Badge variant={variants[durum as keyof typeof variants] as any}>{durum}</Badge>
  }

  const getEtiketler = (etiketler: string) => {
    if (!etiketler) return null
    return etiketler.split(",").map((etiket, index) => (
      <Badge key={index} variant="outline" className="text-xs mr-1">
        {etiket.trim()}
      </Badge>
    ))
  }

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="Seans Notları" description="Seans notlarını kaydedin ve yönetin">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Not
        </Button>
      </PageHeader>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Toplam Not</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{seansNotlari.length}</div>
            <p className="text-xs text-muted-foreground">Kayıtlı not</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tamamlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {seansNotlari.filter((n) => n.durum === "Tamamlandı").length}
            </div>
            <p className="text-xs text-muted-foreground">Hazır not</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Taslak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {seansNotlari.filter((n) => n.durum === "Taslak").length}
            </div>
            <p className="text-xs text-muted-foreground">Devam eden</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bu Hafta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">5</div>
            <p className="text-xs text-muted-foreground">Yeni not</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Seans Notları Listesi"
        columns={columns}
        data={seansNotlari.map((item) => ({
          ...item,
          durum: getDurumBadge(item.durum),
          etiketler: getEtiketler(item.etiketler),
        }))}
        onAdd={() => setShowForm(true)}
        onEdit={setEditingItem}
        onDelete={handleDelete}
        onImport={handleImport}
      />

      {/* Not Ekleme/Düzenleme Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Not Düzenle" : "Yeni Seans Notu"}</DialogTitle>
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

      {/* Not Görüntüleme Dialog */}
      <Dialog open={!!viewingNote} onOpenChange={() => setViewingNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seans Notu Detayı</DialogTitle>
          </DialogHeader>
          {viewingNote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Danışan</label>
                  <p className="text-sm text-muted-foreground">{viewingNote.danisan}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tarih</label>
                  <p className="text-sm text-muted-foreground">{viewingNote.tarih}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Başlık</label>
                <p className="text-sm text-muted-foreground">{viewingNote.baslik}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Notlar</label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewingNote.notlar}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Etiketler</label>
                <div className="mt-1">{getEtiketler(viewingNote.etiketler)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
