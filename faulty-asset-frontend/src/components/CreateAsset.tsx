import { useState } from "react";
import api from "../services/api";

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
  status: "Pending" | "In Repair" | "Repaired";
};

type CreateAssetProps = {
  onCreated?: () => void;
};

const initialForm: AssetForm = {
  category: "",
  assetName: "",
  ticketId: "",
  serialNo: "",
  assetTag: "",
  branch: "",
  dateReceived: "",
  receivedBy: "",
  vendor: "",
  faultReported: "",
  vendorPickupDate: "",
  repairCost: "",
  status: "Pending",
};

function CreateAsset({ onCreated }: CreateAssetProps) {
  const [form, setForm] = useState<AssetForm>(initialForm);

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

    try {
      await api.post("/FaultyAssets", {
        category: form.category,
        assetName: form.assetName,
        ticketId: form.ticketId,
        serialNo: form.serialNo,
        assetTag: form.assetTag,
        branch: form.branch,
        dateReceived: form.dateReceived,
        receivedBy: form.receivedBy,
        vendor: form.vendor,
        faultReported: form.faultReported,
        vendorPickupDate: form.vendorPickupDate || null,
        repairCost: form.repairCost === "" ? null : Number(form.repairCost),
        status: form.status,
      });

      alert("Asset created successfully");
      setForm(initialForm);
      onCreated?.();
    } catch (error: unknown) {
      let message =
        "Failed to create asset. Make sure you are logged in and your user has Admin or Employee role.";

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response
      ) {
        const responseData = error.response.data;

        if (typeof responseData === "string") {
          message = responseData;
        } else if (
          typeof responseData === "object" &&
          responseData !== null &&
          "title" in responseData &&
          typeof responseData.title === "string"
        ) {
          message = responseData.title;
        }
      }

      alert(message);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2>Create Faulty Asset</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
      >
        <input
          name="category"
          placeholder="category"
          value={form.category}
          onChange={handleChange}
          required
        />
        <input
          name="assetName"
          placeholder="asset name"
          value={form.assetName}
          onChange={handleChange}
          required
        />

        <input
          name="ticketId"
          placeholder="ticket id"
          value={form.ticketId}
          onChange={handleChange}
          required
        />
        <input
          name="serialNo"
          placeholder="serial number"
          value={form.serialNo}
          onChange={handleChange}
          required
        />

        <input
          name="assetTag"
          placeholder="asset tag"
          value={form.assetTag}
          onChange={handleChange}
          required
        />
        <input
          name="branch"
          placeholder="branch"
          value={form.branch}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="dateReceived"
          value={form.dateReceived}
          onChange={handleChange}
          required
        />
        <input
          name="receivedBy"
          placeholder="received by"
          value={form.receivedBy}
          onChange={handleChange}
          required
        />

        <input
          name="vendor"
          placeholder="vendor"
          value={form.vendor}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="vendorPickupDate"
          value={form.vendorPickupDate}
          onChange={handleChange}
        />

        <input
          type="number"
          name="repairCost"
          placeholder="repair cost"
          value={form.repairCost}
          onChange={handleChange}
          min={0}
        />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="Pending">Pending</option>
          <option value="In Repair">In Repair</option>
          <option value="Repaired">Repaired</option>
        </select>

        <textarea
          name="faultReported"
          placeholder="fault reported"
          value={form.faultReported}
          onChange={handleChange}
          required
          style={{ gridColumn: "1 / -1" }}
        />

        <button type="submit" style={{ gridColumn: "1 / -1" }}>
          Create Asset
        </button>
      </form>
    </div>
  );
}

export default CreateAsset;