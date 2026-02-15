import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { PencilLine } from 'lucide-react';

type AssetListItem = {
  category: string;
  assetName: string;
  ticketId: string;
  serialNo: string;
  assetTag: string;
  branch: string;
  dateReceived: string;
  receivedBy: string;
  vendor: string;
  faultReported: string;
  vendorPickupDate: string;
  repairCost: string;
  status: 'Pending' | 'In Repair' | 'Repaired';
};

type AuditLogItem = {
  id: number;
  action: string;
  user: string | null;
  timestamp: string;
};

type AssetListProps = { refreshKey: number };
type SortBy = 'repaired' | 'inRepair' | 'pending';

const statusSortOrders: Record<SortBy, string[]> = {
  repaired: ['Repaired', 'In Repair', 'Pending'],
  inRepair: ['In Repair', 'Pending', 'Repaired'],
  pending: ['Pending', 'In Repair', 'Repaired'],
};

// --- Component ---
function AssetList({ refreshKey }: AssetListProps) {
  const [assets, setAssets] = useState<AssetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Audit State
  const [openAuditFor, setOpenAuditFor] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Edit State
  const [editingAssetTag, setEditingAssetTag] = useState('');
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchAssets = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await api.get<AssetListItem[]>('/FaultyAssets');
      setAssets(response.data);
    } catch {
      toast.error('Could not load assets.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAssets();
  }, [refreshKey]);

  // Search & Sort Logic
  const filteredAssets = useMemo(() => {
    const list = assets.filter((a) =>
      a.assetTag.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const order = statusSortOrders[sortBy].map((s) => s.toLowerCase());
    return list.sort(
      (a, b) =>
        order.indexOf(a.status.toLowerCase()) -
        order.indexOf(b.status.toLowerCase()),
    );
  }, [assets, searchTerm, sortBy]);

  const handleAuditToggle = async (tag: string) => {
    if (openAuditFor === tag) return setOpenAuditFor('');
    setOpenAuditFor(tag);
    setAuditLoading(true);
    try {
      const res = await api.get(
        `/FaultyAssets/${encodeURIComponent(tag)}/audit`,
      );
      setAuditLogs(res.data);
    } catch {
      toast.error('Failed to load audit logs.');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleSaveEdit = async (tag: string) => {
    setEditLoading(true);
    try {
      await api.put(`/FaultyAssets/${encodeURIComponent(tag)}`, {
        ...editForm,
        repairCost:
          editForm.repairCost === '' ? null : Number(editForm.repairCost),
      });
      toast.success('Asset updated!');
      setEditingAssetTag('');
      await fetchAssets(false);
    } catch {
      toast.error('Update failed.');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 animate-pulse text-gray-500">
        Loading assets...
      </div>
    );

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-white">Assets Inventory</h2>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-900/50 border border-neutral-800 rounded-lg px-4 py-2 text-sm focus:border-green-500 outline-none w-64 transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-neutral-900/50 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-gray-300 outline-none focus:border-green-500 cursor-pointer"
          >
            <option value="pending">Sort by Pending</option>
            <option value="inRepair">Sort by In Repair</option>
            <option value="repaired">Sort by Repaired</option>
          </select>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-neutral-800 rounded-2xl">
          <p className="text-gray-500">
            No assets found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => {
            const isEditing = editingAssetTag === asset.assetTag;

            return (
              <article
                key={asset.assetTag}
                className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 hover:border-gray-700 transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-green-500 transition-colors">
                      {asset.assetTag}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                      {asset.serialNo}
                    </p>
                  </div>
                  <StatusBadge status={asset.status} />
                </div>

                {isEditing ? (
                  <div className="space-y-3 flex-1">
                    <EditInput
                      name="vendor"
                      value={editForm.vendor}
                      onChange={(e) =>
                        setEditForm({ ...editForm, vendor: e.target.value })
                      }
                      label="Vendor"
                    />
                    <EditInput
                      name="branch"
                      value={editForm.branch}
                      onChange={(e) =>
                        setEditForm({ ...editForm, branch: e.target.value })
                      }
                      label="Branch"
                    />
                    <EditInput
                      name="repairCost"
                      type="number"
                      value={editForm.repairCost}
                      onChange={(e) =>
                        setEditForm({ ...editForm, repairCost: e.target.value })
                      }
                      label="Cost"
                    />
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleSaveEdit(asset.assetTag)}
                        className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-500"
                      >
                        {editLoading ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingAssetTag('')}
                        className="flex-1 bg-neutral-800 text-gray-400 text-xs font-bold py-2 rounded-lg hover:bg-neutral-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ticket ID:</span>{' '}
                      <span>{asset.ticketId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vendor:</span>{' '}
                      <span>{asset.vendor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vendor Pickup Date:</span>{' '}
                      <span>
                        {asset.vendorPickupDate?.toLocaleString() ?? 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Branch:</span>{' '}
                      <span>{asset.branch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date Received:</span>
                      <span>
                        {asset.dateReceived.toLocaleString() ?? 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Received By:</span>{' '}
                      <span>{asset.receivedBy}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Repair Cost:</span>{' '}
                      <span className="text-green-500 font-mono">
                        ₦{asset.repairCost?.toLocaleString() ?? '0'}
                      </span>
                    </div>
                    <div className="mt-4 p-3 bg-black/20 rounded-lg border border-neutral-800/50">
                      <p className="text-xs text-gray-500 leading-relaxed italic line-clamp-2">
                        "{asset.faultReported || 'No description provided'}"
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex items-center gap-2">
                  <button
                    onClick={() => handleAuditToggle(asset.assetTag)}
                    className="flex-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors py-2 border border-neutral-800 rounded-lg hover:bg-neutral-800"
                  >
                    {openAuditFor === asset.assetTag
                      ? 'Hide History'
                      : 'View History'}
                  </button>
                  {!isEditing && asset.status === 'Pending' && (
                    <button
                      onClick={() => {
                        setEditingAssetTag(asset.assetTag);
                        setEditForm({
                          ...asset,
                          repairCost: asset.repairCost || '',
                        });
                      }}
                      className="px-3 py-2 text-gray-500 hover:text-green-500 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-all"
                    >
                      <PencilLine className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Audit Trail Dropdown */}
                {openAuditFor === asset.assetTag && (
                  <div className="mt-4 p-4 bg-black/40 rounded-xl border border-neutral-800/50 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                      Audit Trail
                    </h4>
                    {auditLoading ? (
                      <div className="text-[10px] text-gray-700 animate-pulse">
                        Loading logs...
                      </div>
                    ) : auditLogs.length === 0 ? (
                      <p className="text-[10px] text-gray-700">No logs.</p>
                    ) : (
                      <ul className="space-y-3 border-l border-neutral-800 pl-4 ml-1">
                        {auditLogs.map((log) => (
                          <li key={log.id} className="relative">
                            <span className="absolute -left-5.25 top-1 w-2 h-2 rounded-full bg-neutral-800 border border-neutral-700" />
                            <p className="text-[11px] text-gray-200">
                              <span className="font-bold text-green-500">
                                {log.user || 'System'}
                              </span>{' '}
                              {log.action}
                            </p>
                            <p className="text-[9px] text-gray-600">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </p>
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

// --- Internal Sub-components ---
const StatusBadge = ({ status }: { status: string }) => {
  const themes: any = {
    Pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'In Repair': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Repaired: 'bg-green-500/10 text-green-500 border-green-500/20',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${themes[status]}`}
    >
      {status}
    </span>
  );
};

const EditInput = ({ label, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-[9px] uppercase font-bold text-gray-600 ml-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-secondary transition-all"
    />
  </div>
);

export default AssetList;
