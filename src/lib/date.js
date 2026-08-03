function quantized(date, milliseconds) {
  const rounded = Math.round(date.getTime() / milliseconds) * milliseconds;
  return new Date(rounded);
}

function stringDay(date) {
  date = new Date(date);
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

function displayHours(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const fractionMinutes = Math.round(remainingMinutes / 60 * 4) / 4;
  if (fractionMinutes === 0) return `${hours}h`;
  return `${hours+fractionMinutes}h`;
}

function isToday(date) {
  const today = new Date();
  return date.getYear() == today.getYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
}

export { quantized, stringDay, displayHours, isToday };
