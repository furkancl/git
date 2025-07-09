"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export default function TestCSVPage() {
  const [danisanData, setDanisanData] = useState<Record<string, any>[]>([])
  const [giderData, setGiderData] = useState<Record<string, any>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Danışan ödemeleri
        const danisanResponse = await fetch('/api/csv-data?type=danisan-odemeleri')
        if (danisanResponse.ok) {
          const danisanResult = await danisanResponse.json()
          setDanisanData(danisanResult.data.slice(0, 10)) // İlk 10 kayıt
        }
        
        // Giderler
        const giderResponse = await fetch('/api/csv-data?type=giderler')
        if (giderResponse.ok) {
          const giderResult = await giderResponse.json()
          setGiderData(giderResult.data.slice(0, 10)) // İlk 10 kayıt
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Veriler yükleniyor...</span>
      </div>
    )
  }

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">CSV Veri Test Sayfası</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Danışan Ödemeleri */}
        <Card>
          <CardHeader>
            <CardTitle>Danışan Ödemeleri (İlk 10 Kayıt)</CardTitle>
            <Badge variant="secondary">{danisanData.length} kayıt</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {danisanData.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="font-medium">{item.adiSoyadi}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.tarih} - {item.terapist}
                  </div>
                  <div className="text-sm">
                    {item.hizmetBedeli} - {item.odemeYontemi}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Giderler */}
        <Card>
          <CardHeader>
            <CardTitle>Giderler (İlk 10 Kayıt)</CardTitle>
            <Badge variant="secondary">{giderData.length} kayıt</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {giderData.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="font-medium">{item.giderCesidi}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.tarih} - {item.giderTuru}
                  </div>
                  <div className="text-sm">
                    {item.harcamaTutari} - {item.odemeSekli}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.aciklama}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
} 