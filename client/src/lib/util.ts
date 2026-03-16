import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string, pattern = "MMM d, yyyy") {
  return format(parseISO(iso), pattern);
}

export function formatDateTime(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy HH:mm");
}

export function formatCurrency(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
