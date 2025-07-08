import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, User, FileText, Users, Heart } from "lucide-react"

const todaysEvents = [
  {
    id: 1,
    time: "09:00",
    title: "Bireysel Terapi",
    client: "Ayşe K.",
    type: "therapy",
    status: "confirmed",
  },
  {
    id: 2,
    time: "14:00",
    title: "Çift Terapisi",
    client: "Zeynep & Ali B.",
    type: "couple",
    status: "pending",
  },
  {
    id: 3,
    time: "15:30",
    title: "İlk Görüşme",
    client: "Fatma D.",
    type: "initial",
    status: "confirmed",
  },
]

const getEventIcon = (type: string) => {
  switch (type) {
    case "therapy":
      return User
    case "assessment":
      return FileText
    case "couple":
      return Users
    case "initial":
      return Heart
    default:
      return Calendar
  }
}

const getEventColor = (type: string) => {
  switch (type) {
    case "therapy":
      return "bg-blue-100 text-blue-800"
    case "assessment":
      return "bg-purple-100 text-purple-800"
    case "couple":
      return "bg-pink-100 text-pink-800"
    case "initial":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "confirmed":
      return "Onaylandı"
    case "pending":
      return "Bekliyor"
    default:
      return "Bilinmiyor"
  }
}

export function TodaysEvents() {
  const currentTime = new Date()
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()

  const isEventActive = (eventTime: string) => {
    const [hour, minute] = eventTime.split(":").map(Number)
    const eventMinutes = hour * 60 + minute
    const currentMinutes = currentHour * 60 + currentMinute
    return currentMinutes >= eventMinutes && currentMinutes < eventMinutes + 50
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Bugünün Etkinlikleri</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs px-1.5 py-0.5">
            {todaysEvents.length}
          </Badge>
        </div>
        <CardDescription className="text-xs">Bugün için planlanan randevular</CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        {todaysEvents.length > 0 ? (
          <div className="space-y-1.5">
            {todaysEvents.map((event) => {
              const EventIcon = getEventIcon(event.type)
              const isActive = isEventActive(event.time)

              return (
                <div
                  key={event.id}
                  className={`
                    p-2 rounded border transition-all duration-200 hover:shadow-sm
                    ${isActive ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-accent/50"}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5">
                      <div className={`p-0.5 rounded ${getEventColor(event.type)}`}>
                        <EventIcon className="h-2.5 w-2.5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-xs">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">{event.client}</p>
                      </div>
                    </div>
                    {isActive && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-1 py-0">
                        Aktif
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-2 w-2 text-muted-foreground" />
                      <span className="font-medium">{event.time}</span>
                    </div>
                    <Badge variant="secondary" className={`${getStatusColor(event.status)} text-xs px-1 py-0`}>
                      {getStatusLabel(event.status)}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Calendar className="h-6 w-6 mx-auto mb-1 opacity-50" />
            <p className="text-xs">Bugün için randevu yok</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
