import React, { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"

interface EditEvaluationFormProps {
  initialData: { clientName: string; evaluation: string }
  onUpdateEvaluation?: (evaluation: { clientName: string; evaluation: string }) => void
}

export function EditEvaluationForm({ initialData, onUpdateEvaluation }: EditEvaluationFormProps) {
  const [clientName, setClientName] = useState(initialData.clientName)
  const [evaluation, setEvaluation] = useState(initialData.evaluation)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName || !evaluation) return
    onUpdateEvaluation?.({ clientName, evaluation })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="clientName">Danışan Adı</Label>
        <Input
          id="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Danışan adı girin"
        />
      </div>
      <div>
        <Label htmlFor="evaluation">Değerlendirme</Label>
        <Textarea
          id="evaluation"
          value={evaluation}
          onChange={(e) => setEvaluation(e.target.value)}
          placeholder="Değerlendirme notu girin"
        />
      </div>
      <Button type="submit">Güncelle</Button>
    </form>
  )
} 