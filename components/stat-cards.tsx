import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Baby } from "lucide-react"
import { useDanisanOdemeleri, useCocukDanisanOdemeleri } from "@/hooks/use-csv-data"
import { subDays, isAfter } from "date-fns"

export function StatCards() {
  const { data: danisanlar, loading: danisanLoading } = useDanisanOdemeleri()
  const { data: cocukDanisanlar, loading: cocukLoading } = useCocukDanisanOdemeleri()

  // Filter out empty or whitespace-only names
  const validDanisanlar = danisanlar.filter(d => d.adiSoyadi && d.adiSoyadi.trim() !== "")
  const toplamKayit = danisanlar.length
  // Unique non-empty names
  const uniqueNonEmptyNames = new Set(danisanlar.filter(d => d.adiSoyadi && d.adiSoyadi.trim() !== "").map(d => d.adiSoyadi))
  const uniqueNonEmptyCount = uniqueNonEmptyNames.size
  // Empty or whitespace-only names
  const emptyNameCount = danisanlar.filter(d => !d.adiSoyadi || d.adiSoyadi.trim() === "").length
  // Total unique: sum of both
  const toplamDanisan = uniqueNonEmptyCount + emptyNameCount
  const tekrarEdenKayit = toplamKayit - toplamDanisan

  // Aktif danışan: Son 60 gün içinde ödeme yapmış benzersiz danışanlar
  const now = new Date()
  const last60Days = subDays(now, 60)
  const aktifDanisanSet = new Set<string>()
  danisanlar.forEach(d => {
    if (d.odemeTarihi && d.odenenUcret && d.odenenUcret.trim() !== "" && d.odemeTarihi.includes(".")) {
      const [day, month, year] = d.odemeTarihi.split(".")
      const tarih = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
      if (isAfter(tarih, last60Days)) {
        aktifDanisanSet.add(d.adiSoyadi)
      }
    }
  })
  const aktifDanisan = aktifDanisanSet.size

  // Çocuk danışan: çocuk csv'den benzersiz isim sayısı
  const toplamCocukDanisan = new Set(cocukDanisanlar.map(d => d.adiSoyadi)).size

  // En çok tekrar eden isim
  const nameCounts = danisanlar.reduce((acc, d) => {
    const key = d.adiSoyadi
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  let mostRepeatedName = ""
  let mostRepeatedCount = 0
  for (const [name, count] of Object.entries(nameCounts)) {
    if (count > mostRepeatedCount) {
      mostRepeatedName = name
      mostRepeatedCount = count
    }
  }

  const stats = [
    {
      title: "Toplam Danışan",
      value: danisanLoading ? "..." : toplamDanisan,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Aktif Danışan",
      value: danisanLoading ? "..." : aktifDanisan,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Çocuk Danışan",
      value: cocukLoading ? "..." : toplamCocukDanisan,
      icon: Baby,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-1 rounded ${stat.bgColor}`}>
                <stat.icon className={`h-3 w-3 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0.5 pb-2">
              <div className="text-lg font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Toplam kayıt: <b>{toplamKayit}</b> | Benzersiz danışan: <b>{uniqueNonEmptyCount}</b>{emptyNameCount > 0 ? ` | 'Veri Yok' kayıt: ${emptyNameCount}` : ""}
      </div>
    </>
  )
}
