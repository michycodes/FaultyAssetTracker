import { useState } from "react";

function CreateAsset() {
  const [form, setForm] = useState({
    assetTag: "",
    serialNo: "",
    vendor: "",
    branch: "",
    status: "Pending",
    faultReported: "",
    repairCost: "",
    dateRetrieved: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("https://localhost:7208/api/FaultyAssets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // later we'll add Authorization: Bearer token here
      },
      body: JSON.stringify({
        ...form,
        repairCost: Number(form.repairCost),
      }),
    });

    if (response.ok) {
      alert("asset created successfully");
      setForm({
        assetTag: "",
        serialNo: "",
        vendor: "",
        branch: "",
        status: "",
        faultReported: "",
        repairCost: "",
        dateRetrieved: "",
      });
    } else {
      alert("failed to create asset");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>create faulty asset</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="assetTag"
          placeholder="asset tag"
          value={form.assetTag}
          onChange={handleChange}
        />

        <input
          name="serialNo"
          placeholder="serial number"
          value={form.serialNo}
          onChange={handleChange}
        />

        <input
          name="vendor"
          placeholder="vendor"
          value={form.vendor}
          onChange={handleChange}
        />

        <input
          name="branch"
          placeholder="branch"
          value={form.branch}
          onChange={handleChange}
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
        />

        <input
          type="number"
          name="repairCost"
          placeholder="repair cost"
          value={form.repairCost}
          onChange={handleChange}
        />

        <input
          type="date"
          name="dateRetrieved"
          value={form.dateRetrieved}
          onChange={handleChange}
        />

        <button type="submit">create asset</button>
      </form>
    </div>
  );
}

export default CreateAsset;
