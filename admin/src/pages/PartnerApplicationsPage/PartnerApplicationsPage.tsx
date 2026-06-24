import { usePartnerApplications } from "./hooks/usePartnerApplications";
import { PartnerTable } from "./ui/PartnerTable";

export function PartnerApplicationsPage() {
  const { data, loading, error, changeStatus, remove, uploadDoc, deleteDoc, STATUS_LABELS } = usePartnerApplications();

  return (
    <div className="page">
      <div className="header">
        <h1>Заявки арендодателей</h1>
      </div>
      <div className="card">
        <p className="text-muted">
          Заявки от владельцев участков под ёлочные базары. Меняйте статус,
          загружайте договоры. Партнёр видит статус в личном кабинете.
        </p>
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && <p>Заявок пока нет.</p>}
        {!loading && data.length > 0 && (
          <PartnerTable
            items={data}
            labels={STATUS_LABELS}
            onChangeStatus={changeStatus}
            onDelete={remove}
            onUploadDoc={uploadDoc}
            onDeleteDoc={deleteDoc}
          />
        )}
      </div>
    </div>
  );
}
