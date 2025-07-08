"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Download } from "lucide-react"

const initialSeansListesi = [
  {
    id: 1,
    danisan: "Ayşe Kaya",
    tarih: "2024-01-20",
    saat: "14:00",
    sure: "50 dk",
    tip: "Bireysel Terapi",
    durum: "Tamamlandı",
    psikolog: "Dr. Ahmet Yılmaz",
    ucret: "₺300",
  },
  {
    id: 2,
    danisan: "Mehmet Demir",
    tarih: "2024-01-21",
    saat: "16:00",
    sure: "60 dk",
    tip: "Çift Terapisi",
    durum: "Tamamlandı",
    psikolog: "Dr. Ayşe Demir",
    ucret: "₺450",
  },
  {
    id: 3,
    danisan: "Zeynep Yılmaz",
    tarih: "2024-01-22",
    saat: "10:00",
    sure: "45 dk",
    tip: "MMPI Testi",
    durum: "Planlandı",
    psikolog: "Dr. Ahmet Yılmaz",
    ucret: "₺200",
  },
  {
    id: 4,
    danisan: "Can Özkan",
    tarih: "2024-01-23",
    saat: "15:30",
    sure: "50 dk",
    tip: "Bireysel Terapi",
    durum: "İptal Edildi",
    psikolog: "Dr. Fatma Özkan",
    ucret: "₺300",
  },
]

const columns = [
  { key: "danisan", label: "Danışan", sortable: true },
  { key: "tarih", label: "Tarih", sortable: true },
  { key: "saat", label: "Saat" },
  { key: "sure", label: "Süre" },
  { key: "tip", label: "Seans Tipi" },
  { key: "psikolog", label: "Psikolog" },
  { key: "durum", label: "Durum" },
  { key: "ucret", label: "Ücret", sortable: true },
]

export default function SeansListePage() {
  const [seansListesi, setSeansListesi] = useState(initialSeansListesi)
  const [selectedPeriod, setSelectedPeriod] = useState("bu-ay")
  const [selectedStatus, setSelectedStatus] = useState("tumu")

  const handleImport = (importedData: any[]) => {
    const formattedData = importedData.map((item, index) => ({
      id: Math.max(...seansListesi.map((s) => s.id)) + index + 1,
      danisan: item.danisan || item.Danisan || "",
      tarih: item.tarih || item.Tarih || "",
      saat: item.saat || item.Saat || "",
      sure: item.sure || item.Süre || "50 dk",
      tip: item.tip || item.Tip || "Bireysel Terapi",
      durum: item.durum || item.Durum || "Planlandı",
      psikolog: item.psikolog || item.Psikolog || "Dr. Ahmet Yılmaz",
      ucret: item.ucret || item.Ücret || "₺300",
    }))
    setSeansListesi((prev) => [...prev, ...formattedData])
  }

  const getDurumBadge = (durum: string) => {
    const variants = {
      Tamamlandı: "default",
      Planlandı: "secondary",
      "İptal Edildi": "destructive",
      Beklemede: "destructive",
    }
    return <Badge variant={variants[durum as keyof typeof variants] as any}>{durum}</Badge>
  }

  // İstatistikler
  const tamamlananSeanslar = seansListesi.filter((s) => s.durum === "Tamamlandı")
  const iptalEdilenSeanslar = seansListesi.filter((s) => s.durum === "İptal Edildi")
  const toplamGelir = tamamlananSeanslar.reduce(
    (sum, seans) => sum + Number.parseInt(seans.ucret.replace("₺", "").replace(",", "")),
    0,
  )

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="Seans Listesi" description="Tüm seansları görüntüleyin ve yönetin">
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bu-hafta">Bu Hafta</SelectItem>
              <SelectItem value="bu-ay">Bu Ay</SelectItem>
              <SelectItem value="gecen-ay">Geçen Ay</SelectItem>
              <SelectItem value="bu-yil">Bu Yıl</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tumu">Tüm Durumlar</SelectItem>
              <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
              <SelectItem value="planlandi">Planlandı</SelectItem>
              <SelectItem value="iptal">İptal Edildi</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Rapor Al
          </Button>
        </div>
      </PageHeader>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Seans</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{seansListesi.length}</div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{tamamlananSeanslar.length}</div>
            <p className="text-xs text-muted-foreground">Başarılı seans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İptal Edilen</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{iptalEdilenSeanslar.length}</div>
            <p className="text-xs text-muted-foreground">
              İptal oranı: %{((iptalEdilenSeanslar.length / seansListesi.length) * 100).toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₺{toplamGelir.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tamamlanan seanslar</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Seans Geçmişi"
        columns={columns}
        data={seansListesi.map((item) => ({
          ...item,
          durum: getDurumBadge(item.durum),
        }))}
        onImport={handleImport}
      />
    </main>
  )
}
