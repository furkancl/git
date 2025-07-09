"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save, X, AlertCircle } from "lucide-react"

interface FormField {
  name: string
  label: string
  type: "text" | "textarea" | "select" | "checkbox" | "radio" | "date" | "number" | "email" | "tel"
  options?: string[]
  required?: boolean
  placeholder?: string
  min?: number
  max?: number
  step?: number
}

interface FormBuilderProps {
  title: string
  fields: FormField[]
  onSubmit: (data: any) => void
  onCancel?: () => void
  initialData?: any
  submitText?: string
  cancelText?: string
}

export function FormBuilder({
  title,
  fields,
  onSubmit,
  onCancel,
  initialData = {},
  submitText = "Kaydet",
  cancelText = "İptal",
}: FormBuilderProps) {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = formData[field.name]

      if (field.required && (!value || value === "")) {
        newErrors[field.name] = `${field.label} zorunludur`
      }

      if (field.type === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
        newErrors[field.name] = "Geçerli bir e-posta adresi giriniz"
      }

      if (field.type === "number" && value) {
        const numValue = Number(value)
        if (field.min !== undefined && numValue < field.min) {
          newErrors[field.name] = `Minimum değer ${field.min} olmalıdır`
        }
        if (field.max !== undefined && numValue > field.max) {
          newErrors[field.name] = `Maksimum değer ${field.max} olmalıdır`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.name] || ""
    const hasError = !!errors[field.name]

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={hasError ? "border-red-500" : ""}
          />
        )

      case "select":
        return (
          <Select value={value} onValueChange={(val) => updateField(field.name, val)}>
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue placeholder={field.placeholder || "Seçiniz"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox checked={value} onCheckedChange={(checked) => updateField(field.name, checked)} />
            <Label>{field.label}</Label>
          </div>
        )

      case "radio":
        return (
          <RadioGroup value={value} onValueChange={(val) => updateField(field.name, val)}>
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} />
                <Label>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      default:
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className={hasError ? "border-red-500" : ""}
          />
        )
    }
  }

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              {field.type !== "checkbox" && (
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              )}
              {renderField(field)}
              {errors[field.name] && (
                <div className="flex items-center space-x-1 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors[field.name]}</span>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                <X className="h-4 w-4 mr-2" />
                {cancelText}
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Kaydediliyor..." : submitText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
