import { useEffect, useMemo, useState } from 'react';
import { PRIORITIES, STATUSES, STORAGE_KEY } from './constants.js';
import FilterBar from './components/FilterBar.jsx';
import TaskBoard from './components/TaskBoard.jsx';
import TaskForm from './components/TaskForm.jsx';
import styles from './App.module.css';

const starterTasks = [
  {
    id: 'task-1',
    title: 'Подготовить недельный план',
    description: 'Собрать ключевые задачи, зависимости и риски по проекту.',
    priority: 'high',
    status: 'todo',
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: 'task-2',
    title: 'Обновить дизайн-систему',
    description: 'Проверить состояния кнопок, полей ввода и карточек задач.',
    priority: 'medium',
    status: 'progress',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'task-3',
    title: 'Закрыть ретро-заметки',
    description: 'Перенести выводы из ретроспективы в список улучшений.',
    priority: 'low',
    status: 'done',
    createdAt: Date.now() - 1000 * 60 * 20,
  },
];

const defaultFilters = {
  search: '',
  status: 'all',
  priority: 'all',
};

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : starterTasks;
  } catch {
    return starterTasks;
  }
}

function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [filters, setFilters] = useState(defaultFilters);
  const [editingTask, setEditingTask] = useState(null);
  const [removingTaskIds, setRemovingTaskIds] = useState([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(query);
      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      const matchesPriority =
        filters.priority === 'all' || task.priority === filters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [filters, tasks]);

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

  return (
    <main className={styles.appShell}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Workspace planner</p>
          <h1>Планировщик рабочих задач</h1>
          <p className={styles.subtitle}>
            Канбан-доска для фокуса, приоритетов и быстрых рабочих решений.
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

          <TaskBoard
            priorities={PRIORITIES}
            removingTaskIds={removingTaskIds}
            statuses={STATUSES}
            tasks={filteredTasks}
            onDelete={handleDeleteTask}
            onEdit={setEditingTask}
            onStatusChange={handleStatusChange}
          />
        </div>
      </section>
    </main>
  );
}

export default App;
