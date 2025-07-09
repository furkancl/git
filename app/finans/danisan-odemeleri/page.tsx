"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { FormBuilder } from "@/components/form-builder"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DanisanOdeme, formatCurrency, parseDate } from "@/lib/csv-parser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

// CSV verilerini doğrudan import et
let csvData: DanisanOdeme[] = []

const columns = [
  { key: "danisan", label: "Danışan", sortable: true },
  { key: "tarih", label: "Tarih", sortable: true },
  { key: "seans", label: "Seans Türü" },
  { key: "tutar", label: "Tutar", sortable: true },
  { key: "durum", label: "Durum" },
  { key: "odeme_yontemi", label: "Ödeme Yöntemi" },
]

const formFields = [
  {
    name: "danisan",
    label: "Danışan",
    type: "select" as const,
    options: ["Ayşe Kaya", "Mehmet Demir", "Zeynep Yılmaz"],
    required: true,
  },
  { name: "tarih", label: "Tarih", type: "date" as const, required: true },
  {
    name: "seans",
    label: "Seans Türü",
    type: "select" as const,
    options: ["Bireysel Terapi", "Çift Terapisi", "MMPI Testi", "SCİD Testi"],
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
  {
    name: "odeme_yontemi",
    label: "Ödeme Yöntemi",
    type: "select" as const,
    options: ["Nakit", "Kredi Kartı", "Havale", "EFT"],
    required: true,
  },
]

export default function DanisanOdemeleriPage() {
  const [odemelerData, setOdemelerData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // CSV verilerini yükle
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/csv-data?type=danisan-odemeleri')
        if (response.ok) {
          const result = await response.json()
          csvData = result.data
          
          // CSV verilerini DataTable formatına dönüştür
          const formattedData = csvData.map((item, index) => ({
            id: index + 1,
            danisan: item.adiSoyadi,
            tarih: item.tarih,
            seans: item.gorusmeTipi,
            tutar: formatCurrency(item.hizmetBedeli),
            durum: item.odemeYontemi ? "Ödendi" : "Beklemede",
            odeme_yontemi: item.odemeYontemi,
            terapist: item.terapist,
            danisan_turu: item.danisanTuru,
            odenen_ucret: formatCurrency(item.odenenUcret),
            borc: formatCurrency(item.danisanBorcu),
            aciklama: item.aciklama
          }))
          
          setOdemelerData(formattedData)
        }
      } catch (error) {
        console.error('CSV veri yükleme hatası:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCSVData()
  }, [])

  const handleSubmit = (data: Record<string, any>) => {
    if (editingItem) {
      setOdemelerData((prev: any[]) =>
        prev.map((item: any) => (item.id === editingItem.id ? { ...data, id: editingItem.id } : item)),
      )
    } else {
      const newId = Math.max(...odemelerData.map((item: any) => item.id)) + 1
      setOdemelerData((prev: any[]) => [...prev, { ...data, id: newId }])
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const handleImport = (importedData: any[]) => {
    console.log("İçeri aktarılan ödeme verileri:", importedData)

    const formattedData = importedData.map((item, index) => ({
      id: Math.max(...odemelerData.map((o: any) => o.id)) + index + 1,
      danisan: item.danisan || item.Danisan || "",
      tarih: item.tarih || item.Tarih || "",
      seans: item.seans || item.Seans || item["Seans Türü"] || "Bireysel Terapi",
      tutar: item.tutar || item.Tutar || "₺0",
      durum: item.durum || item.Durum || "Beklemede",
      odeme_yontemi: item.odeme_yontemi || item["Ödeme Yöntemi"] || item.odeme_yontemi || "Nakit",
    }))

    setOdemelerData((prev: any[]) => [...prev, ...formattedData])
  }

  const handleDelete = (item: any) => {
    setOdemelerData((prev: any[]) => prev.filter((odeme) => odeme.id !== item.id))
  }

  // İstatistikleri hesapla
  const totalOdemeler = odemelerData.length
  const totalGelir = odemelerData.reduce((sum: number, item: any) => {
    const tutar = parseFloat(item.tutar.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0
    return sum + tutar
  }, 0)
  
  const bekleyenOdemeler = odemelerData.filter((item: any) => item.durum === "Beklemede").length

  if (loading) {
    return (
      <main className="w-[85%] mx-auto px-4 py-6">
        <PageHeader title="Danışan Ödemeleri" description="Danışan ödeme kayıtlarını takip edin" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Veriler yükleniyor...</span>
        </div>
      </main>
    )
  }

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="Danışan Ödemeleri" description="Danışan ödeme kayıtlarını takip edin" />

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ödeme</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOdemeler}</div>
            <p className="text-xs text-muted-foreground">Kayıt sayısı</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGelir.toString())}</div>
            <p className="text-xs text-muted-foreground">Toplam kazanç</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Ödemeler</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bekleyenOdemeler}</div>
            <p className="text-xs text-muted-foreground">Ödenmemiş kayıtlar</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Ödeme Listesi"
        columns={columns}
        data={odemelerData}
        onAdd={() => setShowForm(true)}
        onEdit={setEditingItem}
        onDelete={handleDelete}
        onImport={handleImport}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Ödeme Kaydı</DialogTitle>
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
