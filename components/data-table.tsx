"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, Download, Upload, Edit, Trash2 } from "lucide-react"
import { useRef } from "react"

interface Column {
  key: string
  label: string
  sortable?: boolean
}

interface DataTableProps {
  title: string
  columns: Column[]
  data: any[]
  onAdd?: () => void
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onImport?: (data: any[]) => void
  onExport?: () => void
}

export function DataTable({ title, columns, data, onAdd, onEdit, onDelete, onImport, onExport }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filtreleme
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) => {
      if (React.isValidElement(value)) {
        return false // React elementlerini arama dışında bırak
      }
      return String(value).toLowerCase().includes(searchTerm.toLowerCase())
    }),
  )

  // Sıralama
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  // Sayfalama
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(columnKey)
      setSortDirection("asc")
    }
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ""
      })
      return obj
    })
    return rows
  }

  const parseXLSX = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const text = new TextDecoder().decode(data)
          resolve(parseCSV(text))
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error("Dosya okuma hatası"))
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onImport) return

    try {
      let importedData: any[] = []

      if (file.name.endsWith(".csv")) {
        const text = await file.text()
        importedData = parseCSV(text)
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        importedData = await parseXLSX(file)
      } else {
        alert("Desteklenen dosya formatları: CSV, XLSX")
        return
      }

      if (importedData.length > 0) {
        onImport(importedData)
        alert(`${importedData.length} kayıt başarıyla içeri aktarıldı!`)
      } else {
        alert("Dosyada geçerli veri bulunamadı.")
      }
    } catch (error) {
      console.error("Import hatası:", error)
      alert("Dosya içeri aktarılırken bir hata oluştu.")
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      // Varsayılan CSV export
      const headers = columns.map((col) => col.label).join(",")
      const rows = data
        .map((item) =>
          columns
            .map((col) => {
              const value = item[col.key]
              return React.isValidElement(value) ? "" : String(value)
            })
            .join(","),
        )
        .join("\n")

      const csvContent = `${headers}\n${rows}`
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title.toLowerCase().replace(/\s+/g, "_")}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
            {onImport && (
              <>
                <Button variant="outline" size="sm" onClick={triggerFileInput}>
                  <Upload className="h-4 w-4 mr-2" />
                  İçeri Aktar
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </>
            )}
            {onAdd && (
              <Button onClick={onAdd} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ekle
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`text-left p-2 font-medium ${column.sortable ? "cursor-pointer hover:bg-muted/50" : ""}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                ))}
                {(onEdit || onDelete) && <th className="text-left p-2 font-medium">İşlemler</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={item.id || index} className="border-b hover:bg-muted/50">
                    {columns.map((column) => (
                      <td key={column.key} className="p-2">
                        {typeof item[column.key] === "boolean" ? (
                          <Badge variant={item[column.key] ? "default" : "secondary"}>
                            {item[column.key] ? "Aktif" : "Pasif"}
                          </Badge>
                        ) : (
                          item[column.key]
                        )}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="p-2">
                        <div className="flex space-x-2">
                          {onEdit && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Düzenle
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm("Bu kaydı silmek istediğinizden emin misiniz?")) {
                                  onDelete(item)
                                }
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Sil
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                    className="p-8 text-center text-muted-foreground"
                  >
                    Veri bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Toplam {filteredData.length} kayıt, sayfa {currentPage} / {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sonraki
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
