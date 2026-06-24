export function formatLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU");
}

export function formatLocal(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU");
}

export function formatRub(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₽`;
}
