"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { DialogFooter } from "@/components/ui/dialog"

interface Appointment {
  id: string
  clientName: string
  appointmentDate: string
  clientIssues: string
  psychologistNotes: string
  psychologistName: string
}

interface EditAppointmentFormProps {
  initialData: Appointment
  onUpdateAppointment: (updatedAppointment: Appointment) => void
  psychologists: string[]
}

export function EditAppointmentForm({ initialData, onUpdateAppointment, psychologists }: EditAppointmentFormProps) {
  const [clientName, setClientName] = useState(initialData.clientName)
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(new Date(initialData.appointmentDate))
  const [appointmentTime, setAppointmentTime] = useState(format(new Date(initialData.appointmentDate), "HH:mm"))
  const [clientIssues, setClientIssues] = useState(initialData.clientIssues)
  const [psychologistNotes, setPsychologistNotes] = useState(initialData.psychologistNotes)
  const [psychologistName, setPsychologistName] = useState(initialData.psychologistName)

  useEffect(() => {
    setClientName(initialData.clientName)
    setAppointmentDate(new Date(initialData.appointmentDate))
    setAppointmentTime(format(new Date(initialData.appointmentDate), "HH:mm"))
    setClientIssues(initialData.clientIssues)
    setPsychologistNotes(initialData.psychologistNotes)
    setPsychologistName(initialData.psychologistName)
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName || !appointmentDate || !psychologistName) {
      alert("Lütfen tüm zorunlu alanları doldurun: Danışan Adı, Randevu Tarihi ve Psikolog.")
      return
    }

    const [hours, minutes] = appointmentTime.split(":").map(Number)
    const fullAppointmentDate = new Date(appointmentDate)
    fullAppointmentDate.setHours(hours, minutes, 0, 0)

    onUpdateAppointment({
      ...initialData,
      clientName,
      appointmentDate: fullAppointmentDate.toISOString(),
      clientIssues,
      psychologistNotes,
      psychologistName,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="clientName" className="text-right">
          Danışan Adı
        </Label>
        <Input
          id="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="appointmentDate" className="text-right">
          Randevu Tarihi
        </Label>
        <div className="col-span-3 flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[180px] justify-start text-left font-normal",
                  !appointmentDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {appointmentDate ? format(appointmentDate, "PPP", { locale: tr }) : <span>Tarih Seçin</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={appointmentDate}
                onSelect={setAppointmentDate}
                initialFocus
                locale={tr}
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="w-[100px]"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="psychologistName" className="text-right">
          Psikolog
        </Label>
        <Select value={psychologistName} onValueChange={setPsychologistName} required>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Psikolog Seçin" />
          </SelectTrigger>
          <SelectContent>
            {psychologists.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="clientIssues" className="text-right">
          Danışan Sıkıntıları
        </Label>
        <Textarea
          id="clientIssues"
          value={clientIssues}
          onChange={(e) => setClientIssues(e.target.value)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="psychologistNotes" className="text-right">
          Psikolog Notu
        </Label>
        <Textarea
          id="psychologistNotes"
          value={psychologistNotes}
          onChange={(e) => setPsychologistNotes(e.target.value)}
          className="col-span-3"
        />
      </div>
      <DialogFooter>
        <Button type="submit">Değişiklikleri Kaydet</Button>
      </DialogFooter>
    </form>
  )
}
