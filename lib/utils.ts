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
