"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

// Define Caller Type (tekrar tanımlamamak için ana sayfadan kopyalandı)
interface Caller {
  id: string
  callerName: string
  contactMethod: "Telefon" | "E-posta" | "Web Sitesi" | "Tavsiye" | "Diğer"
  requestedPsychologist: string // "Fark Etmez" or a specific psychologist name
  issueSummary: string
  sessionType: "Bireysel" | "Çift" | "Aile" | "Çocuk" | "Grup" | "Diğer"
  contactDate: string // ISO string for consistent parsing
}

interface Psychologist {
  id: number
  name: string
  created_at: string
}
interface EditCallerFormProps {
  initialData: Caller
  onUpdateCaller: (caller: Caller) => void
  psychologists: Psychologist[]
  contactMethods: string[]
  sessionTypes: string[]
}

export function EditCallerForm({
  initialData,
  onUpdateCaller,
  psychologists,
  contactMethods,
  sessionTypes,
}: EditCallerFormProps) {
  const [callerName, setCallerName] = useState(initialData.callerName)
  const [contactMethod, setContactMethod] = useState(initialData.contactMethod)
  const [requestedPsychologist, setRequestedPsychologist] = useState(initialData.requestedPsychologist)
  const [issueSummary, setIssueSummary] = useState(initialData.issueSummary)
  const [sessionType, setSessionType] = useState(initialData.sessionType)
  const [contactDate, setContactDate] = useState(initialData.contactDate.substring(0, 16)) // Format for datetime-local input

  // initialData değiştiğinde state'i güncelle
  useEffect(() => {
    setCallerName(initialData.callerName)
    setContactMethod(initialData.contactMethod)
    setRequestedPsychologist(initialData.requestedPsychologist)
    setIssueSummary(initialData.issueSummary)
    setSessionType(initialData.sessionType)
    setContactDate(initialData.contactDate.substring(0, 16))
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!callerName || !contactMethod || !requestedPsychologist || !sessionType || !contactDate) return

    onUpdateCaller({
      ...initialData, // Keep the original ID
      callerName,
      contactMethod,
      requestedPsychologist,
      issueSummary,
      sessionType,
      contactDate: contactDate + ":00", // Add seconds for full ISO string
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="editCallerName">Arayan Adı</Label>
        <Input
          id="editCallerName"
          value={callerName}
          onChange={(e) => setCallerName(e.target.value)}
          placeholder="Arayanın adı"
        />
      </div>
      <div>
        <Label htmlFor="editContactMethod">İletişim Şekli</Label>
        <Select value={contactMethod} onValueChange={(value) => setContactMethod(value as Caller["contactMethod"])}>
          <SelectTrigger id="editContactMethod">
            <SelectValue placeholder="İletişim Şekli Seçin" />
          </SelectTrigger>
          <SelectContent>
            {contactMethods.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="editRequestedPsychologist">İstenen Psikolog</Label>
  <Select value={requestedPsychologist} onValueChange={setRequestedPsychologist}>
    <SelectTrigger id="editRequestedPsychologist">
      <SelectValue placeholder="Psikolog Seçin" />
    </SelectTrigger>
    <SelectContent>
      {psychologists.map((psych) => (
        <SelectItem key={psych.id} value={psych.name}>
          {psych.name}
        </SelectItem>
      ))}
      <SelectItem value="Fark Etmez">Fark Etmez</SelectItem>
    </SelectContent>
  </Select>
      </div>
      <div>
        <Label htmlFor="editIssueSummary">Sorun Detayı</Label>
        <Textarea
          id="editIssueSummary"
          value={issueSummary}
          onChange={(e) => setIssueSummary(e.target.value)}
          placeholder="Sorun detayı"
        />
      </div>
      <div>
        <Label htmlFor="editSessionType">Görüşme Tipi</Label>
        <Select value={sessionType} onValueChange={(value) => setSessionType(value as Caller["sessionType"])}>
          <SelectTrigger id="editSessionType">
            <SelectValue placeholder="Görüşme Tipi Seçin" />
          </SelectTrigger>
          <SelectContent>
            {sessionTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="editContactDate">Arama Tarihi</Label>
        <Input
          id="editContactDate"
          type="datetime-local"
          value={contactDate}
          onChange={(e) => setContactDate(e.target.value)}
        />
      </div>
      <Button type="submit">Güncelle</Button>
    </form>
  )
}
