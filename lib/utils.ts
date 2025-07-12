import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: string | number): string {
  let number: number;
  if (typeof value === 'string') {
    // Sadece rakam, nokta ve virgül bırak, para birimi ve harfleri sil
    let cleaned = value.replace(/[^\d.,-]/g, '');
    // Binlik ayraç olan noktaları sil, ondalık ayraç olan virgülü noktaya çevir
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    number = parseFloat(cleaned);
  } else {
    number = value;
  }
  if (isNaN(number)) return '₺0';
  return number.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 });
}

// Psikolog renkleri - tüm bileşenlerde tutarlı olması için
export const PSIKOLOG_COLORS = {
  "Kln.Psk.Abdullah Yılmaz": {
    bg: "rgb(59 130 246 / 0.1)",        // Açık mavi arka plan
    text: "rgb(59 130 246)",            // Mavi metin rengi
    border: "rgb(59 130 246 / 0.3)",    // Mavi border
    badge: "bg-blue-100 text-blue-800", // Mavi badge
    calendar: "rgb(59 130 246 / 0.15)"  // Takvim için mavi
  },
  "Kln.Psk.Öznür Ünsal": {
    bg: "rgb(168 85 247 / 0.1)",
    text: "rgb(168 85 247)",
    border: "rgb(168 85 247 / 0.3)",
    badge: "bg-purple-100 text-purple-800",
    calendar: "rgb(168 85 247 / 0.15)"
  },
  "Kln.Psk.Eralp Akgül": {
    bg: "rgb(34 197 94 / 0.1)",
    text: "rgb(34 197 94)",
    border: "rgb(34 197 94 / 0.3)",
    badge: "bg-green-100 text-green-800",
    calendar: "rgb(34 197 94 / 0.15)"
  },
  "Kln.Psk.Busenaz Otlu": {
    bg: "rgb(239 68 68 / 0.1)",
    text: "rgb(239 68 68)",
    border: "rgb(239 68 68 / 0.3)",
    badge: "bg-red-100 text-red-800",
    calendar: "rgb(239 68 68 / 0.15)"
  },
  "Kln.Psk.İlke Gökçe": {
    bg: "rgb(245 158 11 / 0.1)",
    text: "rgb(245 158 11)",
    border: "rgb(245 158 11 / 0.3)",
    badge: "bg-orange-100 text-orange-800",
    calendar: "rgb(245 158 11 / 0.15)"
  },
  "Kln.Psk.Elif Özdemir": {
    bg: "rgb(236 72 153 / 0.1)",
    text: "rgb(236 72 153)",
    border: "rgb(236 72 153 / 0.3)",
    badge: "bg-pink-100 text-pink-800",
    calendar: "rgb(236 72 153 / 0.15)"
  }
} as const

export const getPsikologColor = (psikologName: string) => {
  return PSIKOLOG_COLORS[psikologName as keyof typeof PSIKOLOG_COLORS] || {
    bg: "rgb(107 114 128 / 0.1)",
    text: "rgb(107 114 128)",
    border: "rgb(107 114 128 / 0.3)",
    badge: "bg-gray-100 text-gray-800",
    calendar: "rgb(107 114 128 / 0.15)"
  }
}
