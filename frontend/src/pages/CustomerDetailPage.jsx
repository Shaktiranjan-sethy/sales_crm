import { Link, useParams } from "react-router-dom";
import { useGetCustomerQuery, useGetTimelineQuery } from "../app/api.js";
import { ErrorBox, Money, Status } from "../components/ui.jsx";
import Can from "../components/Can.jsx";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useGetCustomerQuery(id);
  const { data: timeline } = useGetTimelineQuery({ entityType: "customer", entityId: id });
  if (isLoading) return <div className="loading">Loading customer...</div>;
  if (error) return <ErrorBox error={error} />;
  const { customer, deals } = data;

  return (
    <div className="grid two-col">
      <div>
        <h1>{customer.firstName} {customer.lastName}</h1>
        <p className="sub">{customer.company} · {customer.email} · Owner {customer.assignedTo?.name}</p>
        <Can permission="edit_customers"><Link className="btn secondary" to={`/customers/${id}/edit`}>Edit customer</Link></Can>
        {customer.lead && <p>Original lead: <Link to={`/leads/${customer.lead._id || customer.lead}`}>view lead</Link></p>}
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ padding: 14 }}><b>Related deals</b></div>
          <table>
            <thead><tr><th>Deal</th><th>Stage</th><th>Value</th></tr></thead>
            <tbody>
              {deals.map((d) => (
                <tr key={d._id}>
                  <td><Link to={`/deals/${d._id}`}>{d.title}</Link></td>
                  <td><Status value={d.stage} /></td>
                  <td><Money value={d.value} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <h3>Timeline</h3>
        <ul className="timeline">
          {(timeline?.events || []).map((ev) => (
            <li key={ev._id}>
              <b>{ev.message}</b>
              <div className="sub">{ev.actor?.name} · {new Date(ev.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
