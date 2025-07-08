import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Activity, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Toplam Satış",
    value: "₺125.430",
    change: "+20.1%",
    changeText: "geçen aydan",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Aktif Kullanıcılar",
    value: "2.350",
    change: "+18.1%",
    changeText: "geçen aydan",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Dönüşüm Oranı",
    value: "%12.5",
    change: "+1.9%",
    changeText: "geçen aydan",
    icon: Activity,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
]

export function StatCards() {
  return (
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
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingUp className={`h-2 w-2 ${stat.color}`} />
              <span className={stat.color}>{stat.change}</span>
              <span>{stat.changeText}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
