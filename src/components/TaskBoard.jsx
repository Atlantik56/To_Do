import TaskCard from './TaskCard.jsx';
import styles from './TaskBoard.module.css';

function TaskBoard({
  priorities,
  removingTaskIds,
  statuses,
  tasks,
  onDelete,
  onEdit,
  onStatusChange,
}) {
  return (
    <section className={styles.board} aria-label="Канбан-доска задач">
      {statuses.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status.value);

        return (
          <article className={styles.column} key={status.value}>
            <header className={styles.columnHeader}>
              <h2>{status.label}</h2>
              <span>{columnTasks.length}</span>
            </header>

            <div className={styles.taskList}>
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => (
                  <TaskCard
                    isRemoving={removingTaskIds.includes(task.id)}
                    key={task.id}
                    priorities={priorities}
                    statuses={statuses}
                    task={task}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onStatusChange={onStatusChange}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>Здесь пока тихо</div>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default TaskBoard;
