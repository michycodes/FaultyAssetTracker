import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { getPlatformUsers } from '../services/users';

type AssetStatus =
  | 'Pending'
  | 'In Repair'
  | 'Repaired'
  | 'EOL (End of Life)'
  | 'Fixed and Dispatched to Branch'
  | 'Dispatched to Vendor';

type AssetForm = {
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
  status: AssetStatus;
};

type CreateAssetProps = {
  onCreated?: () => void;
};

const vendorOptions = [
  'Chams Access',
  'Pajuno Development Company',
  'Sterling PRO',
  'PFS',
  'BAYTOBY',
  'CARDZPLANET NIGERIA LIMITED',
  'MASTERP GLOBAL NIG LIMITED',
  'YAYIN TECHNOLOGIES',
] as const;

const initialForm: AssetForm = {
  category: '',
  assetName: '',
  ticketId: '',
  serialNo: '',
  assetTag: '',
  branch: '',
  dateReceived: '',
  receivedBy: '',
  vendor: '',
  faultReported: '',
  vendorPickupDate: '',
  repairCost: '',
  status: 'Pending',
};

function CreateAsset({ onCreated }: CreateAssetProps) {
  const [form, setForm] = useState<AssetForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receivedByOptions, setReceivedByOptions] = useState<string[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getPlatformUsers();
        setReceivedByOptions(users);
      } catch {
        toast.error('Could not load users list.');
      }
    };

    void loadUsers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/FaultyAssets', {
        ...form,
        vendorPickupDate: form.vendorPickupDate || null,
        repairCost: form.repairCost === '' ? null : Number(form.repairCost),
      });

      toast.success('Asset tracked successfully!');
      setForm(initialForm);
      onCreated?.();
    } catch (error: any) {
      const message =
        error.response?.data?.title ||
        error.response?.data ||
        'Failed to create asset.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-background border border-gray-800 p-8 rounded-2xl shadow-xl backdrop-blur-sm min-h-screen">
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white">
          Track New Faulty Asset
        </h2>
        <p className="text-gray-400 text-sm">
          Fill in the details below to log a new entry.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full"
      >
        {/* Row 1 */}
        <div className="relative h-14">
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="peer input-field"
            placeholder=" "
            required
          />
          <label className="floating-label">Category</label>
        </div>
        <div className="relative h-14">
          <input
            name="assetName"
            value={form.assetName}
            onChange={handleChange}
            className="peer input-field"
            placeholder=" "
            required
          />
          <label className="floating-label">Asset Name</label>
        </div>

        {/* Row 2 */}
        <div className="relative h-14">
          <input
            name="ticketId"
            value={form.ticketId}
            onChange={handleChange}
            className="peer input-field"
            placeholder=" "
            required
          />
          <label className="floating-label">Ticket ID</label>
        </div>
        <div className="relative h-14">
          <input
            name="serialNo"
            value={form.serialNo}
            onChange={handleChange}
            className="peer input-field"
            placeholder=" "
            required
          />
          <label className="floating-label">Serial Number</label>
        </div>

        {/* Row 3 */}
        <div className="relative h-14">
          <input
            name="assetTag"
            value={form.assetTag}
            onChange={handleChange}
            className="peer input-field"
            placeholder=" "
            required
          />
          <label className="floating-label">Asset Tag</label>
        </div>
        <div className="relative h-14">
          <input
            name="branch"
            value={form.branch}
            onChange={handleChange}
            className="peer input-field"
            placeholder=" "
            required
          />
          <label className="floating-label">Branch</label>
        </div>

        {/* Row 4 - Dates */}
        <div className="relative h-14">
          <input
            type="date"
            name="dateReceived"
            value={form.dateReceived}
            onChange={handleChange}
            className="peer input-field pt-4"
            required
          />
          <label className="floating-label">Date Received</label>
        </div>
        <div className="relative h-14">
          <select
            name="receivedBy"
            value={form.receivedBy}
            onChange={handleChange}
            className="peer input-field appearance-none cursor-pointer"
            required
          >
            <option value="" disabled>
              Select User
            </option>
            {receivedByOptions.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
          <label className="floating-label">Received By</label>
        </div>

        {/* Row 5 */}
        <div className="relative h-14">
          <select
            name="vendor"
            value={form.vendor}
            onChange={handleChange}
            className="peer input-field appearance-none cursor-pointer"
            required
          >
            <option value="" disabled>
              Select Vendor
            </option>
            {vendorOptions.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>
          <label className="floating-label">Vendor</label>
        </div>
        <div className="relative h-14">
          <input
            type="date"
            name="vendorPickupDate"
            value={form.vendorPickupDate}
            onChange={handleChange}
            className="peer input-field pt-4"
          />
          <label className="floating-label">Vendor Pickup Date</label>
        </div>

        {/* Row 6 */}
        <div className="relative h-14">
          <input
            type="number"
            name="repairCost"
            value={form.repairCost}
            onChange={handleChange}
            className="peer input-field"
            placeholder=" "
            min={0}
          />
          <label className="floating-label">Repair Cost (Optional)</label>
        </div>
        <div className="relative h-14">
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="peer input-field appearance-none cursor-pointer"
          >
            <option value="Pending">Pending</option>
            <option value="In Repair">In Repair</option>
            <option value="Repaired">Repaired</option>
            <option value="EOL (End of Life)">EOL (End of Life)</option>
            <option value="Fixed and Dispatched to Branch">
              Fixed and Dispatched to Branch
            </option>
            <option value="Dispatched to Vendor">Dispatched to Vendor</option>
          </select>
          <label className="floating-label">Status</label>
        </div>

        {/* Textarea */}
        <div className="relative md:col-span-2 h-40">
          <textarea
            name="faultReported"
            value={form.faultReported}
            onChange={handleChange}
            placeholder=" "
            required
            className="peer  min-h-30 input-field  py-4 resize-none"
          />
          <label
            className="absolute left-3  -translate-y-1/2 px-1 text-gray-400 transition-all duration-200
                 pointer-events-none bg-background
                 peer-focus:top-0 peer-focus:text-xs peer-focus:text-secondary
                 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs"
          >
            Fault Reported
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="md:col-span-2 bg-primary disabled:bg-gray-700   py-4  transition-all active:scale-[0.98] cursor-pointer text-background/80 hover:bg-background/50 hover:border-primary  duration-300 font-semibold hover:text-secondary px-4 rounded-lg border border-transparent"
        >
          {isSubmitting ? 'Processing...' : 'Create Asset Entry'}
        </button>
      </form>
    </div>
  );
}

export default CreateAsset;
