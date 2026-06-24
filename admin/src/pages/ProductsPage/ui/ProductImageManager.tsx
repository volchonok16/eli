import { type ProductImage } from "@/api/types";

interface ProductImageManagerProps {
  productId: string;
  images: ProductImage[];
  onUpload: (files: FileList) => void;
  onDelete: (imageId: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}

export function ProductImageManager({
  images,
  onUpload,
  onDelete,
  onMove,
}: ProductImageManagerProps) {
  return (
    <>
      <p className="text-muted">
        Можно загрузить несколько файлов сразу. Порядок картинок — это порядок на
        сайте: первая будет главной.
      </p>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files?.length) onUpload(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="image-grid">
        {images.map((img, index) => (
          <div key={img.id} className="image-item">
            <span className="image-order">{index + 1}</span>
            <img src={img.url} alt="" />
            <div className="image-actions">
              <button
                type="button"
                className="image-move"
                onClick={() => onMove(index, -1)}
                disabled={index === 0}
                title="Влево"
              >
                ←
              </button>
              <button
                type="button"
                className="image-move"
                onClick={() => onMove(index, 1)}
                disabled={index === images.length - 1}
                title="Вправо"
              >
                →
              </button>
              <button
                type="button"
                className="image-delete"
                onClick={() => onDelete(img.id)}
                title="Удалить"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
