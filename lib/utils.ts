import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatCurrency(value: number | string, locale = 'tr-TR', currency = 'TRY') {
  const number = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
