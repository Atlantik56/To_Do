import { useEffect, useState } from 'react';
import styles from './TaskForm.module.css';

const emptyTask = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
};

function TaskForm({ editingTask, priorities, statuses, onCancelEdit, onSave }) {
  const [form, setForm] = useState(emptyTask);

  useEffect(() => {
    setForm(editingTask ?? emptyTask);
  }, [editingTask]);

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      return;
    }

    onSave({
      title,
      description,
      priority: form.priority,
      status: form.status,
    });

    if (!editingTask) {
      setForm(emptyTask);
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
          rows="5"
          maxLength={260}
        />
      </label>

      <div className={styles.gridFields}>
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
      </div>

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
