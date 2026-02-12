import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

type AssetListItem = {
  assetTag: string;
  serialNo: string;
  vendor: string;
  branch: string;
  status: string;
  repairCost: number | null;
  lastModifiedBy?: string | null;
  lastModifiedAt?: string | null;
};

type AuditLogItem = {
  id: number;
  assetId: number;
  action: string;
  user: string | null;
  timestamp: string;
};

type AssetListProps = {
  refreshKey: number;
};

type SortBy = "latest" | "status" | "costHighLow" | "costLowHigh" | "assetTag";

function AssetList({ refreshKey }: AssetListProps) {
  const [assets, setAssets] = useState<AssetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("latest");

  const [openAuditFor, setOpenAuditFor] = useState<string>("");
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get<AssetListItem[]>("/FaultyAssets");
        setAssets(response.data);
      } catch {
        setError("Could not load assets.");
      } finally {
        setLoading(false);
      }
    };

    void fetchAssets();
  }, [refreshKey]);

  const sortedAssets = useMemo(() => {
    const list = [...assets];

    if (sortBy === "latest") {
      list.sort((a, b) => {
        const aTime = a.lastModifiedAt ? new Date(a.lastModifiedAt).getTime() : 0;
        const bTime = b.lastModifiedAt ? new Date(b.lastModifiedAt).getTime() : 0;
        return bTime - aTime;
      });
    } else if (sortBy === "status") {
      list.sort((a, b) => a.status.localeCompare(b.status));
    } else if (sortBy === "costHighLow") {
      list.sort((a, b) => (b.repairCost ?? -1) - (a.repairCost ?? -1));
    } else if (sortBy === "costLowHigh") {
      list.sort((a, b) => (a.repairCost ?? Number.MAX_SAFE_INTEGER) - (b.repairCost ?? Number.MAX_SAFE_INTEGER));
    } else if (sortBy === "assetTag") {
      list.sort((a, b) => a.assetTag.localeCompare(b.assetTag));
    }

    return list;
  }, [assets, sortBy]);

  const handleAuditToggle = async (assetTag: string) => {
    if (openAuditFor === assetTag) {
      setOpenAuditFor("");
      setAuditLogs([]);
      return;
    }

    setOpenAuditFor(assetTag);
    setAuditLoading(true);

    try {
      const response = await api.get<AuditLogItem[]>(`/FaultyAssets/${encodeURIComponent(assetTag)}/audit`);
      setAuditLogs(response.data);
    } catch {
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  if (loading) return <p>Loading assets...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Assets</h2>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Sort by
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
            <option value="latest">Latest Modified</option>
            <option value="assetTag">Asset Tag</option>
            <option value="status">Status</option>
            <option value="costHighLow">Repair Cost (High-Low)</option>
            <option value="costLowHigh">Repair Cost (Low-High)</option>
          </select>
        </label>
      </div>

      {sortedAssets.length === 0 ? (
        <p>No assets found yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {sortedAssets.map((asset) => (
            <article
              key={`${asset.assetTag}-${asset.serialNo}`}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: "0.9rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{asset.assetTag}</strong>
                <span
                  style={{
                    padding: "0.2rem 0.55rem",
                    borderRadius: 999,
                    background: "#e0e7ff",
                    fontSize: 12,
                  }}
                >
                  {asset.status}
                </span>
              </div>

              <p style={{ margin: "0.4rem 0" }}><strong>Serial:</strong> {asset.serialNo}</p>
              <p style={{ margin: "0.4rem 0" }}><strong>Vendor:</strong> {asset.vendor}</p>
              <p style={{ margin: "0.4rem 0" }}><strong>Branch:</strong> {asset.branch}</p>
              <p style={{ margin: "0.4rem 0" }}>
                <strong>Repair Cost:</strong> {asset.repairCost == null ? "-" : asset.repairCost.toLocaleString()}
              </p>
              <p style={{ margin: "0.4rem 0" }}>
                <strong>Last Modified By:</strong> {asset.lastModifiedBy || "unknown"}
              </p>
              <p style={{ margin: "0.4rem 0" }}>
                <strong>Last Modified At:</strong>{" "}
                {asset.lastModifiedAt ? new Date(asset.lastModifiedAt).toLocaleString() : "-"}
              </p>

              <button onClick={() => handleAuditToggle(asset.assetTag)}>
                {openAuditFor === asset.assetTag ? "Hide Audit Trail" : "Show Audit Trail"}
              </button>

              {openAuditFor === asset.assetTag && (
                <div style={{ marginTop: "0.75rem", borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem" }}>
                  <h4 style={{ margin: 0, marginBottom: "0.5rem" }}>Audit Trail</h4>
                  {auditLoading ? (
                    <p>Loading audit...</p>
                  ) : auditLogs.length === 0 ? (
                    <p>No audit logs found.</p>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                      {auditLogs.map((log) => (
                        <li key={log.id}>
                          <strong>{log.user || "unknown"}</strong> — {log.action} ({new Date(log.timestamp).toLocaleString()})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AssetList;