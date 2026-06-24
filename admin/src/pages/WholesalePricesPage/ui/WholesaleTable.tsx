import { useState } from "react";
import type { WholesalePrice, Product } from "@/api/types";
import { formatRub } from "@/shared/utils/formatDate";
import s from "../../SharedForm.module.scss";

interface WholesaleTableProps {
  items: WholesalePrice[];
  products: Product[];
  onAdd: (d: { productId: string; minQuantity: number; price: number }) => void;
  onUpdate: (id: string, d: { minQuantity: number; price: number }) => void;
  onDelete: (id: string) => void;
}

export function WholesaleTable({ items, products, onAdd, onUpdate, onDelete }: WholesaleTableProps) {
  const [adding, setAdding] = useState(false);
  const [newProductId, setNewProductId] = useState("");
  const [newMinQty, setNewMinQty] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMinQty, setEditMinQty] = useState("");
  const [editPrice, setEditPrice] = useState("");

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>Товар</th>
            <th>Мин. объём</th>
            <th>Цена</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((wp) => (
            <tr key={wp.id}>
              <td>{wp.productName}</td>
              <td>
                {editingId === wp.id ? (
                  <input type="number" min="1" value={editMinQty} onChange={(e) => setEditMinQty(e.target.value)} className={s.qtyField} />
                ) : (
                  `от ${wp.minQuantity} шт.`
                )}
              </td>
              <td>
                {editingId === wp.id ? (
                  <input type="number" min="0" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className={s.priceField} />
                ) : (
                  formatRub(wp.price)
                )}
              </td>
              <td>
                <div className="actions">
                  {editingId === wp.id ? (
                    <>
                      <button className="btn btn-primary" onClick={() => { onUpdate(wp.id, { minQuantity: parseInt(editMinQty, 10), price: parseFloat(editPrice) }); setEditingId(null); }}>✓</button>
                      <button className="btn btn-secondary" onClick={() => setEditingId(null)}>✕</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-secondary" onClick={() => { setEditingId(wp.id); setEditMinQty(String(wp.minQuantity)); setEditPrice(String(wp.price)); }}>Изменить</button>
                      <button className="btn btn-danger" onClick={() => { if (confirm("Удалить?")) onDelete(wp.id); }}>Удалить</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {adding && (
        <div className={s.inlineForm}>
          <div className={`form-group ${s.inlineField}`}>
            <label>Товар</label>
            <select value={newProductId} onChange={(e) => setNewProductId(e.target.value)} className={s.selectField}>
              <option value="">— Выбрать —</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className={`form-group ${s.inlineField}`}>
            <label>Мин. кол-во</label>
            <input type="number" min="1" value={newMinQty} onChange={(e) => setNewMinQty(e.target.value)} className={s.qtyField} />
          </div>
          <div className={`form-group ${s.inlineField}`}>
            <label>Цена (₽)</label>
            <input type="number" min="0" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className={s.priceField} />
          </div>
          <button className="btn btn-primary" onClick={() => {
            if (!newProductId || !newMinQty || !newPrice) return;
            onAdd({ productId: newProductId, minQuantity: parseInt(newMinQty, 10), price: parseFloat(newPrice) });
            setNewProductId(""); setNewMinQty(""); setNewPrice("");
            setAdding(false);
          }}>Добавить</button>
          <button className="btn btn-secondary" onClick={() => setAdding(false)}>Отмена</button>
        </div>
      )}

      {!adding && (
        <button className={`btn btn-primary ${s.addBtn}`} onClick={() => setAdding(true)}>
          + Добавить оптовую цену
        </button>
      )}
    </div>
  );
}
