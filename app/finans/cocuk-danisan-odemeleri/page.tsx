"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { FormBuilder } from "@/components/form-builder"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCocukDanisanOdemeleri } from '@/hooks/use-csv-data'

const columns = [
  { key: 'kayitTarihi', label: 'Kayıt Tarihi', sortable: true },
  { key: 'odemeTarihi', label: 'Ödeme Tarihi', sortable: true },
  { key: 'adiSoyadi', label: 'Adı Soyadı', sortable: true },
  { key: 'seansSayisi', label: 'Seans Sayısı' },
  { key: 'odemeYontemi', label: 'Ödeme Yöntemi' },
  { key: 'terapist', label: 'Terapist' },
  { key: 'gorusmeTipi', label: 'Görüşme Tipi' },
  { key: 'fiyatTarifesi', label: 'Fiyat Tarifesi' },
  { key: 'danisanTuru', label: 'Danışan Türü' },
  { key: 'hizmetBedeli', label: 'Hizmet Bedeli' },
  { key: 'odenenUcret', label: 'Ödenen Ücret' },
  { key: 'danisanBorcu', label: 'Danışan Borcu' },
  { key: 'aciklama', label: 'Açıklama' },
]

const formFields = [
  { name: "cocuk_adi", label: "Çocuk Adı", type: "text" as const, required: true },
  { name: "veli_adi", label: "Veli Adı", type: "text" as const, required: true },
  { name: "yas", label: "Yaş", type: "number" as const, required: true },
  { name: "tarih", label: "Tarih", type: "date" as const, required: true },
  {
    name: "seans",
    label: "Seans Türü",
    type: "select" as const,
    options: ["Oyun Terapisi", "Davranış Terapisi", "Aile Terapisi", "Grup Terapisi"],
    required: true,
  },
  { name: "tutar", label: "Tutar", type: "number" as const, required: true },
  {
    name: "durum",
    label: "Durum",
    type: "select" as const,
    options: ["Beklemede", "Ödendi", "Gecikmiş"],
    required: true,
  },
]

export default function CocukDanisanOdemeleriPage() {
  const { data, loading, error } = useCocukDanisanOdemeleri()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const handleSubmit = (data: any) => {
    if (editingItem) {
      // Handle update - şimdilik sadece console'a yazdır
      console.log("Güncellenecek veri:", { ...(editingItem as any), ...data })
    } else {
      // Handle create - şimdilik sadece console'a yazdır
      console.log("Yeni veri:", data)
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const handleImport = (importedData: any[]) => {
    console.log("İçeri aktarılan çocuk danışan verileri:", importedData)
    // Handle import - şimdilik sadece console'a yazdır
  }

  const handleDelete = (item: any) => {
    console.log("Silinecek çocuk danışan ödemesi:", item)
    // Handle delete - şimdilik sadece console'a yazdır
  }

  // Özetler için hesaplamalar - ham veriyle
  const toplamOdeme = data.reduce((sum, d) => sum + (parseFloat((d.odenenUcret || '0').replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')) || 0), 0)
  const toplamBorc = data.reduce((sum, d) => sum + (parseFloat((d.danisanBorcu || '0').replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')) || 0), 0)
  const toplamSeans = data.length
  const aktifDanisan = new Set(data.map(d => d.adiSoyadi)).size

  return (
    <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <PageHeader title="Çocuk Danışan Ödemeleri" description="Çocuk danışan ödeme kayıtlarını CSV'den takip edin" />
      <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Toplam Ödeme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₺{toplamOdeme.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">{toplamSeans} seans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Toplam Borç</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₺{toplamBorc.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">Borçlu seanslar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Aktif Danışan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{aktifDanisan}</div>
            <p className="text-xs text-muted-foreground">Toplam danışan</p>
          </CardContent>
        </Card>
      </div>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : error ? (
        <div>Hata: {error}</div>
      ) : (
        <DataTable
          title="Çocuk Danışan Ödeme Listesi"
          columns={columns}
          data={data}
          onAdd={() => setShowForm(true)}
          onEdit={setEditingItem}
          onDelete={handleDelete}
          onImport={handleImport}
        />
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Çocuk Danışan Ödeme Kaydı</DialogTitle>
          </DialogHeader>
          <FormBuilder
            title=""
            fields={formFields}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            initialData={editingItem || {}}
          />
        </DialogContent>
      </Dialog>
    </main>
  )
}
