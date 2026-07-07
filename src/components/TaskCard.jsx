import styles from './TaskCard.module.css';

function TaskCard({ isRemoving, priorities, statuses, task, onDelete, onEdit, onStatusChange }) {
  const priority = priorities.find((item) => item.value === task.priority);
  const createdDate = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
  }).format(task.createdAt);

  return (
    <article
      className={`${styles.card} ${styles[task.priority]} ${isRemoving ? styles.removing : ''}`}
    >
      <div className={styles.cardTopline}>
        <span className={styles.priorityBadge}>{priority?.label}</span>
        <time dateTime={new Date(task.createdAt).toISOString()}>{createdDate}</time>
      </div>

      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}

      <label className={styles.statusControl}>
        <span>Статус</span>
        <select value={task.status} onChange={(event) => onStatusChange(task.id, event.target.value)}>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.cardActions}>
        <button type="button" onClick={() => onEdit(task)}>
          Изменить
        </button>
        <button className={styles.dangerButton} type="button" onClick={() => onDelete(task.id)}>
          Удалить
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
