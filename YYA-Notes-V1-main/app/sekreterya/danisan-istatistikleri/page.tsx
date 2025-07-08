"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, TrendingUp, Download, Filter } from "lucide-react"

const istatistikData = {
  toplamDanisan: 45,
  aktifDanisan: 32,
  yeniDanisan: 8,
  tamamlananTedavi: 13,
  ortalamaSeansSayisi: 12,
  tedaviBasariOrani: 78,
}

const yasGruplari = [
  { grup: "18-25", sayi: 12, yuzde: 27 },
  { grup: "26-35", sayi: 18, yuzde: 40 },
  { grup: "36-45", sayi: 10, yuzde: 22 },
  { grup: "46+", sayi: 5, yuzde: 11 },
]

const taniDagilimi = [
  { tani: "Anksiyete Bozuklukları", sayi: 15, yuzde: 33 },
  { tani: "Depresif Bozukluklar", sayi: 12, yuzde: 27 },
  { tani: "İlişki Sorunları", sayi: 8, yuzde: 18 },
  { tani: "Travma ve Stres", sayi: 6, yuzde: 13 },
  { tani: "Diğer", sayi: 4, yuzde: 9 },
]

const aylikTrend = [
  { ay: "Ekim", yeni: 6, aktif: 28, tamamlanan: 4 },
  { ay: "Kasım", yeni: 7, aktif: 30, tamamlanan: 5 },
  { ay: "Aralık", yeni: 5, aktif: 29, tamamlanan: 6 },
  { ay: "Ocak", yeni: 8, aktif: 32, tamamlanan: 3 },
]

export default function DanisanIstatistikleriPage() {
  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="Danışan İstatistikleri" description="Detaylı danışan analizi ve raporları">
        <div className="flex space-x-2">
          <Select defaultValue="bu-ay">
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
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtrele
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
        </div>
      </PageHeader>

      {/* Ana İstatistikler */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Toplam Danışan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{istatistikData.toplamDanisan}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Aktif Danışan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{istatistikData.aktifDanisan}</div>
            <p className="text-xs text-muted-foreground">Devam eden tedavi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Yeni Danışan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{istatistikData.yeniDanisan}</div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tamamlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{istatistikData.tamamlananTedavi}</div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ort. Seans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{istatistikData.ortalamaSeansSayisi}</div>
            <p className="text-xs text-muted-foreground">Seans/danışan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Başarı Oranı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">%{istatistikData.tedaviBasariOrani}</div>
            <p className="text-xs text-muted-foreground">Tedavi başarısı</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Yaş Grupları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Yaş Grupları Dağılımı</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {yasGruplari.map((grup, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{grup.grup} yaş</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{grup.sayi} kişi</span>
                      <Badge variant="secondary">%{grup.yuzde}</Badge>
                    </div>
                  </div>
                  <Progress value={grup.yuzde} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tanı Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Tanı Dağılımı</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taniDagilimi.map((tani, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{tani.tani}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{tani.sayi} kişi</span>
                      <Badge variant="secondary">%{tani.yuzde}</Badge>
                    </div>
                  </div>
                  <Progress value={tani.yuzde} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Aylık Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Aylık Trend Analizi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aylikTrend.map((ay, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{ay.ay} 2024</span>
                    <span className="text-sm text-muted-foreground">Toplam: {ay.yeni + ay.aktif}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-green-600">{ay.yeni}</div>
                      <div className="text-xs text-muted-foreground">Yeni</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{ay.aktif}</div>
                      <div className="text-xs text-muted-foreground">Aktif</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-orange-600">{ay.tamamlanan}</div>
                      <div className="text-xs text-muted-foreground">Tamamlanan</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cinsiyet ve Medeni Durum */}
        <Card>
          <CardHeader>
            <CardTitle>Demografik Bilgiler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Cinsiyet Dağılımı</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Kadın</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">28 kişi</span>
                      <Badge variant="secondary">%62</Badge>
                    </div>
                  </div>
                  <Progress value={62} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Erkek</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">17 kişi</span>
                      <Badge variant="secondary">%38</Badge>
                    </div>
                  </div>
                  <Progress value={38} className="h-2" />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Medeni Durum</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="font-medium">18</div>
                    <div className="text-xs text-muted-foreground">Bekar</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="font-medium">22</div>
                    <div className="text-xs text-muted-foreground">Evli</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="font-medium">4</div>
                    <div className="text-xs text-muted-foreground">Boşanmış</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="font-medium">1</div>
                    <div className="text-xs text-muted-foreground">Dul</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
