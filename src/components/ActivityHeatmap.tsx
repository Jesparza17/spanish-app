const COLUMNS = 12;
const ROWS = 7;
const WINDOW_DAYS = COLUMNS * ROWS;

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function intensityClass(count: number): string {
  if (count === 0) return "bg-ink/8";
  if (count <= 2) return "bg-marigold/30";
  if (count <= 5) return "bg-marigold/60";
  return "bg-marigold";
}

export default function ActivityHeatmap({ activityByDate }: { activityByDate: Record<string, number> }) {
  const windowStart = new Date();
  windowStart.setUTCHours(0, 0, 0, 0);
  windowStart.setUTCDate(windowStart.getUTCDate() - (WINDOW_DAYS - 1));

  const cells: { key: string; count: number }[] = [];
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const d = new Date(windowStart);
    d.setUTCDate(d.getUTCDate() + i);
    const key = dateKey(d);
    cells.push({ key, count: activityByDate[key] ?? 0 });
  }

  return (
    <div className="flex gap-[3px] overflow-x-auto">
      {Array.from({ length: COLUMNS }, (_, col) => (
        <div key={col} className="flex flex-col gap-[3px]">
          {Array.from({ length: ROWS }, (_, row) => {
            const cell = cells[col * ROWS + row];
            return (
              <div
                key={cell.key}
                title={`${cell.key}: ${cell.count}`}
                className={`w-[9px] h-[9px] rounded-[2px] ${intensityClass(cell.count)}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
