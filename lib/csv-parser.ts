export interface DanisanOdeme {
  tarih: string
  odemeTarihi: string
  adiSoyadi: string
  seansSayisi: string
  odemeYontemi: string
  terapist: string
  gorusmeTipi: string
  fiyatTarifesi: string
  danisanTuru: string
  hizmetBedeli: string
  odenenUcret: string
  danisanBorcu: string
  aciklama: string
  odemePlani?: string
}

export interface Gider {
  tarih: string
  giderTuru: string
  giderCesidi: string
  odemeSekli: string
  harcamaTutari: string
  aciklama: string
}

export interface CocukDanisanOdeme {
  kayitTarihi: string
  odemeTarihi: string
  adiSoyadi: string
  seansSayisi: string
  odemeYontemi: string
  terapist: string
  gorusmeTipi: string
  fiyatTarifesi: string
  danisanTuru: string
  hizmetBedeli: string
  odenenUcret: string
  danisanBorcu: string
  aciklama: string
}

export interface HesapHareketi {
  tarih: string
  islem: string
  hesap: string
  tutar: string
  aciklama: string
  kategori: string
}

export function parseCSV(csvContent: string, delimiter: string = ';'): string[][] {
  const lines = csvContent.split('\n').filter((line: string) => line.trim())
  return lines.map((line: string) =>
    line.split(delimiter).map((cell: string) => cell.trim().replace(/"/g, ''))
  )
}

export function parseDanisanOdemeleri(csvContent: string): DanisanOdeme[] {
  const rows = parseCSV(csvContent)
  const dataRows = rows.slice(1)
  return dataRows.map(row => ({
    tarih: row[0] || '',
    odemeTarihi: row[1] || '',
    adiSoyadi: row[2] || '',
    seansSayisi: row[3] || '',
    odemeYontemi: row[4] || '',
    terapist: row[5] || '',
    gorusmeTipi: row[6] || '',
    fiyatTarifesi: row[7] || '',
    danisanTuru: row[8] || '',
    hizmetBedeli: row[9] || '',
    odenenUcret: row[10] || '',
    danisanBorcu: row[11] || '',
    aciklama: row[12] || '',
    odemePlani: row[13] || ''
  }))
}

export function parseGiderler(csvContent: string): Gider[] {
  const rows = parseCSV(csvContent)
  const dataRows = rows.slice(1)
  return dataRows.map(row => ({
    tarih: row[0] || '',
    giderTuru: row[1] || '',
    giderCesidi: row[2] || '',
    odemeSekli: row[3] || '',
    harcamaTutari: row[4] || '',
    aciklama: row[5] || ''
  }))
}

export function parseCocukDanisanOdemeleri(csvContent: string): CocukDanisanOdeme[] {
  const rows = parseCSV(csvContent)
  const dataRows = rows.slice(1)
  return dataRows.map(row => ({
    kayitTarihi: row[0] || '',
    odemeTarihi: row[1] || '',
    adiSoyadi: row[2] || '',
    seansSayisi: row[3] || '',
    odemeYontemi: row[4] || '',
    terapist: row[5] || '',
    gorusmeTipi: row[6] || '',
    fiyatTarifesi: row[7] || '',
    danisanTuru: row[8] || '',
    hizmetBedeli: row[9] || '',
    odenenUcret: row[10] || '',
    danisanBorcu: row[11] || '',
    aciklama: row[12] || ''
  }))
}

export function parseHesapHareketleri(csvContent: string): HesapHareketi[] {
  const rows = parseCSV(csvContent)
  const dataRows = rows.slice(1)
  return dataRows.map(row => ({
    tarih: row[0] || '',
    islem: row[1] || '',
    hesap: row[2] || '',
    tutar: row[3] || '',
    aciklama: row[4] || '',
    kategori: row[5] || ''
  }))
} 