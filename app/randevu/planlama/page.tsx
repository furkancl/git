"use client"
import { Header } from "@/components/header"
import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Dummy danışan ve randevu verisi
const initialClients = [
  { id: 1, name: "Ayşe Yılmaz" },
  { id: 2, name: "Mehmet Demir" },
  { id: 3, name: "Zeynep Kaya" },
]
const initialAppointments = [
  { id: 1, clientId: 1, day: 1, hour: 10, minute: 0, duration: 60, desc: "Bireysel seans" }, // Pazartesi 10:00-11:00
  { id: 2, clientId: 2, day: 3, hour: 14, minute: 30, duration: 45, desc: "Aile danışmanlığı" }, // Çarşamba 14:30-15:15
  { id: 3, clientId: 3, day: 5, hour: 11, minute: 15, duration: 30, desc: "Çocuk seansı" }, // Cuma 11:15-11:45
  { id: 4, clientId: 1, day: 2, hour: 16, minute: 0, duration: 60, desc: "Takip görüşmesi" }, // Salı 16:00-17:00
]
const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
const hours = Array.from({ length: 10 }, (_, i) => 9 + i) // 09:00-18:00
const minutes = [0, 15, 30, 45]
const durations = [15, 30, 45, 60, 90]

export default function RandevuPlanlamaPage() {
  const [clients] = useState(initialClients)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [selectedAppointment, setSelectedAppointment] = useState(null as null | typeof appointments[0])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newClientId, setNewClientId] = useState<string>("")
  const [newDay, setNewDay] = useState<string>("")
  const [newHour, setNewHour] = useState<string>("")
  const [newMinute, setNewMinute] = useState<string>("")
  const [newDuration, setNewDuration] = useState<string>("")
  const [newDesc, setNewDesc] = useState("")
  const [draggedId, setDraggedId] = useState<number|null>(null)

  // 15 dakikalık slotlar
  const timeSlots = [] as { hour: number, minute: number }[]
  for (let h of hours) for (let m of minutes) timeSlots.push({ hour: h, minute: m })
  timeSlots.push({ hour: 18, minute: 30 })

  const handleAddAppointment = () => {
    if (!newClientId || newDay === "" || newHour === "" || newMinute === "" || newDuration === "" || !newDesc) return
    setAppointments(prev => [
      ...prev,
      {
        id: Date.now(),
        clientId: Number(newClientId),
        day: Number(newDay),
        hour: Number(newHour),
        minute: Number(newMinute),
        duration: Number(newDuration),
        desc: newDesc,
      },
    ])
    setIsAddDialogOpen(false)
    setNewClientId("")
    setNewDay("")
    setNewHour("")
    setNewMinute("")
    setNewDuration("")
    setNewDesc("")
  }

  // Drag & drop logic
  const handleDragStart = (id: number) => setDraggedId(id)
  const handleDrop = (dayIdx: number, hour: number, minute: number) => {
    if (draggedId == null) return
    setAppointments(prev => prev.map(appt =>
      appt.id === draggedId ? { ...appt, day: dayIdx, hour, minute } : appt
    ))
    setDraggedId(null)
  }

  // Randevunun slotta başlama ve bitişini hesapla (slot indexleri)
  const getSlotIndex = (hour: number, minute: number) => (hour - hours[0]) * 4 + minutes.indexOf(minute)
  const getSlotCount = (duration: number) => Math.ceil(duration / 15)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start p-4 bg-gray-50">
        <div className="w-full max-w-5xl flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Randevu Planlama</h1>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddDialogOpen(true)}>
            + Randevu Planla
          </Button>
        </div>
        <div className="overflow-x-auto w-full max-w-5xl">
          <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-md">
            <colgroup>
              <col style={{ width: '60px' }} />
              {days.map((_, i) => (
                <col key={i} style={{ width: '120px' }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="sticky top-0 left-0 z-20 bg-gray-100 border-b border-r border-gray-200 h-10 w-15" />
                {days.map((day, i) => (
                  <th key={day} className="sticky top-0 z-20 bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-700 h-10 px-2 text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, slotIdx) => (
                <tr key={slotIdx}>
                  <td className="sticky left-0 z-10 bg-gray-100 border-b border-r border-gray-200 h-6 text-xs text-gray-500 font-semibold text-center">{slot.hour}:{slot.minute.toString().padStart(2, "0")}</td>
                  {days.map((_, dayIdx) => {
                    // O slotta o güne ait bir randevu başlıyor mu?
                    const appt = appointments.find(a => a.day === dayIdx && a.hour === slot.hour && a.minute === slot.minute)
                    if (appt) {
                      const client = clients.find(c => c.id === appt.clientId)
                      const slotCount = getSlotCount(appt.duration)
                      return (
                        <td
                          key={`${dayIdx}-${slotIdx}`}
                          rowSpan={slotCount}
                          className="relative z-20 p-0 align-top"
                          style={{ minWidth: 80 }}
                          draggable
                          onDragStart={() => handleDragStart(appt.id)}
                          onDragEnd={() => setDraggedId(null)}
                          onClick={() => setSelectedAppointment(appt)}
                        >
                          <div className="bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg px-2 py-1 text-xs font-medium shadow border border-blue-200 cursor-pointer h-full flex flex-col justify-center transition-all select-none">
                            <div className="truncate font-semibold">{client?.name}</div>
                            <div className="text-[10px] text-blue-700 truncate">{appt.desc}</div>
                            <div className="text-[10px] text-gray-500">{appt.hour}:{appt.minute.toString().padStart(2, "0")} - {(() => {
                              const end = new Date(0,0,0,appt.hour,appt.minute+appt.duration)
                              return `${end.getHours()}:${end.getMinutes().toString().padStart(2,"0")}`
                            })()}</div>
                          </div>
                        </td>
                      )
                    }
                    // Eğer bu slot, o güne ait bir randevunun kapsama alanındaysa (başlangıcı değilse), hiç hücre render etme
                    const isCovered = appointments.some(a => {
                      if (a.day !== dayIdx) return false
                      const startIdx = getSlotIndex(a.hour, a.minute)
                      const endIdx = startIdx + getSlotCount(a.duration)
                      return slotIdx > startIdx && slotIdx < endIdx
                    })
                    if (isCovered) return null
                    // Gerçekten boş slot
                    return (
                      <td
                        key={`${dayIdx}-${slotIdx}`}
                        className="h-6 border-b border-gray-100 text-center align-middle p-0"
                        onDragOver={e => draggedId && e.preventDefault()}
                        onDrop={() => handleDrop(dayIdx, slot.hour, slot.minute)}
                        style={{ minWidth: 80 }}
                      />
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Randevu Detay Modal */}
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Randevu Detayı</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-2">
                <div><b>Danışan:</b> {clients.find(c => c.id === selectedAppointment.clientId)?.name}</div>
                <div><b>Gün:</b> {days[selectedAppointment.day]}</div>
                <div><b>Saat:</b> {selectedAppointment.hour}:{selectedAppointment.minute.toString().padStart(2,"0")}</div>
                <div><b>Süre:</b> {selectedAppointment.duration} dk</div>
                <div><b>Açıklama:</b> {selectedAppointment.desc}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Randevu Planla Modal */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Randevu Planla</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="client" className="text-right font-medium">Danışan</label>
                <Select value={newClientId} onValueChange={setNewClientId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Danışan seç" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="day" className="text-right font-medium">Gün</label>
                <Select value={newDay} onValueChange={setNewDay}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Gün seç" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day, idx) => (
                      <SelectItem key={day} value={idx.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="hour" className="text-right font-medium">Saat</label>
                <Select value={newHour} onValueChange={setNewHour}>
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Saat" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>{hour}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newMinute} onValueChange={setNewMinute}>
                  <SelectTrigger className="col-span-1">
                    <SelectValue placeholder=":00" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((min) => (
                      <SelectItem key={min} value={min.toString()}>{min.toString().padStart(2,"0")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="duration" className="text-right font-medium">Süre (dk)</label>
                <Select value={newDuration} onValueChange={setNewDuration}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Süre seç" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d} value={d.toString()}>{d} dk</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="desc" className="text-right font-medium">Açıklama</label>
                <Textarea
                  id="desc"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="col-span-3"
                  placeholder="Randevu açıklaması"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>İptal</Button>
              <Button
                onClick={handleAddAppointment}
                disabled={!newClientId || newDay === "" || newHour === "" || newMinute === "" || !newDuration || !newDesc}
              >Ekle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
