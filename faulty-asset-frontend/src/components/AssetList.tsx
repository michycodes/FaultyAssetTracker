import { useEffect, useState } from "react";
import api from "../services/api";

type AssetListItem = {
  assetTag: string;
  serialNo: string;
  vendor: string;
  branch: string;
  status: string;
  repairCost: number | null;
};

type AssetListProps = {
  refreshKey: number;
};

function AssetList({ refreshKey }: AssetListProps) {
  const [assets, setAssets] = useState<AssetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <p>Loading assets...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2>Assets</h2>
      {assets.length === 0 ? (
        <p>No assets found yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Asset Tag</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Serial No</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Vendor</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Branch</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Status</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>Repair Cost</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={`${asset.assetTag}-${asset.serialNo}`}>
                  <td>{asset.assetTag}</td>
                  <td>{asset.serialNo}</td>
                  <td>{asset.vendor}</td>
                  <td>{asset.branch}</td>
                  <td>{asset.status}</td>
                  <td style={{ textAlign: "right" }}>
                    {asset.repairCost == null ? "-" : asset.repairCost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AssetList;