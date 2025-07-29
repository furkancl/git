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

interface GorusmeHazirlik {
  id: string
  client_name: string
  meeting_date: string
  client_issues: string
  psychologist_notes: string
  psychologist_name: string
}

interface Psychologist {
  id: number
  name: string
}

interface EditGorusmeHazirlikFormProps {
  initialData: GorusmeHazirlik
  onUpdateGorusme: (updatedGorusme: GorusmeHazirlik) => void
  psychologists: Psychologist[]
}

export function EditGorusmeHazirlikForm({ initialData, onUpdateGorusme, psychologists }: EditGorusmeHazirlikFormProps) {
  const [client_name, setclient_name] = useState(initialData.client_name)
  const [meeting_date, setmeeting_date] = useState<Date | undefined>(new Date(initialData.meeting_date))
  const [meetingTime, setMeetingTime] = useState(format(new Date(initialData.meeting_date), "HH:mm"))
  const [client_issues, setclient_issues] = useState(initialData.client_issues)
  const [psychologist_notes, setpsychologist_notes] = useState(initialData.psychologist_notes)
  const [psychologist_name, setpsychologist_name] = useState(initialData.psychologist_name)

  useEffect(() => {
    setclient_name(initialData.client_name)
    setmeeting_date(new Date(initialData.meeting_date))
    setMeetingTime(format(new Date(initialData.meeting_date), "HH:mm"))
    setclient_issues(initialData.client_issues)
    setpsychologist_notes(initialData.psychologist_notes)
    setpsychologist_name(initialData.psychologist_name)
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!client_name || !meeting_date || !psychologist_name) {
      alert("Lütfen tüm zorunlu alanları doldurun: Danışan Adı, Görüşme Tarihi ve Psikolog.")
      return
    }

    const [hours, minutes] = meetingTime.split(":").map(Number)
    const fullmeeting_date = new Date(meeting_date)
    fullmeeting_date.setHours(hours, minutes, 0, 0)

    onUpdateGorusme({
      ...initialData,
      client_name,
      meeting_date: fullmeeting_date.toISOString(),
      client_issues,
      psychologist_notes,
      psychologist_name,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="client_name" className="text-right">
          Danışan Adı
        </Label>
        <Input
          id="client_name"
          value={client_name}
          onChange={(e) => setclient_name(e.target.value)}
          className="col-span-3"
          required
        />
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
                  !meeting_date && "text-muted-foreground"
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
            id="meetingTime"
            type="time"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            className="w-[100px]"
            required
          />
        </div>
      </div>

<div className="grid grid-cols-4 items-center gap-4">
  <Label className="text-right">
    Psikolog
  </Label>
  <Select
    value={psychologist_name}
    onValueChange={setpsychologist_name}
    required
  >
    <SelectTrigger id="psychologist-select" className="col-span-3">
      <SelectValue placeholder="Psikolog Seçin" />
    </SelectTrigger>
    <SelectContent>
      {psychologists.map((p) => (
        <SelectItem key={p.id} value={p.name}>
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
        <Button type="submit">Değişiklikleri Kaydet</Button>
      </DialogFooter>
    </form>
  )
}
