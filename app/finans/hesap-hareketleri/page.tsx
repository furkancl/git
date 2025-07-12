"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { FormBuilder } from "@/components/form-builder"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useHesapHareketleri } from '@/hooks/use-csv-data'

const columns = [
  { key: 'tarih', label: 'Tarih', sortable: true },
  { key: 'islem', label: 'İşlem' },
  { key: 'hesap', label: 'Hesap' },
  { key: 'tutar', label: 'Tutar', sortable: true },
  { key: 'aciklama', label: 'Açıklama' },
  { key: 'kategori', label: 'Kategori' },
]

const formFields = [
  { name: "tarih", label: "Tarih", type: "date" as const, required: true },
  { name: "islem", label: "İşlem", type: "text" as const, required: true },
  { name: "hesap", label: "Hesap", type: "text" as const, required: true },
  { name: "tutar", label: "Tutar", type: "number" as const, required: true },
  { name: "aciklama", label: "Açıklama", type: "textarea" as const, required: false },
  {
    name: "kategori",
    label: "Kategori",
    type: "select" as const,
    options: ["Gelir", "Gider", "Transfer", "Diğer"],
    required: true,
  },
]

export default function HesapHareketleriPage() {
  const { data, loading, error } = useHesapHareketleri()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Özetler için hesaplamalar - ham veriyle
  const toplamGelir = data.filter(d => d.kategori?.toLowerCase().includes('gelir') || d.islem?.toLowerCase().includes('giriş')).reduce((sum, d) => sum + (parseFloat((d.tutar || '0').replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')) || 0), 0)
  const toplamGider = data.filter(d => d.kategori?.toLowerCase().includes('gider') || d.islem?.toLowerCase().includes('çıkış')).reduce((sum, d) => sum + (parseFloat((d.tutar || '0').replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')) || 0), 0)
  const netAkis = toplamGelir - toplamGider;

  const handleSubmit = (formData: any) => {
    if (editingItem) {
      // Handle update - şimdilik sadece console'a yazdır
      console.log("Güncellenecek hesap hareketi:", { ...editingItem, ...formData })
    } else {
      // Handle create - şimdilik sadece console'a yazdır
      console.log("Yeni hesap hareketi:", formData)
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const handleDelete = (item: any) => {
    // Handle delete - şimdilik sadece console'a yazdır
    console.log("Silinecek hesap hareketi:", item)
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <PageHeader title="Hesap Hareketleri" description="Tüm gelir ve gider hareketlerini CSV'den görüntüleyin" />

      {/* Özet Kartlar */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₺{toplamGelir.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +% geçen aya göre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₺{toplamGider.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -% geçen aya göre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Nakit Akışı</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₺{netAkis.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İşlem Sayısı</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {data.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-muted-foreground">Toplam hareket</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div>Yükleniyor...</div>
      ) : error ? (
        <div>Hata: {error}</div>
      ) : (
        <DataTable
          title="Hesap Hareketleri"
          columns={columns}
          data={data}
          onAdd={() => setShowForm(true)}
          onEdit={setEditingItem}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Hesap Hareketi Düzenle" : "Yeni Hesap Hareketi"}</DialogTitle>
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
