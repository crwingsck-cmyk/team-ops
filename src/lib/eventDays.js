export function getDays(event) {
  if (event.days?.length) return event.days;
  if (event.date) return [{ date: event.date, startTime: event.startTime, endTime: event.endTime, location: event.location }];
  return [];
}

export function eventFirstDate(event) {
  return getDays(event)[0]?.date || "";
}

export function dateRangeText(event) {
  const days = getDays(event);
  const { date, endDate } = computeDateRange(days);
  if (!date) return "";
  if (!endDate || date === endDate) return date;
  return `${date} ~ ${endDate}`;
}

export function computeDateRange(days) {
  const dates = (days || []).map((d) => d.date).filter(Boolean).sort();
  return {
    date: dates[0] || "",
    endDate: dates[dates.length - 1] || "",
  };
}

export function sameLocationForAllDays(days) {
  const locations = new Set((days || []).map((d) => d.location || "").filter(Boolean));
  return locations.size <= 1 ? [...locations][0] || "" : null;
}
