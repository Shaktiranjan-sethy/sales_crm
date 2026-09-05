export function Status({ value }) {
  return <span className={`badge ${value || ""}`}>{String(value || "").replaceAll("_", " ")}</span>;
}

export function Badge({ value }) {
  return <span className="badge">{String(value || "").replaceAll("_", " ")}</span>;
}

export function Money({ value }) {
  return <>₹{Number(value || 0).toLocaleString("en-IN")}</>;
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function ErrorBox({ error }) {
  const message = error?.data?.message || error?.error || "Request failed";
  return <div className="error">{message}</div>;
}

export function Empty({ text }) {
  return <div className="empty">{text}</div>;
}

export function Pager({ pagination, page, setPage }) {
  if (!pagination) return null;
  return (
    <div className="pager">
      <span>
        Page {pagination.page} of {pagination.pages} · {pagination.total} records
      </span>
      <button className="btn secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
        Prev
      </button>
      <button
        className="btn secondary"
        disabled={page >= pagination.pages}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
