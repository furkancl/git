import React, { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Add Select imports

// Import the Caller type from its definition file (adjust path as needed)
import type { Caller } from '../app/page'; // Assuming 'Caller' is defined in src/app/page.tsx

interface AddCallerFormProps {
  // Update the type of the 'caller' parameter to Omit<Caller, "id">
  onAddCaller?: (caller: Omit<Caller, "id">) => void
  psychologists: string[]
  contactMethods: string[]
  sessionTypes: string[]
}

export function AddCallerForm({
  onAddCaller,
  psychologists,
  contactMethods,
  sessionTypes,
}: AddCallerFormProps) {
  const [callerName, setCallerName] = useState("")
  const [contactMethod, setContactMethod] = useState<Caller['contactMethod']>(contactMethods[0] as Caller['contactMethod'] || "")
  const [requestedPsychologist, setRequestedPsychologist] = useState<Caller['requestedPsychologist']>(psychologists[0] as Caller['requestedPsychologist'] || "")
  const [issueSummary, setIssueSummary] = useState("")
  const [sessionType, setSessionType] = useState<Caller['sessionType']>(sessionTypes[0] as Caller['sessionType'] || "")
  const [contactDate, setContactDate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!callerName || !contactMethod || !requestedPsychologist || !sessionType || !contactDate) {
      console.error("Please fill all required fields."); // Use console.error instead of alert
      return;
    }

    // Type assertion to ensure the object matches Omit<Caller, "id">
    onAddCaller?.({
      callerName,
      contactMethod,
      requestedPsychologist,
      issueSummary,
      sessionType,
      contactDate,
    } as Omit<Caller, "id">) // Explicitly cast to the correct type

    // Reset form fields
    setCallerName("")
    setContactMethod(contactMethods[0] as Caller['contactMethod'] || "")
    setRequestedPsychologist(psychologists[0] as Caller['requestedPsychologist'] || "")
    setIssueSummary("")
    setSessionType(sessionTypes[0] as Caller['sessionType'] || "")
    setContactDate("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="callerName">Arayan Adı</Label>
        <Input
          id="callerName"
          value={callerName}
          onChange={(e) => setCallerName(e.target.value)}
          placeholder="Arayanın adı"
        />
      </div>
      <div>
        <Label htmlFor="contactMethod">İletişim Şekli</Label>
        {/* Using Shadcn Select component for consistency */}
        <Select value={contactMethod} onValueChange={(value) => setContactMethod(value as Caller['contactMethod'])}>
          <SelectTrigger id="contactMethod">
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
        <Label htmlFor="requestedPsychologist">İstenen Psikolog</Label>
        {/* Using Shadcn Select component for consistency */}
        <Select value={requestedPsychologist} onValueChange={(value) => setRequestedPsychologist(value as Caller['requestedPsychologist'])}>
          <SelectTrigger id="requestedPsychologist">
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
      <div>
        <Label htmlFor="issueSummary">Sorun Detayı</Label>
        <Textarea
          id="issueSummary"
          value={issueSummary}
          onChange={(e) => setIssueSummary(e.target.value)}
          placeholder="Sorun detayı"
        />
      </div>
      <div>
        <Label htmlFor="sessionType">Görüşme Tipi</Label>
        {/* Using Shadcn Select component for consistency */}
        <Select value={sessionType} onValueChange={(value) => setSessionType(value as Caller['sessionType'])}>
          <SelectTrigger id="sessionType">
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
        <Label htmlFor="contactDate">Arama Tarihi</Label>
        <Input
          id="contactDate"
          type="datetime-local"
          value={contactDate}
          onChange={(e) => setContactDate(e.target.value)}
        />
      </div>
      <Button type="submit">Kaydet</Button>
    </form>
  )
}