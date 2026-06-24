import type { Category, SalePoint } from "@/api/types";

interface FormFieldsProps {
  form: Record<string, string | boolean>;
  setField: (name: string, value: string | boolean) => void;
  categories: Category[];
  salePoints: SalePoint[];
}

export function ProductFormFields({
  form,
  setField,
  categories,
  salePoints,
}: FormFieldsProps) {
  function flatCats(cats: Category[], depth = 0): { id: string; label: string }[] {
    const result: { id: string; label: string }[] = [];
    for (const c of cats) {
      result.push({ id: c.id, label: "—".repeat(depth) + " " + c.name });
      if (c.children?.length) result.push(...flatCats(c.children, depth + 1));
    }
    return result;
  }

  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Название</label>
          <input id="name" value={String(form.name)} onChange={(e) => setField("name", e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="sku">Артикул (SKU)</label>
          <input id="sku" value={String(form.sku)} onChange={(e) => setField("sku", e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Описание</label>
        <textarea id="description" value={String(form.description)} onChange={(e) => setField("description", e.target.value)} rows={4} />
      </div>

      <div className="form-group">
        <label htmlFor="careGuide">Рекомендации по уходу</label>
        <textarea id="careGuide" value={String(form.careGuide)} onChange={(e) => setField("careGuide", e.target.value)} rows={3} placeholder="Как ухаживать за ёлкой..." />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Категория</label>
          <select id="category" value={String(form.categoryId)} onChange={(e) => setField("categoryId", e.target.value)}>
            <option value="">— Не выбрана —</option>
            {flatCats(categories).map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="salePoint">Точка продаж</label>
          <select id="salePoint" value={String(form.salePointId)} onChange={(e) => setField("salePointId", e.target.value)}>
            <option value="">— Не выбрана —</option>
            {salePoints.map((p) => (
              <option key={p.id} value={p.id}>{p.shortName} — {p.address}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="sort">Сорт / разновидность</label>
          <input id="sort" value={String(form.sort)} onChange={(e) => setField("sort", e.target.value)} placeholder="Русская ель" />
        </div>
        <div className="form-group">
          <label htmlFor="height">Высота (см)</label>
          <input id="height" type="number" min="0" value={String(form.height)} onChange={(e) => setField("height", e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="heightLabel">Высота (лейбл)</label>
          <input id="heightLabel" value={String(form.heightLabel)} onChange={(e) => setField("heightLabel", e.target.value)} placeholder="1.5–2 м" />
        </div>
        <div className="form-group">
          <label htmlFor="price">Цена (₽)</label>
          <input id="price" type="number" min="0" step="0.01" value={String(form.price)} onChange={(e) => setField("price", e.target.value)} required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="costPrice">Закупочная цена (₽)</label>
          <input id="costPrice" type="number" min="0" step="0.01" value={String(form.costPrice)} onChange={(e) => setField("costPrice", e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Количество</label>
          <input id="quantity" type="number" min="0" value={String(form.quantity)} onChange={(e) => setField("quantity", e.target.value)} required />
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={Boolean(form.inStock)} onChange={(e) => setField("inStock", e.target.checked)} />
          В наличии
        </label>
        <label className="checkbox-label" style={{ marginLeft: 24 }}>
          <input type="checkbox" checked={Boolean(form.isHit)} onChange={(e) => setField("isHit", e.target.checked)} />
          Хит
        </label>
        <label className="checkbox-label" style={{ marginLeft: 24 }}>
          <input type="checkbox" checked={Boolean(form.isNew)} onChange={(e) => setField("isNew", e.target.checked)} />
          Новинка
        </label>
      </div>
    </>
  );
}
