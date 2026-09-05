import { useMemo, useState } from "react";
import { permissionName } from "../utils/permissions.js";

export default function RolePermissionPicker({ permissions, selected, onChange }) {
  const [q, setQ] = useState("");
  const items = useMemo(() => {
    return (permissions || [])
      .map((p) => {
        if (typeof p === "string") {
          const parts = p.split("_");
          const resource = parts.slice(1).join("_") || parts[0];
          return { 
            name: p, 
            displayName: p.replace(/_/g, " ").toUpperCase(), 
            category: parts[0] || "other",
            action: parts[0] || "",
            resource: resource
          };
        }
        return p;
      })
      .filter((p) => p?.name);
  }, [permissions]);

  const filtered = items.filter((p) => {
    const hay = `${p.name} ${p.displayName} ${p.category} ${p.resource} ${p.action}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const groups = filtered.reduce((acc, perm) => {
    const key = perm.category || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(perm);
    return acc;
  }, {});

  const selectedSet = new Set(selected);

  function toggle(name) {
    if (selectedSet.has(name)) onChange(selected.filter((n) => n !== name));
    else onChange([...selected, name]);
  }

  function toggleGroup(list, on) {
    const names = list.map((p) => p.name);
    if (on) onChange([...new Set([...selected, ...names])]);
    else onChange(selected.filter((n) => !names.includes(n)));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <label style={{ margin: 0, fontWeight: 600 }}>Permissions ({selected.length} selected)</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            placeholder="Search permissions"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ minWidth: 200, flex: 1 }}
          />
          <button type="button" className="btn secondary" onClick={() => onChange(items.map((p) => p.name))}>Select all</button>
          <button type="button" className="btn secondary" onClick={() => onChange([])}>Clear</button>
        </div>
      </div>
      {Object.entries(groups).map(([category, list]) => {
        const allOn = list.every((p) => selectedSet.has(p.name));
        return (
          <div key={category} className="perm-group">
            <div className="perm-group-head">
              <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
              <label>
                <input type="checkbox" checked={allOn} onChange={(e) => toggleGroup(list, e.target.checked)} />
                All in {category}
              </label>
            </div>
            <div className="perm-grid">
              {list.map((perm) => (
                <label key={perm.name} className={`perm-chip ${selectedSet.has(perm.name) ? "on" : ""}`}>
                  <input type="checkbox" checked={selectedSet.has(perm.name)} onChange={() => toggle(perm.name)} />
                  <span>
                    <b>{perm.displayName || permissionName(perm)}</b>
                    <small>{perm.name}</small>
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
      {!items.length && <p className="sub">No permissions found. Create them from the Permissions page first.</p>}
    </div>
  );
}
