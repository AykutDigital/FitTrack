/** Date du jour au format yyyy-mm-dd (heure locale). */
export function today(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

const FR_DATE = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const FR_DATE_SHORT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
});

/** "sam. 12 juil." à partir d'un yyyy-mm-dd. */
export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return FR_DATE.format(d);
}

/** "12/07" à partir d'un yyyy-mm-dd. */
export function formatDateShort(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return FR_DATE_SHORT.format(d);
}

const NUM = new Intl.NumberFormat("fr-FR");

export function formatNumber(n: number): string {
  return NUM.format(n);
}
