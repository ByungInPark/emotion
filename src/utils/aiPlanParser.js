export const extractSchedulesFromPlan = (markdownText) => {
  const regex = /\|(.+?)\|(.+?)\|(.+?)\|/g;
  const results = [];
  let match;

  while ((match = regex.exec(markdownText)) !== null) {
    const [, dateRaw, timeRaw, activity, location] = match.map((s) => s.trim());

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) continue;
    const timeMatch = timeRaw.match(/^(\d{1,2}):(\d{2})/);
    if (!timeMatch) continue;

    const date = new Date(dateRaw);
    const hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);
    date.setHours(hour, minute);
    const end = new Date(date.getTime() + 60 * 60 * 1000);

    results.push({
      id: Date.now().toString() + Math.random(),
      title: activity,
      location,  // ✅ 장소 포함
      start: date.toISOString(),
      end: end.toISOString(),
      priority: "보통",
    });
  }

  return results;
};