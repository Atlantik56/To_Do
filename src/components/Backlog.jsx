import { formatDateHeading } from '../utils/dateTime.js';
import styles from './Backlog.module.css';

function Backlog({ priorities, tasks, onDelete, onEdit, onReschedule }) {
  return (
    <aside className={styles.backlog} aria-label="Бэклог просроченных задач">
      <header className={styles.backlogHeader}>
        <h2>Бэклог</h2>
        {tasks.length > 0 && <span className={styles.countBadge}>{tasks.length}</span>}
      </header>

      {tasks.length === 0 ? (
        <div className={styles.emptyState}>Просроченных задач нет</div>
      ) : (
        <ul className={styles.list}>
          {tasks.map((task) => {
            const priority = priorities.find((item) => item.value === task.priority);

            return (
              <li className={`${styles.item} ${styles[task.priority]}`} key={task.id}>
                <div className={styles.itemTop}>
                  <span className={styles.overdueBadge}>Просрочено</span>
                  <span className={styles.itemDate}>{formatDateHeading(task.date)}</span>
                </div>

                <p className={styles.itemTitle}>{task.title}</p>
                {task.description && <p className={styles.itemDescription}>{task.description}</p>}

                <div className={styles.itemMeta}>
                  <span className={styles.priorityBadge}>{priority?.label}</span>
                  <span>
                    {task.startTime}–{task.endTime}
                  </span>
                </div>

                <div className={styles.itemActions}>
                  <button type="button" onClick={() => onReschedule(task.id)}>
                    На сегодня
                  </button>
                  <button type="button" onClick={() => onEdit(task)}>
                    Изменить
                  </button>
                  <button className={styles.dangerButton} type="button" onClick={() => onDelete(task.id)}>
                    Удалить
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

export default Backlog;
