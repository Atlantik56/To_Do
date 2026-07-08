import { useEffect, useRef, useState } from 'react';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_HEIGHT,
  formatDayLabel,
  getBlockMetrics,
  layoutDayTasks,
  todayKey,
} from '../utils/dateTime.js';
import styles from './CalendarGrid.module.css';

const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, index) => DAY_START_HOUR + index);
const TOOLTIP_WIDTH = 280;
const TOOLTIP_MAX_HEIGHT = 340;
const VIEWPORT_MARGIN = 12;
const HIDE_DELAY = 120;

function currentMinuteOffset() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() - DAY_START_HOUR * 60;
}

// Positions the floating tooltip next to its block without letting it run off-screen.
function computeTooltipPosition(rect) {
  const openRight = rect.right + VIEWPORT_MARGIN + TOOLTIP_WIDTH <= window.innerWidth;
  const left = openRight
    ? rect.right + VIEWPORT_MARGIN
    : Math.max(VIEWPORT_MARGIN, rect.left - TOOLTIP_WIDTH - VIEWPORT_MARGIN);
  const top = Math.min(
    Math.max(rect.top, VIEWPORT_MARGIN),
    Math.max(VIEWPORT_MARGIN, window.innerHeight - TOOLTIP_MAX_HEIGHT - VIEWPORT_MARGIN),
  );

  return { top, left };
}

function CalendarGrid({
  dateKey,
  priorities,
  removingTaskIds,
  statuses,
  tasks,
  onDelete,
  onEdit,
  onStatusChange,
}) {
  const isToday = dateKey === todayKey();
  const scrollRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const blocks = layoutDayTasks(tasks);
  const gridHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;
  const nowTop = isToday ? (currentMinuteOffset() / 60) * HOUR_HEIGHT : null;

  useEffect(() => {
    if (!scrollRef.current) return;

    if (isToday) {
      scrollRef.current.scrollTop = Math.max(0, (nowTop ?? 0) - HOUR_HEIGHT * 2);
    } else {
      scrollRef.current.scrollTop = 0;
    }
    // Re-run only when the visible day changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey, isToday]);

  useEffect(() => () => clearTimeout(hideTimeoutRef.current), []);

  function showTooltip(task, target) {
    clearTimeout(hideTimeoutRef.current);
    setHoverInfo({ task, ...computeTooltipPosition(target.getBoundingClientRect()) });
  }

  function scheduleHideTooltip() {
    hideTimeoutRef.current = setTimeout(() => setHoverInfo(null), HIDE_DELAY);
  }

  function cancelHideTooltip() {
    clearTimeout(hideTimeoutRef.current);
  }

  const hoverPriority = hoverInfo
    ? priorities.find((item) => item.value === hoverInfo.task.priority)
    : null;

  return (
    <section className={styles.calendar} aria-label={`Расписание на ${formatDayLabel(dateKey)}`}>
      <header className={styles.calendarHeader}>
        <h2>{formatDayLabel(dateKey)}</h2>
        <span>{tasks.length === 0 ? 'нет задач' : `${tasks.length} задач(и)`}</span>
      </header>

      <div className={styles.scrollArea} ref={scrollRef}>
        <div className={styles.grid} style={{ height: gridHeight }}>
          <div className={styles.hoursColumn}>
            {HOURS.map((hour) => (
              <div className={styles.hourLabel} key={hour} style={{ height: HOUR_HEIGHT }}>
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          <div className={styles.tracks}>
            {HOURS.map((hour) => (
              <div className={styles.hourLine} key={hour} style={{ height: HOUR_HEIGHT }} />
            ))}

            {nowTop !== null && nowTop >= 0 && nowTop <= gridHeight && (
              <div className={styles.nowLine} style={{ top: nowTop }}>
                <span />
              </div>
            )}

            {blocks.length === 0 && (
              <div className={styles.emptyState}>На этот день задач не запланировано</div>
            )}

            {blocks.map(({ task, columnIndex, columnCount }) => {
              const { top, height } = getBlockMetrics(task);
              const width = 100 / columnCount;

              return (
                <article
                  className={[
                    styles.taskBlock,
                    styles[task.priority],
                    task.status === 'done' ? styles.done : '',
                    removingTaskIds.includes(task.id) ? styles.removing : '',
                    hoverInfo?.task.id === task.id ? styles.active : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={task.id}
                  style={{
                    top,
                    height,
                    left: `${width * columnIndex}%`,
                    width: `calc(${width}% - 6px)`,
                  }}
                  onMouseEnter={(event) => showTooltip(task, event.currentTarget)}
                  onMouseLeave={scheduleHideTooltip}
                >
                  <div className={styles.blockSummary}>
                    <span className={styles.blockTime}>
                      {task.startTime}–{task.endTime}
                    </span>
                    <p className={styles.blockTitle}>{task.title}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {hoverInfo && (
        <div
          className={styles.tooltip}
          style={{ top: hoverInfo.top, left: hoverInfo.left }}
          onMouseEnter={cancelHideTooltip}
          onMouseLeave={scheduleHideTooltip}
        >
          <div className={styles.tooltipHeader}>
            <span className={styles.priorityBadge}>{hoverPriority?.label}</span>
            <span className={styles.blockTime}>
              {hoverInfo.task.startTime}–{hoverInfo.task.endTime}
            </span>
          </div>

          <h3>{hoverInfo.task.title}</h3>
          {hoverInfo.task.description && <p>{hoverInfo.task.description}</p>}

          <label className={styles.statusControl}>
            <span>Статус</span>
            <select
              value={hoverInfo.task.status}
              onChange={(event) => onStatusChange(hoverInfo.task.id, event.target.value)}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.blockActions}>
            <button type="button" onClick={() => onEdit(hoverInfo.task)}>
              Изменить
            </button>
            <button
              className={styles.dangerButton}
              type="button"
              onClick={() => onDelete(hoverInfo.task.id)}
            >
              Удалить
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default CalendarGrid;
