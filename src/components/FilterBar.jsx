import styles from './FilterBar.module.css';

function FilterBar({ filters, priorities, statuses, onChange, onReset }) {
  function updateFilter(field, value) {
    onChange((currentFilters) => ({ ...currentFilters, [field]: value }));
  }

  const hasActiveFilters =
    filters.search || filters.status !== 'all' || filters.priority !== 'all';

  return (
    <section className={styles.filterBar} aria-label="Фильтры задач">
      <label className={styles.searchField}>
        <span>Поиск</span>
        <input
          type="search"
          value={filters.search}
          onChange={(event) => updateFilter('search', event.target.value)}
          placeholder="Найти задачу по названию"
        />
      </label>

      <label className={styles.selectField}>
        <span>Статус</span>
        <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
          <option value="all">Все статусы</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.selectField}>
        <span>Приоритет</span>
        <select
          value={filters.priority}
          onChange={(event) => updateFilter('priority', event.target.value)}
        >
          <option value="all">Все приоритеты</option>
          {priorities.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>
      </label>

      <button className={styles.resetButton} type="button" onClick={onReset} disabled={!hasActiveFilters}>
        Сбросить
      </button>
    </section>
  );
}

export default FilterBar;
