import { useEffect, useState } from "react";
import api from "../services/api";

type StatsResponse = {
  totalAssets: number;
  pending: number;
  inRepair: number;
  repaired: number;
  totalRepairCost: number;
};

type AssetStatsProps = {
  refreshKey: number;
};

function AssetStats({ refreshKey }: AssetStatsProps) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      try {
        const response = await api.get<StatsResponse>("/FaultyAssets/stats");
        setStats(response.data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, [refreshKey]);

  if (loading) return <p>Loading stats...</p>;
  if (!stats) return <p style={{ color: "red" }}>Could not load stats.</p>;

  return (
    <section style={{ marginTop: "1rem", marginBottom: "1rem" }}>
      <h2>Stats</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(120px, 1fr))", gap: 8 }}>
        <div><strong>Total</strong><div>{stats.totalAssets}</div></div>
        <div><strong>Pending</strong><div>{stats.pending}</div></div>
        <div><strong>In Repair</strong><div>{stats.inRepair}</div></div>
        <div><strong>Repaired</strong><div>{stats.repaired}</div></div>
        <div><strong>Total Cost</strong><div>{stats.totalRepairCost?.toLocaleString() ?? 0}</div></div>
      </div>
    </section>
  );
}

export default AssetStats;