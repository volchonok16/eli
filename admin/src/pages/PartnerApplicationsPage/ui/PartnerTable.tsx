import type { PartnerApplication, PartnerStatus } from "@/api/types";
import { formatLocal } from "@/shared/utils/formatDate";
import s from "../../SharedForm.module.scss";

interface PartnerTableProps {
  items: PartnerApplication[];
  labels: Record<PartnerStatus, string>;
  onChangeStatus: (id: string, status: PartnerStatus) => void;
  onDelete: (id: string) => void;
  onUploadDoc: (id: string, file: File, type: string) => void;
  onDeleteDoc: (appId: string, docId: string) => void;
}

export function PartnerTable({ items, labels, onChangeStatus, onDelete, onUploadDoc, onDeleteDoc }: PartnerTableProps) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Дата</th>
          <th>Контакт</th>
          <th>Участок</th>
          <th>Документы</th>
          <th>Статус</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{formatLocal(item.createdAt)}</td>
            <td>
              <strong>{item.contactName}</strong>
              {item.organizationName && <div className="text-muted">{item.organizationName}</div>}
              <div className="text-muted">{item.phone}</div>
            </td>
            <td>
              <div>{item.landAddress}</div>
              {item.landArea && <div className="text-muted">{String(item.landArea)} сот.</div>}
            </td>
            <td>
              {item.documents.length > 0 ? (
                <ul className={s.docList}>
                  {item.documents.map((doc) => (
                    <li key={doc.id}>
                      <a href={doc.url} target="_blank" rel="noopener">{doc.originalName ?? doc.id.slice(0, 8)}</a>
                      <button className={`btn btn-danger ${s.docDeleteBtn}`}
                        onClick={() => onDeleteDoc(item.id, doc.id)}>×</button>
                    </li>
                  ))}
                </ul>
              ) : <span className="text-muted">—</span>}
              <input type="file" className={s.docUpload} onChange={(e) => {
                if (e.target.files?.[0]) {
                  onUploadDoc(item.id, e.target.files[0], "CONTRACT");
                  e.target.value = "";
                }
              }} />
            </td>
            <td>
              <select
                value={item.status}
                onChange={(e) => onChangeStatus(item.id, e.target.value as PartnerStatus)}
                className="select-inline"
              >
                {Object.entries(labels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </td>
            <td>
              <button className="btn btn-danger" onClick={() => { if (confirm("Удалить заявку?")) onDelete(item.id); }}>
                Удалить
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
