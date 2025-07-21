"use client"

import { Header } from "@/components/header"
import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"

// Dummy danışan verisi
const initialClients = [
  { id: 1, name: "Ayşe Yılmaz" },
  { id: 2, name: "Mehmet Demir" },
  { id: 3, name: "Zeynep Kaya" },
]

// Dummy psikolog verisi
const initialPsychologists = [
  { id: 101, name: "Dr. Elif Yılmaz" },
  { id: 102, name: "Uzm. Psk. Can Demir" },
  { id: 103, name: "Psk. Zeynep Akın" },
]

// Dummy randevu verisi
const today = new Date()
const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Haftanın başlangıcı Pazartesi (1)

const initialAppointments = [
  {
    id: 1,
    clientId: 1,
    psychologistId: 101,
    date: addDays(startOfCurrentWeek, 0),
    hour: 10,
    minute: 0,
    duration: 60,
    desc: "Bireysel seans",
  }, // Pazartesi 10:00-11:00
  {
    id: 2,
    clientId: 2,
    psychologistId: 102,
    date: addDays(startOfCurrentWeek, 2),
    hour: 14,
    minute: 30,
    duration: 90,
    desc: "Aile danışmanlığı",
  }, // Çarşamba 14:30-16:00
  {
    id: 3,
    clientId: 3,
    psychologistId: 101,
    date: addDays(startOfCurrentWeek, 4),
    hour: 11,
    minute: 0,
    duration: 60,
    desc: "Çocuk seansı",
  }, // Cuma 11:00-12:00
  {
    id: 4,
    clientId: 1,
    psychologistId: 103,
    date: addDays(startOfCurrentWeek, 1),
    hour: 16,
    minute: 0,
    duration: 60,
    desc: "Takip görüşmesi",
  }, // Salı 16:00-17:00
  {
    id: 5,
    clientId: 2,
    psychologistId: 102,
    date: addDays(startOfCurrentWeek, 0), // Pazartesi
    hour: 10,
    minute: 0,
    duration: 60,
    desc: "Grup Terapisi", // Aynı saatte farklı psikolog
  },
  {
    id: 6,
    clientId: 3,
    psychologistId: 103,
    date: addDays(startOfCurrentWeek, 0), // Pazartesi
    hour: 10,
    minute: 15,
    duration: 45,
    desc: "Bireysel Danışmanlık", // Aynı gün, yakın saat
  },
]

const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
const hours = Array.from({ length: 10 }, (_, i) => 9 + i) // 09:00-18:00
const minutes = [0, 15, 30, 45]

const durations = [60, 90]

const timeSlots = [] as { hour: number; minute: number }[]
for (const h of hours) for (const m of minutes) timeSlots.push({ hour: h, minute: m })
timeSlots.push({ hour: 18, minute: 15 }) // Son slot

const SLOT_HEIGHT_PX = 24

// Psikologlara özel renk sınıfları
const psychologistColors = new Map<number, { light: string; dark: string }>()
psychologistColors.set(101, {
  light: "bg-green-50 hover:bg-green-100 text-green-700 border-green-100",
  dark: "dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-200 dark:border-green-800",
})
psychologistColors.set(102, {
  light: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-100",
  dark: "dark:bg-purple-900 dark:hover:bg-purple-800 dark:text-purple-200 dark:border-purple-800",
})
psychologistColors.set(103, {
  light: "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-100",
  dark: "dark:bg-yellow-900 dark:hover:bg-yellow-800 dark:text-yellow-200 dark:border-yellow-800",
})

// Bilinmeyen psikologlar için varsayılan renkler
const defaultColors = {
  light: "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-100",
  dark: "dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600",
}

function getPsychologistColorClasses(psychologistId: number) {
  const colors = psychologistColors.get(psychologistId) || defaultColors
  return `${colors.light} ${colors.dark}`
}

export default function RandevuPlanlamaPage() {
  const [clients] = useState(initialClients)
  const [psychologists] = useState(initialPsychologists)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [selectedAppointment, setSelectedAppointment] = useState(null as null | (typeof appointments)[0])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const [newClientId, setNewClientId] = useState<string>("")
  const [newPsychologistId, setNewPsychologistId] = useState<string>("")
  const [newDate, setNewDate] = useState<Date | undefined>(undefined)
  const [newHour, setNewHour] = useState<string>("")
  const [newMinute, setNewMinute] = useState<string>("")
  const [newDuration, setNewDuration] = useState<string>("")
  const [newDesc, setNewDesc] = useState("")
  const [draggedId, setDraggedId] = useState<number | null>(null)

  const currentWeekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    return days.map((_, i) => addDays(start, i))
  }, [])

  const handleAddAppointment = () => {
    if (!newClientId || !newPsychologistId || !newDate || newDuration.length === 0 || newDesc.trim().length === 0)
      return

    setAppointments((prev) => [
      ...prev,
      {
        id: Date.now(),
        clientId: Number(newClientId),
        psychologistId: Number(newPsychologistId),
        date: newDate,
        hour: newHour.length > 0 ? Number(newHour) : 9,
        minute: newMinute.length > 0 ? Number(newMinute) : 0,
        duration: Number(newDuration),
        desc: newDesc,
      },
    ])
    setIsAddDialogOpen(false)
    setNewClientId("")
    setNewPsychologistId("")
    setNewDate(undefined)
    setNewHour("")
    setNewMinute("")
    setNewDuration("")
    setNewDesc("")
  }

  const handleDragStart = (id: number) => setDraggedId(id)
  const handleDrop = (targetDate: Date, hour: number, minute: number) => {
    if (draggedId == null) return
    setAppointments((prev) =>
      prev.map((appt) => (appt.id === draggedId ? { ...appt, date: targetDate, hour, minute } : appt)),
    )
    setDraggedId(null)
  }

  const getEndTime = (hour: number, minute: number, duration: number) => {
    const start = new Date(0, 0, 0, hour, minute)
    const end = new Date(start.getTime() + duration * 60000)
    return { hour: end.getHours(), minute: end.getMinutes() }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start p-4 md:p-8">
        <div className="w-full max-w-5xl flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Randevu Planlama</h1>
          <Button
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition-colors"
            onClick={() => {
              setIsAddDialogOpen(true)
              setNewDate(currentWeekDays[0])
            }}
          >
            + Randevu Planla
          </Button>
        </div>

        {/* Haftalık Randevu Tablosu */}
        <div className="overflow-x-auto w-full max-w-5xl border border-gray-100 rounded-xl shadow-md bg-white dark:bg-gray-800 dark:border-gray-700">
          <table className="min-w-full">
            <colgroup>
              <col style={{ width: "60px" }} />
              {days.map((_, i) => (
                <col key={i} style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="sticky top-0 left-0 z-20 bg-gray-50 border-b border-r border-gray-100 h-10 w-15 dark:bg-gray-700 dark:border-gray-600" />
                {currentWeekDays.map((date, i) => (
                  <th
                    key={i}
                    className="sticky top-0 z-20 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-600 h-10 px-2 text-center dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  >
                    {days[i]}
                    <br />
                    <span className="font-normal text-[10px]">{format(date, "dd MMM", { locale: tr })}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, slotIdx) => {
                const displayTime = slot.minute === 0 || slot.minute === 30
                const isMajorHour = slot.minute === 0

                return (
                  <tr key={slotIdx}>
                    <td
                      className={`sticky left-0 z-10 bg-gray-50 border-b border-r border-gray-100 h-6 text-xs text-gray-500 font-semibold text-center dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 ${isMajorHour ? "border-t border-gray-200 dark:border-gray-600" : ""}`}
                      style={{ width: 60, minWidth: 60, maxWidth: 60 }}
                    >
                      {displayTime && `${slot.hour}:${slot.minute.toString().padStart(2, "0")}`}
                    </td>
                    {currentWeekDays.map((currentDayDate, dayIdx) => {
                      const appointmentsForSlot = appointments
                        .filter((appt) => {
                          const apptStartTimeInMinutes = appt.hour * 60 + appt.minute;
                          const apptEndTimeInMinutes = apptStartTimeInMinutes + appt.duration;
                          const slotStartTimeInMinutes = slot.hour * 60 + slot.minute;
                          const slotEndTimeInMinutes = slotStartTimeInMinutes + 15; // Assuming 15-minute slots

                          // Check if appointment date matches current day
                          if (!isSameDay(appt.date, currentDayDate)) {
                            return false;
                          }

                          // An appointment should be rendered if its start time matches the slot exactly
                          // OR if the appointment *begins before* this slot and *ends after or at* this slot's start
                          // This logic ensures that an appointment is only rendered at its precise start slot
                          // For other slots it occupies, it should not be rendered as a new div.
                          return appt.hour === slot.hour && appt.minute === slot.minute;
                        })
                        .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)); // Sort by start time for consistent overlapping

                      return (
                        <td
                          key={`${dayIdx}-${slotIdx}`}
                          className="relative z-0 p-0 align-top h-6 border-b border-gray-100 text-center align-middle dark:border-gray-700"
                          onDragOver={(e) => draggedId && e.preventDefault()}
                          onDrop={() => handleDrop(currentDayDate, slot.hour, slot.minute)}
                          style={{ width: 120, minWidth: 120, maxWidth: 120 }}
                        >
                          {appointmentsForSlot.map((appt, apptIndex) => {
                            const client = clients.find((c) => c.id === appt.clientId);
                            const psychologist = psychologists.find((p) => p.id === appt.psychologistId);
                            const apptHeight = (appt.duration / 15) * SLOT_HEIGHT_PX; // Height based on 15-min slots
                            const offset = apptIndex * 15; // Dynamic offset for overlapping appointments
                            const zIndex = 100 + apptIndex; // Ensure later appointments are on top
                            const colorClasses = getPsychologistColorClasses(appt.psychologistId);
                            const endTime = getEndTime(appt.hour, appt.minute, appt.duration);

                            return (
                              <div
                                key={appt.id}
                                className={`absolute rounded-lg py-1 text-xs font-medium cursor-pointer flex justify-center transition-all select-none flex-col px-1 border shadow items-stretch ${colorClasses}`}
                                style={{
                                  top: 0, // Always start at the top of the cell
                                  height: `${apptHeight}px`,
                                  width: `calc(100% - ${offset}px)`, // Adjust width based on offset
                                  left: `${offset}px`, // Apply left offset
                                  zIndex: zIndex,
                                  overflow: "hidden",
                                }}
                                draggable
                                onDragStart={() => handleDragStart(appt.id)}
                                onDragEnd={() => setDraggedId(null)}
                                onClick={() => setSelectedAppointment(appt)}
                              >
                                <div className="truncate font-semibold">
                                  {client?.name}
                                </div>
                                <div className="text-[10px] truncate">
                                  {psychologist?.name && (
                                    <span className="block">
                                      ({psychologist.name})
                                    </span>
                                  )}
                                  {appt.desc}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-300">
                                  {appt.hour}:{appt.minute.toString().padStart(2, "0")} - {`${endTime.hour}:${endTime.minute.toString().padStart(2, "0")}`}
                                </div>
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Randevu Detay Modal */}
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="dark:bg-gray-800 rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">Randevu Detayı</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-2 text-gray-700 dark:text-gray-200">
                <div>
                  <b>Danışan:</b> {clients.find((c) => c.id === selectedAppointment.clientId)?.name}
                </div>
                <div>
                  <b>Psikolog:</b>{" "}
                  {psychologists.find((p) => p.id === selectedAppointment.psychologistId)?.name}
                </div>
                <div>
                  <b>Tarih:</b> {format(selectedAppointment.date, "dd MMMM yyyy EEEE", { locale: tr })}
                </div>
                <div>
                  <b>Saat:</b> {selectedAppointment.hour}:{selectedAppointment.minute.toString().padStart(2, "0")}
                </div>
                <div>
                  <b>Süre:</b> {selectedAppointment.duration} dk
                </div>
                <div>
                  <b>Açıklama:</b> {selectedAppointment.desc}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Randevu Planla Modal */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="dark:bg-gray-800 rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">Yeni Randevu Planla</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="client" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Danışan
                </label>
                <Select value={newClientId} onValueChange={setNewClientId}>
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="Danışan seç" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="psychologist" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Psikolog
                </label>
                <Select value={newPsychologistId} onValueChange={setNewPsychologistId}>
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="Psikolog seç" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {psychologists.map((psychologist) => (
                      <SelectItem key={psychologist.id} value={psychologist.id.toString()}>
                        {psychologist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="date" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Tarih
                </label>
                <Select
                  value={newDate ? format(newDate, "yyyy-MM-dd") : ""}
                  onValueChange={(val) => setNewDate(new Date(val))}
                >
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="Gün seç" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {currentWeekDays.map((date, idx) => (
                      <SelectItem key={idx} value={format(date, "yyyy-MM-dd")}>
                        {days[idx]} - {format(date, "dd MMM", { locale: tr })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="hour" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Saat
                </label>
                <Select value={newHour} onValueChange={setNewHour}>
                  <SelectTrigger className="col-span-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="Saat" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newMinute} onValueChange={setNewMinute}>
                  <SelectTrigger className="col-span-1 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder=":00" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {minutes.map((min) => (
                      <SelectItem key={min} value={min.toString()}>
                        {min.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="duration" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Süre (dk)
                </label>
                <Select value={newDuration} onValueChange={setNewDuration}>
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="Süre seç" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {durations.map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d} dk
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="desc" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Açıklama
                </label>
                <Textarea
                  id="desc"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg"
                  placeholder="Randevu açıklaması"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                İptal
              </Button>
              <Button
                onClick={handleAddAppointment}
                disabled={
                  !newClientId ||
                  !newPsychologistId ||
                  !newDate ||
                  newDuration.length === 0 ||
                  newDesc.trim().length === 0
                }
                className="dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg"
              >
                Ekle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}