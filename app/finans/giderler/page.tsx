"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { FormBuilder } from "@/components/form-builder"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Calendar, Loader2 } from "lucide-react"
import { Gider } from "@/lib/csv-parser"
import { formatCurrency } from "@/lib/utils"

let csvData: Gider[] = []

const columns = [
  { key: "tarih", label: "Tarih", sortable: true },
  { key: "kategori", label: "Kategori", sortable: true },
  { key: "aciklama", label: "Açıklama" },
  { key: "tutar", label: "Tutar", sortable: true },
  { key: "durum", label: "Durum" },
]

const formFields = [
  { name: "tarih", label: "Tarih", type: "date" as const, required: true },
  {
    name: "kategori",
    label: "Kategori",
    type: "select" as const,
    options: [
      "Yemek", "Kira", "Aidat", "Maaş", "Market", "Sarf Malzemesi", "Diğer", "Abdullah", "Fatura",
      "Araç", "Demirbaş", "Vergi", "Vakıf Giderleri", "Online Alışveriş", "SGK", "Tanıtım", "Yazılım", "Hediye"
    ],
    required: true,
  },
  { name: "aciklama", label: "Açıklama", type: "textarea" as const, required: true },
  { name: "tutar", label: "Tutar", type: "number" as const, required: true, placeholder: "0.00" },
  {
    name: "durum",
    label: "Durum",
    type: "select" as const,
    options: ["Beklemede", "Onaylandı", "Reddedildi"],
    required: true,
  },
]

export default function GiderlerPage() {
  const [giderlerData, setGiderlerData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  useEffect(() => {
    const loadCSVData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/csv-data?type=giderler')
        if (response.ok) {
          const result = await response.json()
          csvData = result.data

          const formattedData = csvData.map((item, index) => ({
            id: index + 1,
            tarih: item.tarih,
            kategori: item.giderCesidi,
            aciklama: item.aciklama,
            tutar: formatCurrency(parseTurkishCurrency(item.harcamaTutari || '')),
            durum: "Onaylandı",
            gider_turu: item.giderTuru,
            odeme_sekli: item.odemeSekli
          }))

          setGiderlerData(formattedData)
        }
      } catch (error) {
        console.error('CSV veri yükleme hatası:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCSVData()
  }, [])

  const parseTurkishCurrency = (str: string): number => {
    if (!str) return 0
    let cleaned = str.replace(/\s/g, '').replace(/[^\d.,-]/g, '')
    if (cleaned.includes('.') && cleaned.includes(',')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else if (cleaned.includes(',') && !cleaned.includes('.')) {
      cleaned = cleaned.replace(',', '.')
    }
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  const toplamGider = csvData.reduce((sum, item) => {
    const tutar = parseTurkishCurrency(item.harcamaTutari || '')
    return sum + tutar
  }, 0)

  const kategoriAnalizi = csvData.reduce(
    (acc: Record<string, { toplam: number; adet: number }>, item) => {
      const kategori = item.giderCesidi || 'Diğer'
      const tutar = parseTurkishCurrency(item.harcamaTutari || '')
      if (!acc[kategori]) {
        acc[kategori] = { toplam: 0, adet: 0 }
      }
      acc[kategori].toplam += tutar
      acc[kategori].adet += 1
      return acc
    },
    {}
  )

  const enYuksekKategori = Object.entries(kategoriAnalizi).reduce(
    (max, [kategori, data]) => (data.toplam > max.toplam ? { kategori, toplam: data.toplam } : max),
    { kategori: '', toplam: 0 }
  )

  const handleAdd = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDelete = (item: any) => {
    setGiderlerData((prev) => prev.filter((gider) => gider.id !== item.id))
  }

  const handleSubmit = (data: Record<string, any>) => {
    if (editingItem) {
      setGiderlerData((prev) =>
        prev.map((item) => (item.id === editingItem.id ? { ...data, id: editingItem.id } : item))
      )
    } else {
      const newId = Math.max(...giderlerData.map((item) => item.id), 0) + 1
      setGiderlerData((prev) => [...prev, { ...data, id: newId }])
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const handleImport = (importedData: any[]) => {
    const formattedData = importedData.map((item, index) => ({
      id: Math.max(...giderlerData.map((g: any) => g.id), 0) + index + 1,
      tarih: item.tarih || item.Tarih || '',
      kategori: item.kategori || item.Kategori || 'Diğer',
      aciklama: item.aciklama || item.Açıklama || '',
      tutar: formatCurrency(parseTurkishCurrency(item.tutar || item.Tutar || '0')),
      durum: item.durum || item.Durum || 'Beklemede',
    }))
    setGiderlerData((prev) => [...prev, ...formattedData])
  }

  if (loading) {
    return (
      <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <PageHeader title="Giderler" description="Tüm gider kayıtlarını görüntüleyin ve yönetin" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Veriler yükleniyor...</span>
        </div>
      </main>
    )
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <PageHeader title="Giderler" description="Tüm gider kayıtlarını görüntüleyin ve yönetin" />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(toplamGider)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Bu ay toplam
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Yüksek Kategori</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">{enYuksekKategori.kategori}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(enYuksekKategori.toplam)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Kategori Bazında Gider Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(kategoriAnalizi).map(([kategori, data]) => {
              const yuzde = ((data.toplam / toplamGider) * 100).toFixed(1)
              return (
                <div key={kategori} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium">{kategori}</span>
                    <p className="text-xs text-muted-foreground">{data.adet} gider</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(data.toplam)}</div>
                    <Badge variant="secondary">%{yuzde}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <DataTable
        title="Gider Listesi"
        columns={columns}
        data={giderlerData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onImport={handleImport}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Gider Düzenle" : "Yeni Gider Ekle"}</DialogTitle>
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
