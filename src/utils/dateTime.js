export const DAY_START_HOUR = 6;
export const DAY_END_HOUR = 24;
export const HOUR_HEIGHT = 64;

export function toDateKey(input) {
  const date = input instanceof Date ? input : new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey() {
  return toDateKey(new Date());
}

export function addDaysToKey(dateKey, amount) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function isPastDateKey(dateKey) {
  return dateKey < todayKey();
}

export function formatDayLabel(dateKey) {
  const today = todayKey();

  if (dateKey === today) return 'Сегодня';
  if (dateKey === addDaysToKey(today, -1)) return 'Вчера';
  if (dateKey === addDaysToKey(today, 1)) return 'Завтра';

  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
  }).format(date);
}

export function formatDateHeading(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' }).format(date);
}

export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes) {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, totalMinutes));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Assigns overlapping tasks to side-by-side columns, like a calendar app.
export function layoutDayTasks(tasks) {
  const sorted = [...tasks].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  const blocks = [];
  let cluster = [];
  let clusterEnd = -Infinity;

  function flushCluster() {
    if (!cluster.length) return;

    const columnEnds = [];
    const clusterBlocks = [];

    cluster.forEach((task) => {
      const start = timeToMinutes(task.startTime);
      const end = timeToMinutes(task.endTime);
      let columnIndex = columnEnds.findIndex((endTime) => endTime <= start);

      if (columnIndex === -1) {
        columnIndex = columnEnds.length;
      }

      columnEnds[columnIndex] = end;
      const block = { task, columnIndex };
      clusterBlocks.push(block);
      blocks.push(block);
    });

    const columnCount = columnEnds.length;
    clusterBlocks.forEach((block) => {
      block.columnCount = columnCount;
    });

    cluster = [];
    clusterEnd = -Infinity;
  }

  sorted.forEach((task) => {
    const start = timeToMinutes(task.startTime);

    if (cluster.length && start >= clusterEnd) {
      flushCluster();
    }

    cluster.push(task);
    clusterEnd = Math.max(clusterEnd, timeToMinutes(task.endTime));
  });

  flushCluster();

  return blocks;
}

export function getBlockMetrics(task) {
  const dayStart = DAY_START_HOUR * 60;
  const dayEnd = DAY_END_HOUR * 60;
  const start = Math.min(Math.max(timeToMinutes(task.startTime), dayStart), dayEnd);
  const end = Math.min(Math.max(timeToMinutes(task.endTime), start + 15), dayEnd);

  return {
    top: ((start - dayStart) / 60) * HOUR_HEIGHT,
    height: Math.max(((end - start) / 60) * HOUR_HEIGHT, 58),
  };
}
