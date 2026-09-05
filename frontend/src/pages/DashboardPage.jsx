import { useDashboardQuery } from "../app/api.js";
import { Money, ErrorBox } from "../components/ui.jsx";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardQuery();
  if (isLoading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <ErrorBox error={error} />;
  const d = data;

  return (
    <div>
      <h1>Sales dashboard</h1>
      <p className="sub">Pipeline health, conversion and follow-up status.</p>
      <div className="grid stats" style={{ marginTop: 18 }}>
        <div className="card stat"><span>Total leads</span><b>{d.leads.total}</b></div>
        <div className="card stat"><span>Converted</span><b>{d.leads.converted}</b></div>
        <div className="card stat"><span>Conversion rate</span><b>{d.leads.conversionRate}%</b></div>
        <div className="card stat"><span>Customers</span><b>{d.customers.total}</b></div>
        <div className="card stat"><span>Open deals</span><b>{d.deals.open}</b></div>
        <div className="card stat"><span>Pipeline value</span><b><Money value={d.deals.pipelineValue} /></b></div>
        <div className="card stat"><span>Won revenue</span><b><Money value={d.deals.wonRevenue} /></b></div>
        <div className="card stat"><span>Expected revenue</span><b><Money value={d.deals.expectedRevenue} /></b></div>
        <div className="card stat"><span>Pending follow-ups</span><b>{d.activities.pending}</b></div>
        <div className="card stat"><span>Overdue</span><b>{d.activities.overdue}</b></div>
        <div className="card stat"><span>Completed activities</span><b>{d.activities.completed}</b></div>
        <div className="card stat"><span>New this month</span><b>{d.customers.newlyConverted}</b></div>
      </div>

      {d.team?.length > 0 && (
        <div className="card" style={{ marginTop: 18 }}>
          <div style={{ padding: "14px 16px" }}><b>Team performance</b></div>
          <table>
            <thead>
              <tr>
                <th data-label="Executive">Executive</th>
                <th data-label="Leads">Leads</th>
                <th data-label="Open deals">Open deals</th>
                <th data-label="Won revenue">Won revenue</th>
                <th data-label="Activities">Activities</th>
                <th data-label="Overdue">Overdue</th>
              </tr>
            </thead>
            <tbody>
              {d.team.map((row) => (
                <tr key={row.user._id}>
                  <td data-label="Executive">{row.user.name}</td>
                  <td data-label="Leads">{row.leads}</td>
                  <td data-label="Open deals">{row.openDeals}</td>
                  <td data-label="Won revenue"><Money value={row.wonRevenue} /></td>
                  <td data-label="Activities">{row.activities}</td>
                  <td data-label="Overdue">{row.overdue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
