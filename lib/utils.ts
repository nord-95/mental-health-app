import { format, formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

export function formatRomanianDate(date: Date): string {
  return format(date, "d MMMM yyyy, 'ora' HH:mm", { locale: ro });
}

export function formatRomanianDateShort(date: Date): string {
  return format(date, 'd MMM yyyy', { locale: ro });
}

export function formatRomanianRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: ro });
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

