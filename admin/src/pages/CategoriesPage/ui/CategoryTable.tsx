import { Link } from "react-router-dom";
import type { Category } from "@/api/types";

function renderTree(categories: Category[], onDelete: (id: string, name: string) => void, level = 0) {
  return categories.map((cat) => (
    <CategoryRow key={cat.id} category={cat} onDelete={onDelete} level={level}>
      {cat.children.length > 0 && renderTree(cat.children, onDelete, level + 1)}
    </CategoryRow>
  ));
}

function CategoryRow({
  category,
  onDelete,
  level,
  children,
}: {
  category: Category;
  onDelete: (id: string, name: string) => void;
  level: number;
  children?: React.ReactNode;
}) {
  const indent = level * 24;
  return (
    <>
      <tr>
        <td style={{ paddingLeft: 12 + indent }}>
          <Link to={`/categories/${category.id}`}>{category.name}</Link>
        </td>
        <td>{category.slug}</td>
        <td>
          <div className="actions">
            <Link to={`/categories/${category.id}`} className="btn btn-secondary">
              Изменить
            </Link>
            <button
              className="btn btn-danger"
              onClick={() => onDelete(category.id, category.name)}
            >
              Удалить
            </button>
          </div>
        </td>
      </tr>
      {children}
    </>
  );
}

function buildTree(categories: Category[]): Category[] {
  const map = new Map<string, Category>();
  const roots: Category[] = [];

  for (const c of categories) {
    map.set(c.id, { ...c, children: [] });
  }

  for (const c of map.values()) {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(c);
    } else {
      roots.push(c);
    }
  }

  return roots;
}

interface CategoryTableProps {
  categories: Category[];
  onDelete: (id: string, name: string) => void;
}

export function CategoryTable({ categories, onDelete }: CategoryTableProps) {
  const tree = buildTree(categories);

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Название</th>
          <th>Slug</th>
          <th></th>
        </tr>
      </thead>
      <tbody>{renderTree(tree, onDelete)}</tbody>
    </table>
  );
}
