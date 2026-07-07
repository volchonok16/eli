import { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useProductForm } from "./hooks/useProductForm";
import { ProductFormFields } from "./ui/ProductFormFields";
import { ProductImageManager } from "./ui/ProductImageManager";
import { SkeletonForm } from "@/shared/components";
import s from "./ProductsPage.module.scss";

export function ProductFormPage() {
  const { id } = useParams();
  const ctx = useProductForm(id);

  if (ctx.loading) {
    return (
      <div className="page">
        <div className="header"><h1>Загрузка...</h1></div>
        <div className="card"><SkeletonForm fields={8} /></div>
      </div>
    );
  }

  function setField(name: string, value: string | boolean) {
    ctx.setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    ctx.save();
  }

  return (
    <div className="page">
      <div className="header">
        <h1>{ctx.isEdit ? "Редактирование товара" : "Новый товар"}</h1>
        <Link to="/products" className="btn btn-secondary">← Назад</Link>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <ProductFormFields form={ctx.form} setField={setField} categories={ctx.categories} salePoints={ctx.salePoints} />

          {ctx.error && <p className="error">{ctx.error}</p>}

          <button type="submit" className="btn btn-primary" disabled={ctx.saving} style={{ marginTop: 8 }}>
            {ctx.saving ? "Сохранение..." : ctx.isEdit ? "Сохранить изменения" : "Создать товар"}
          </button>
        </form>

        <div className={s.imageSection}>
          <h3 className={s.imageSectionTitle}>Изображения</h3>
          {ctx.isEdit ? (
            <ProductImageManager productId={id!} images={ctx.images} onUpload={ctx.handleImageUpload} onDelete={ctx.handleImageDelete} onMove={ctx.handleImageMove} />
          ) : (
            <div>
              <p className="form-hint" style={{ marginBottom: 12 }}>Загрузите фото товара (до 10 файлов). Первое станет главным.</p>
              <input type="file" accept="image/*" multiple onChange={(e) => { if (e.target.files?.length) ctx.handleFilesSelected(e.target.files); e.target.value = ""; }} />
              {ctx.pendingFiles.length > 0 && (
                <div className="image-grid">
                  {ctx.pendingFiles.map((file, index) => (
                    <div key={index} className="image-item">
                      <span className="image-order">{index + 1}</span>
                      <img src={URL.createObjectURL(file)} alt="" />
                      <div className="image-actions">
                        <button type="button" className="image-delete" onClick={() => ctx.handlePendingFileRemove(index)} title="Удалить">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
