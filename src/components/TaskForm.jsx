import { useEffect, useState } from 'react';
import { minutesToTime, timeToMinutes } from '../utils/dateTime.js';
import styles from './TaskForm.module.css';

function buildEmptyTask(defaultDate) {
  return {
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    date: defaultDate,
    startTime: '09:00',
    endTime: '10:00',
  };
}

function TaskForm({ defaultDate, editingTask, priorities, statuses, onCancelEdit, onSave }) {
  const [form, setForm] = useState(() => buildEmptyTask(defaultDate));

  useEffect(() => {
    setForm(editingTask ?? buildEmptyTask(defaultDate));
  }, [editingTask, defaultDate]);

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title || !form.date) {
      return;
    }

    const startTime = form.startTime || '09:00';
    const endTime =
      timeToMinutes(form.endTime || '10:00') > timeToMinutes(startTime)
        ? form.endTime
        : minutesToTime(timeToMinutes(startTime) + 30);

    onSave({
      title,
      description,
      priority: form.priority,
      status: form.status,
      date: form.date,
      startTime,
      endTime,
    });

    if (!editingTask) {
      setForm(buildEmptyTask(defaultDate));
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formHeader}>
        <div>
          <p className={styles.eyebrow}>{editingTask ? 'Редактирование' : 'Новая задача'}</p>
          <h2>{editingTask ? 'Обновить карточку' : 'Добавить в работу'}</h2>
        </div>
      </div>

      <label className={styles.field}>
        <span>Название</span>
        <input
          type="text"
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder="Например: синхронизировать команду"
          maxLength={80}
        />
      </label>

      <label className={styles.field}>
        <span>Описание</span>
        <textarea
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder="Контекст, критерии готовности или важные детали"
          rows="4"
          maxLength={260}
        />
      </label>

      <div className={styles.gridFields}>
        <label className={styles.field}>
          <span>Дата</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Приоритет</span>
          <select
            value={form.priority}
            onChange={(event) => updateField('priority', event.target.value)}
          >
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.gridFields}>
        <label className={styles.field}>
          <span>Начало</span>
          <input
            type="time"
            step={900}
            value={form.startTime}
            onChange={(event) => updateField('startTime', event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Окончание</span>
          <input
            type="time"
            step={900}
            value={form.endTime}
            onChange={(event) => updateField('endTime', event.target.value)}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span>Статус</span>
        <select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.actions}>
        {editingTask && (
          <button className={styles.ghostButton} type="button" onClick={onCancelEdit}>
            Отмена
          </button>
        )}
        <button className={styles.primaryButton} type="submit">
          {editingTask ? 'Сохранить' : 'Создать задачу'}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
