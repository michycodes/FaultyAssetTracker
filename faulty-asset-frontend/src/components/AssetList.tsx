import { useState, useEffect, useMemo } from "react";
import api from "../services/api";

type AssetListItem = {
  assetTag: string;
  serialNo: string;
  vendor: string;
  branch: string;
  faultReported: string;
  status: "Pending" | "In Repair" | "Repaired";
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

type AssetEditForm = {
  vendor: string;
  branch: string;
  faultReported: string;
  status: "Pending" | "In Repair" | "Repaired";
  repairCost: string;
};

const statusSortOrders: Record<SortBy, string[]> = {
  repaired: ["Repaired", "In Repair", "Pending"],
  inRepair: ["In Repair", "Pending", "Repaired"],
  pending: ["Pending", "In Repair", "Repaired"],
};

function toEditForm(asset: AssetListItem): AssetEditForm {
  return {
    vendor: asset.vendor,
    branch: asset.branch,
    faultReported: asset.faultReported,
    status: asset.status,
    repairCost: asset.repairCost === null ? "" : String(asset.repairCost),
  };
}

function AssetList({ refreshKey }: AssetListProps) {
  const [assets, setAssets] = useState<AssetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const [openAuditFor, setOpenAuditFor] = useState<string>("");
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const [editingAssetTag, setEditingAssetTag] = useState<string>("");
  const [editForm, setEditForm] = useState<AssetEditForm | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fetchAssets = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get<AssetListItem[]>("/FaultyAssets");
      setAssets(response.data);
    } catch {
      setError("Could not load assets.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchAssets();
  }, [refreshKey]);

  const filteredAndSortedAssets = useMemo(() => {
    const list = [...assets];

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = normalizedSearch
      ? list.filter((asset) =>
          asset.assetTag.toLowerCase().includes(normalizedSearch),
        )
      : list;

    const sortOrder = statusSortOrders[sortBy].map((s) => s.toLowerCase());

    filtered.sort((a, b) => {
      const aIndex = sortOrder.indexOf(a.status.toLowerCase());
      const bIndex = sortOrder.indexOf(b.status.toLowerCase());

      if (aIndex !== bIndex) {
        return (
          (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
          (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
        );
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
        `/FaultyAssets/${encodeURIComponent(assetTag)}/audit`,
      );
      setAuditLogs(response.data);
    } catch {
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const startEdit = (asset: AssetListItem) => {
    setSaveError("");
    setEditingAssetTag(asset.assetTag);
    setEditForm(toEditForm(asset));
  };

  const cancelEdit = () => {
    setEditingAssetTag("");
    setEditForm(null);
    setEditLoading(false);
    setSaveError("");
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    if (!editForm) return;

    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveEdit = async (assetTag: string) => {
    if (!editForm) return;

    const repairCostValue = editForm.repairCost.trim();
    const repairCostNumber =
      repairCostValue === "" ? null : Number(repairCostValue);

    if (repairCostNumber !== null && Number.isNaN(repairCostNumber)) {
      setSaveError("Repair cost must be a valid number.");
      return;
    }

    try {
      setSaveError("");
      setEditLoading(true);

      await api.put(`/FaultyAssets/${encodeURIComponent(assetTag)}`, {
        vendor: editForm.vendor,
        branch: editForm.branch,
        faultReported: editForm.faultReported,
        status: editForm.status,
        repairCost: repairCostNumber,
      });

      cancelEdit();
      await fetchAssets(false);
    } catch {
      setSaveError("Could not update this asset.");
    } finally {
      setEditLoading(false);
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
        }}>
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
              onChange={(e) => setSortBy(e.target.value as SortBy)}>
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
          }}>
          {filteredAndSortedAssets.map((asset) => {
            const isEditing =
              editingAssetTag === asset.assetTag && editForm !== null;

            return (
              <article
                key={`${asset.assetTag}-${asset.serialNo}`}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: "0.9rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                  <strong>{asset.assetTag}</strong>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {asset.status === "Pending" && (
                      <button
                        type="button"
                        aria-label={`Edit ${asset.assetTag}`}
                        title="Edit pending asset"
                        disabled={editLoading}
                        onClick={() => startEdit(asset)}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: 18,
                          padding: 0,
                        }}>
                        ✏️
                      </button>
                    )}

                    <span
                      style={{
                        padding: "0.2rem 0.55rem",
                        borderRadius: 999,
                        background: "#e0e7ff",
                        fontSize: 12,
                      }}>
                      {asset.status}
                    </span>
                  </div>
                </div>

                {isEditing && editForm ? (
                  <div
                    style={{
                      marginTop: 8,
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 6,
                    }}>
                    <input
                      name="vendor"
                      value={editForm.vendor}
                      onChange={handleEditChange}
                      placeholder="vendor"
                    />
                    <input
                      name="branch"
                      value={editForm.branch}
                      onChange={handleEditChange}
                      placeholder="branch"
                    />
                    <input
                      name="repairCost"
                      type="number"
                      min={0}
                      value={editForm.repairCost}
                      onChange={handleEditChange}
                      placeholder="repair cost"
                    />
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}>
                      <option value="Pending">Pending</option>
                      <option value="In Repair">In Repair</option>
                      <option value="Repaired">Repaired</option>
                    </select>
                    <textarea
                      name="faultReported"
                      value={editForm.faultReported}
                      onChange={handleEditChange}
                      placeholder="fault reported"
                    />

                    {saveError && (
                      <p style={{ color: "red", margin: 0 }}>{saveError}</p>
                    )}

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        disabled={editLoading}
                        onClick={() => void handleSaveEdit(asset.assetTag)}>
                        {editLoading ? "saving..." : "save"}
                      </button>
                      <button
                        type="button"
                        disabled={editLoading}
                        onClick={cancelEdit}>
                        cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>
                      <strong>serial:</strong> {asset.serialNo}
                    </p>
                    <p>
                      <strong>vendor:</strong> {asset.vendor}
                    </p>
                    <p>
                      <strong>branch:</strong> {asset.branch}
                    </p>
                    <p>
                      <strong>repair cost:</strong> {asset.repairCost ?? "n/a"}
                    </p>
                    <p>
                      <strong>fault reported:</strong>{" "}
                      {asset.faultReported || "n/a"}
                    </p>
                  </>
                )}

                <button
                  style={{ marginTop: 8 }}
                  onClick={() => handleAuditToggle(asset.assetTag)}>
                  {openAuditFor === asset.assetTag
                    ? "hide audit"
                    : "view audit"}
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
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AssetList;
