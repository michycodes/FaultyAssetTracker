import { useEffect, useState } from "react";
import api from "../services/api";
import StatCard from "./StatCard";

type StatsResponse = {
  totalAssets: number;
  pending: number;
  inRepair: number;
  repaired: number;
  eol: number;
  fixedAndDispatchedToBranch: number;
  dispatchedToVendor: number;
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
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6">System Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        <StatCard label="Total Assets" value={stats.totalAssets} color="gray" />
        <StatCard label="Pending" value={stats.pending} color="yellow" />
        <StatCard label="In Repair" value={stats.inRepair} color="blue" />
        <StatCard label="Repaired" value={stats.repaired} color="green" />
        <StatCard label="EOL" value={stats.eol} color="red" />
        <StatCard
          label="Fixed + Branch"
          value={stats.fixedAndDispatchedToBranch}
          color="purple"
        />
        <StatCard
          label="Vendor Dispatched"
          value={stats.dispatchedToVendor}
          color="orange"
        />
        <StatCard
          label="Total Cost"
          value={`₦${stats.totalRepairCost?.toLocaleString()}`}
          color="red"
        />
      </div>
    </section>
  );
}

export default AssetStats;
