import { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useProductForm } from "./hooks/useProductForm";
import { ProductFormFields } from "./ui/ProductFormFields";
import { ProductImageManager } from "./ui/ProductImageManager";
import s from "./ProductsPage.module.scss";

export function ProductFormPage() {
  const { id } = useParams();
  const ctx = useProductForm(id);

  function setField(name: string, value: string | boolean) {
    ctx.setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    ctx.save();
  }

  if (ctx.loading) {
    return <div className="page"><p>Загрузка...</p></div>;
  }

  return (
    <div className="page">
      <div className="header">
        <h1>{ctx.isEdit ? "Редактирование товара" : "Новый товар"}</h1>
        <Link to="/products" className="btn btn-secondary">← Назад</Link>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <ProductFormFields
            form={ctx.form}
            setField={setField}
            categories={ctx.categories}
            salePoints={ctx.salePoints}
          />

          {ctx.error && <p className="error">{ctx.error}</p>}

          <button type="submit" className="btn btn-primary" disabled={ctx.saving}>
            {ctx.saving ? "Сохранение..." : "Сохранить"}
          </button>
        </form>

        {ctx.isEdit && id && (
          <div className={s.imageSection}>
            <h3 className={s.imageSectionTitle}>Изображения</h3>
            <ProductImageManager
              productId={id}
              images={ctx.images}
              onUpload={ctx.handleImageUpload}
              onDelete={ctx.handleImageDelete}
              onMove={ctx.handleImageMove}
            />
          </div>
        )}

        {!ctx.isEdit && <p className={s.formHint}>После создания товара можно будет загрузить изображения.</p>}
      </div>
    </div>
  );
}
