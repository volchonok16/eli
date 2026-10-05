import { Link } from "react-router-dom";
import { useCategoryForm } from "./hooks/useCategoryForm";

export function CategoryFormPage() {
  const {
    isEdit,
    name,
    slug,
    parentId,
    sortOrder,
    parentOptions,
    loading,
    saving,
    error,
    changeName,
    changeSlug,
    setParentId,
    setSortOrder,
    handleSubmit,
  } = useCategoryForm();

  if (loading) {
    return <div className="page"><p>Загрузка...</p></div>;
  }

  return (
    <div className="page">
      <div className="header">
        <h1>{isEdit ? "Редактирование категории" : "Новая категория"}</h1>
        <Link to="/categories" className="btn btn-secondary">
          ← Назад
        </Link>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Название</label>
              <input
                id="name"
                value={name}
                onChange={(e) => changeName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="slug">Slug</label>
              <input
                id="slug"
                value={slug}
                onChange={(e) => changeSlug(e.target.value)}
                placeholder="russkie-eli"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="parent">Родительская категория</label>
              <select
                id="parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">— Корневая —</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sort">Порядок сортировки</label>
              <input
                id="sort"
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  );
}
