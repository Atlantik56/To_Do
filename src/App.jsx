import { useCallback, useEffect, useMemo, useState } from 'react';
import { PRIORITIES, STATUSES, STORAGE_KEY } from './constants.js';
import {
  addDaysToKey,
  formatDayLabel,
  isPastDateKey,
  minutesToTime,
  timeToMinutes,
  todayKey,
  toDateKey,
} from './utils/dateTime.js';
import FilterBar from './components/FilterBar.jsx';
import CalendarGrid from './components/CalendarGrid.jsx';
import Backlog from './components/Backlog.jsx';
import TaskForm from './components/TaskForm.jsx';
import styles from './App.module.css';

const starterTasks = [
  {
    id: 'task-1',
    title: 'Подготовить недельный план',
    description: 'Собрать ключевые задачи, зависимости и риски по проекту.',
    priority: 'high',
    status: 'todo',
    date: todayKey(),
    startTime: '09:30',
    endTime: '10:30',
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: 'task-2',
    title: 'Обновить дизайн-систему',
    description: 'Проверить состояния кнопок, полей ввода и карточек задач.',
    priority: 'medium',
    status: 'progress',
    date: todayKey(),
    startTime: '10:00',
    endTime: '11:30',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'task-3',
    title: 'Синк с командой дизайна',
    description: 'Обсудить статус макетов и открытые вопросы по флоу.',
    priority: 'low',
    status: 'todo',
    date: todayKey(),
    startTime: '10:15',
    endTime: '10:45',
    createdAt: Date.now() - 1000 * 60 * 55,
  },
  {
    id: 'task-4',
    title: 'Закрыть ретро-заметки',
    description: 'Перенести выводы из ретроспективы в список улучшений.',
    priority: 'low',
    status: 'todo',
    date: addDaysToKey(todayKey(), -1),
    startTime: '16:00',
    endTime: '16:30',
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: 'task-5',
    title: 'Ревью пул-реквестов',
    description: 'Просмотреть открытые PR и оставить комментарии.',
    priority: 'medium',
    status: 'todo',
    date: addDaysToKey(todayKey(), -2),
    startTime: '12:00',
    endTime: '13:00',
    createdAt: Date.now() - 1000 * 60 * 60 * 50,
  },
  {
    id: 'task-6',
    title: 'Подготовить демо для стейкхолдеров',
    description: 'Собрать слайды и прогнать сценарий показа.',
    priority: 'high',
    status: 'todo',
    date: addDaysToKey(todayKey(), 1),
    startTime: '14:00',
    endTime: '15:00',
    createdAt: Date.now() - 1000 * 60 * 10,
  },
];

const defaultFilters = {
  search: '',
  status: 'all',
  priority: 'all',
};

// Backfills date/startTime/endTime for tasks saved before time-blocking existed.
function migrateTask(task) {
  if (task.date && task.startTime && task.endTime) {
    return task;
  }

  const createdDate = new Date(task.createdAt ?? Date.now());
  const date = task.date ?? toDateKey(createdDate);
  const startTime = task.startTime ?? minutesToTime(createdDate.getHours() * 60 + createdDate.getMinutes());
  const endTime = task.endTime ?? minutesToTime(timeToMinutes(startTime) + 60);

  return { ...task, date, startTime, endTime };
}

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    const parsed = savedTasks ? JSON.parse(savedTasks) : starterTasks;
    return parsed.map(migrateTask);
  } catch {
    return starterTasks.map(migrateTask);
  }
}

function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [filters, setFilters] = useState(defaultFilters);
  const [editingTask, setEditingTask] = useState(null);
  const [removingTaskIds, setRemovingTaskIds] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayKey);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const matchesFilters = useCallback(
    (task) => {
      const query = filters.search.trim().toLowerCase();
      const matchesSearch = task.title.toLowerCase().includes(query);
      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      const matchesPriority =
        filters.priority === 'all' || task.priority === filters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    },
    [filters],
  );

  const dayTasks = useMemo(
    () => tasks.filter((task) => task.date === selectedDate && matchesFilters(task)),
    [tasks, selectedDate, matchesFilters],
  );

  const backlogTasks = useMemo(
    () =>
      tasks
        .filter(
          (task) => isPastDateKey(task.date) && task.status !== 'done' && matchesFilters(task),
        )
        .sort((a, b) =>
          a.date === b.date
            ? a.startTime.localeCompare(b.startTime)
            : a.date.localeCompare(b.date),
        ),
    [tasks, matchesFilters],
  );

  const stats = useMemo(
    () =>
      STATUSES.map((status) => ({
        ...status,
        count: tasks.filter((task) => task.status === status.value).length,
      })),
    [tasks],
  );

  function handleSaveTask(taskPayload) {
    if (editingTask) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTask.id ? { ...task, ...taskPayload } : task,
        ),
      );
      setEditingTask(null);
      return;
    }

    const task = {
      ...taskPayload,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };

    setTasks((currentTasks) => [task, ...currentTasks]);
  }

  function handleDeleteTask(taskId) {
    setRemovingTaskIds((currentIds) => [...currentIds, taskId]);

    window.setTimeout(() => {
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
      setRemovingTaskIds((currentIds) => currentIds.filter((id) => id !== taskId));
      setEditingTask((currentTask) => (currentTask?.id === taskId ? null : currentTask));
    }, 240);
  }

  function handleStatusChange(taskId, status) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    );
  }

  function handleReschedule(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, date: todayKey() } : task)),
    );
  }

  return (
    <main className={styles.appShell}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Workspace planner</p>
          <h1>Планировщик рабочих задач</h1>
          <p className={styles.subtitle}>
            Почасовой календарь для тайм-блокинга, приоритетов и быстрых рабочих решений.
          </p>
        </div>

        <div className={styles.statsPanel} aria-label="Статистика задач">
          {stats.map((item) => (
            <div className={styles.statItem} key={item.value}>
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.workspace}>
        <TaskForm
          defaultDate={selectedDate}
          editingTask={editingTask}
          priorities={PRIORITIES}
          statuses={STATUSES}
          onCancelEdit={() => setEditingTask(null)}
          onSave={handleSaveTask}
        />

        <div className={styles.boardArea}>
          <FilterBar
            filters={filters}
            priorities={PRIORITIES}
            statuses={STATUSES}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
          />

          <div className={styles.dayNav}>
            <div className={styles.dayNavGroup}>
              <button type="button" onClick={() => setSelectedDate((d) => addDaysToKey(d, -1))}>
                ← Вчера
              </button>
              <button
                className={selectedDate === todayKey() ? styles.dayNavActive : ''}
                type="button"
                onClick={() => setSelectedDate(todayKey())}
              >
                Сегодня
              </button>
              <button type="button" onClick={() => setSelectedDate((d) => addDaysToKey(d, 1))}>
                Завтра →
              </button>
            </div>

            <label className={styles.dayNavPicker}>
              <span>{formatDayLabel(selectedDate)}</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.calendarArea}>
            <Backlog
              priorities={PRIORITIES}
              tasks={backlogTasks}
              onDelete={handleDeleteTask}
              onEdit={setEditingTask}
              onReschedule={handleReschedule}
            />

            <CalendarGrid
              dateKey={selectedDate}
              priorities={PRIORITIES}
              removingTaskIds={removingTaskIds}
              statuses={STATUSES}
              tasks={dayTasks}
              onDelete={handleDeleteTask}
              onEdit={setEditingTask}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
