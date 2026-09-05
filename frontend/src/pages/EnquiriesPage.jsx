import { useMemo, useState } from "react";
import { useListEnquiriesQuery } from "../app/api.js";
import { Empty, ErrorBox, Pager, Badge, formatDate } from "../components/ui.jsx";

export default function EnquiriesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [source, setSource] = useState("");
  const [search, setSearch] = useState("");

  const params = useMemo(() => ({ 
    page, 
    limit: 12, 
    status, 
    priority, 
    source,
    search 
  }), [page, status, priority, source, search]);

  const { data, isLoading, error } = useListEnquiriesQuery(params);

  return (
    <div>
      <h1>Enquiries</h1>
      <p className="sub">New and contacted leads requiring attention</p>
      
      <div className="filters">
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="social_media">Social Media</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
        </select>
        <input
          type="text"
          placeholder="Search enquiries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        {isLoading && <div className="loading">Loading enquiries...</div>}
        {error && <ErrorBox error={error} />}
        {!data?.items?.length && !isLoading && <Empty text="No enquiries found." />}
        
        {!!data?.items?.length && (
          <table>
            <thead>
              <tr>
                <th data-label="Name">Name</th>
                <th data-label="Email">Email</th>
                <th data-label="Company">Company</th>
                <th data-label="Source">Source</th>
                <th data-label="Status">Status</th>
                <th data-label="Priority">Priority</th>
                <th data-label="Assigned To">Assigned To</th>
                <th data-label="Created">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((enquiry) => (
                <tr key={enquiry._id}>
                  <td data-label="Name">
                    <strong>{enquiry.firstName} {enquiry.lastName}</strong>
                  </td>
                  <td data-label="Email">{enquiry.email}</td>
                  <td data-label="Company">{enquiry.company || "-"}</td>
                  <td data-label="Source"><Badge value={enquiry.source} /></td>
                  <td data-label="Status"><Badge value={enquiry.status} /></td>
                  <td data-label="Priority"><Badge value={enquiry.priority} /></td>
                  <td data-label="Assigned To">{enquiry.assignedTo?.name || "-"}</td>
                  <td data-label="Created">{formatDate(enquiry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pager pagination={data?.pagination} page={page} setPage={setPage} />
      </div>
    </div>
  );
}
