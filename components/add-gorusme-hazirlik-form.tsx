"use client"

import { DialogFooter } from "@/components/ui/dialog"
import type React from "react"
import { useState } from "react"
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

interface Client {
  id: number
  name: string
}
interface Psychologist {
  id: number
  name: string
}

interface AddGorusmeHazirlikFormProps {
  onAddGorusme: (newGorusme: Omit<GorusmeHazirlik, "id">) => void
  psychologists: Psychologist[]
  clients: Client[]
}

interface GorusmeHazirlik {
  id: string
  client_id: number
  client_name: string
  meeting_date: string
  client_issues: string
  psychologist_notes: string
  psychologist_name: string
}

export function AddGorusmeHazirlikForm({ onAddGorusme, psychologists, clients }: AddGorusmeHazirlikFormProps) {
  const [clientId, setClientId] = useState<string>("")
  const [meeting_date, setmeeting_date] = useState<Date | undefined>(undefined)
  const [meetingTime, setMeetingTime] = useState("10:00") // Default time
  const [client_issues, setclient_issues] = useState("")
  const [psychologist_notes, setpsychologist_notes] = useState("")
  const [psychologistId, setPsychologistId] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !meeting_date || !psychologistId) {
      alert("Lütfen tüm zorunlu alanları doldurun: Danışan, Görüşme Tarihi ve Psikolog.")
      return
    }

    const [hours, minutes] = meetingTime.split(":").map(Number)
    const fullmeeting_date = new Date(meeting_date)
    fullmeeting_date.setHours(hours, minutes, 0, 0)

    const selectedClient = clients.find((c: Client) => c.id.toString() === clientId)
    const selectedPsychologist = psychologists.find((p: Psychologist) => p.id.toString() === psychologistId)
    
    if (!selectedClient || !selectedPsychologist) {
      alert("Geçerli bir danışan ve psikolog seçiniz.")
      return
    }

    onAddGorusme({
      client_id: selectedClient.id,
      client_name: selectedClient.name,
      meeting_date: fullmeeting_date.toISOString(),
      client_issues,
      psychologist_notes,
      psychologist_name: selectedPsychologist.name,
    })

    // Reset form
    setClientId("")
    setmeeting_date(undefined)
    setMeetingTime("10:00")
    setclient_issues("")
    setpsychologist_notes("")
    setPsychologistId("")
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="clientId" className="text-right">
          Danışan
        </Label>
        <Select value={clientId} onValueChange={setClientId} required>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Danışan seç" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client: Client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="meeting_date" className="text-right">
          Randevu Tarihi
        </Label>
        <div className="col-span-3 flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[180px] justify-start text-left font-normal",
                  !meeting_date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {meeting_date ? format(meeting_date, "PPP", { locale: tr }) : <span>Tarih Seçin</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={meeting_date}
                onSelect={setmeeting_date}
                initialFocus
                locale={tr}
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            className="w-[100px]"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="psychologistId" className="text-right">
          Psikolog
        </Label>
        <Select value={psychologistId} onValueChange={setPsychologistId} required>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Psikolog Seçin" />
          </SelectTrigger>
          <SelectContent>
            {psychologists.map((p: Psychologist) => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="client_issues" className="text-right">
          Danışan Sıkıntıları
        </Label>
        <Textarea
          id="client_issues"
          value={client_issues}
          onChange={(e) => setclient_issues(e.target.value)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="psychologist_notes" className="text-right">
          Psikolog Notu
        </Label>
        <Textarea
          id="psychologist_notes"
          value={psychologist_notes}
          onChange={(e) => setpsychologist_notes(e.target.value)}
          className="col-span-3"
        />
      </div>
      <DialogFooter>
        <Button type="submit">Görüşme Hazırlık Ekle</Button>
      </DialogFooter>
    </form>
  )
}
