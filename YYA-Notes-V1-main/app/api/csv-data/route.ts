import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { parseDanisanOdemeleri, parseGiderler, parseCocukDanisanOdemeleri, parseHesapHareketleri } from '@/lib/csv-parser'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type') // 'danisan-odemeleri', 'giderler', 'cocuk-danisan-odemeleri', 'hesap-hareketleri'
    
    if (!dataType) {
      return NextResponse.json({ error: 'Data type parameter is required' }, { status: 400 })
    }
    
    let csvFilePath: string
    let parsedData: any
    
    if (dataType === 'danisan-odemeleri') {
      csvFilePath = path.join(process.cwd(), 'data', 'csv', 'Danisan_odemeleri.csv')
      const csvContent = await fs.readFile(csvFilePath, 'utf-8')
      parsedData = parseDanisanOdemeleri(csvContent)
    } else if (dataType === 'giderler') {
      csvFilePath = path.join(process.cwd(), 'data', 'csv', 'Giderler.csv')
      const csvContent = await fs.readFile(csvFilePath, 'utf-8')
      parsedData = parseGiderler(csvContent)
    } else if (dataType === 'cocuk-danisan-odemeleri') {
      csvFilePath = path.join(process.cwd(), 'data', 'csv', 'Çocuk danışan ödemeleri.csv')
      const csvContent = await fs.readFile(csvFilePath, 'utf-8')
      parsedData = parseCocukDanisanOdemeleri(csvContent)
    } else if (dataType === 'hesap-hareketleri') {
      csvFilePath = path.join(process.cwd(), 'data', 'csv', 'Hesap hareketleri.csv')
      const csvContent = await fs.readFile(csvFilePath, 'utf-8')
      parsedData = parseHesapHareketleri(csvContent)
    } else {
      return NextResponse.json({ error: 'Invalid data type' }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      data: parsedData,
      count: parsedData.length
    })
    
  } catch (error) {
    console.error('CSV data API error:', error)
    return NextResponse.json(
      { error: 'Failed to read CSV data' },
      { status: 500 }
    )
  }
} 