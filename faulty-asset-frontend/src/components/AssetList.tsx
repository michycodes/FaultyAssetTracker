import { useState, useEffect, useMemo } from "react";
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

type SortBy = "repaired" | "inRepair" | "pending";

const statusSortOrders: Record<SortBy, string[]> = {
  repaired: ["Repaired", "In Repair", "Pending"],
  inRepair: ["In Repair", "Pending", "Repaired"],
  pending: ["Pending", "In Repair", "Repaired"],
};

function AssetList({ refreshKey }: AssetListProps) {
  const [assets, setAssets] = useState<AssetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("pending");
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredAndSortedAssets = useMemo(() => {
    const list = [...assets];

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = normalizedSearch
      ? list.filter((asset) =>
          asset.assetTag.toLowerCase().includes(normalizedSearch)
        )
      : list;

    const sortOrder = statusSortOrders[sortBy].map((s) =>
      s.toLowerCase()
    );

    filtered.sort((a, b) => {
      const aIndex = sortOrder.indexOf(a.status.toLowerCase());
      const bIndex = sortOrder.indexOf(b.status.toLowerCase());

      if (aIndex !== bIndex) {
        return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
          (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
      }

      return a.assetTag.localeCompare(b.assetTag);
    });

    return filtered;
  }, [assets, searchTerm, sortBy]);

  const handleAuditToggle = async (assetTag: string) => {
    if (openAuditFor === assetTag) {
      setOpenAuditFor("");
      setAuditLogs([]);
      return;
    }

    setOpenAuditFor(assetTag);
    setAuditLoading(true);

    try {
      const response = await api.get<AuditLogItem[]>(
        `/FaultyAssets/${encodeURIComponent(assetTag)}/audit`
      );
      setAuditLogs(response.data);
    } catch {
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  if (loading) return <p>loading assets...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>assets</h2>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label>
            search tag
            <input
              type="text"
              placeholder="search by asset tag"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>

          <label>
            sort by status
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="repaired">repaired</option>
              <option value="inRepair">in repair</option>
              <option value="pending">pending</option>
            </select>
          </label>
        </div>
      </div>

      {filteredAndSortedAssets.length === 0 ? (
        <p>no assets found yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {filteredAndSortedAssets.map((asset) => (
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
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

              <p><strong>serial:</strong> {asset.serialNo}</p>
              <p><strong>vendor:</strong> {asset.vendor}</p>
              <p><strong>branch:</strong> {asset.branch}</p>
              <p><strong>repair cost:</strong> {asset.repairCost ?? "n/a"}</p>

              <button
                style={{ marginTop: 8 }}
                onClick={() => handleAuditToggle(asset.assetTag)}
              >
                {openAuditFor === asset.assetTag ? "hide audit" : "view audit"}
              </button>

              {openAuditFor === asset.assetTag && (
                <div style={{ marginTop: "0.75rem" }}>
                  <h4>audit trail</h4>
                  {auditLoading ? (
                    <p>loading audit...</p>
                  ) : auditLogs.length === 0 ? (
                    <p>no audit logs found.</p>
                  ) : (
                    <ul>
                      {auditLogs.map((log) => (
                        <li key={log.id}>
                          <strong>{log.user || "unknown"}</strong> —{" "}
                          {log.action} (
                          {new Date(log.timestamp).toLocaleString()})
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
