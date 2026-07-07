const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function isWithinBusinessHours(schedule) {
  if (!schedule) return true;

  const now = new Date();
  const dayKey = DAY_NAMES[now.getDay()];
  const daySchedule = schedule[dayKey];

  if (!daySchedule?.enabled) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = toMinutes(daySchedule.open);
  const closeMinutes = toMinutes(daySchedule.close);

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}
