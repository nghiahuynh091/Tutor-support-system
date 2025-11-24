import { useState, useEffect } from "react";
import api from "@/lib/api"

interface Resource {
  id: number;
  title: string;
  type: "Local" | "HCMUT_LIBRARY";
  fileUrl?: string;
  fileName?: string;
}

function LearningResources({ sessionId }: { sessionId: number }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [adding, setAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<"Local" | "HCMUT_LIBRARY" | "">("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");

  // Fetch session resources from backend
  useEffect(() => {
    api
      .get(`/materials/session/${sessionId}`)
      .then((res) => setResources(res.data))
      .catch((err) => console.error("Failed to fetch resources", err));
  }, [sessionId]);

  const handleAddResource = async () => {
    if (!selectedType) return alert("Please select a resource type.");

    try {
      let newResource: Resource;

      if (selectedType === "Local") {
        if (!file && !link) return alert("Upload a file or enter a link.");
        const formData = new FormData();
        if (file) formData.append("file", file);
        // Using a dummy tutor_id; replace with actual logged-in tutor id
        const tutor_id = localStorage.getItem("tutor_id") || "00000000-0000-0000-0000-000000000000";

        const response = await api.post(`/materials/session/${sessionId}`, formData, {
          params: { tutor_id },
          headers: { "Content-Type": "multipart/form-data" },
        });

        newResource = {
          id: response.data.resource_id,
          title: title || file?.name || link,
          type: "Local",
          fileUrl: file ? URL.createObjectURL(file) : link,
          fileName: file?.name || link,
        };
      } else {
        newResource = {
          id: Date.now(),
          title: "Imported from HCMUT_LIBRARY",
          type: "HCMUT_LIBRARY",
        };
      }

      setResources((prev) => [...prev, newResource]);
      setAdding(false);
      setSelectedType("");
      setTitle("");
      setFile(null);
      setLink("");
    } catch (err) {
      console.error("Failed to upload resource", err);
      alert("Error uploading resource");
    }
  };

  const handleRemoveResource = async (id: number) => {
    if (!confirm("Are you sure you want to remove this resource?")) return;

    try {
      await api.delete(`/materials/${id}`);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to delete resource", err);
      alert("Error deleting resource");
    }
  };

  return (
    <div style={{ marginTop: 15 }}>
      <h3>📚 Learning Resources</h3>

      {resources.length === 0 ? (
        <p>No learning resources yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10, backgroundColor: "#f8fbff" }}>
          <thead>
            <tr style={{ backgroundColor: "#cce6ff" }}>
              <th>Title</th>
              <th>Type</th>
              <th>Resource</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{r.type}</td>
                <td>
                  {r.fileUrl ? (
                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer">
                      {r.fileName || "Open"}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <button onClick={() => handleRemoveResource(r.id)} style={{ backgroundColor: "#dc3545", color: "white" }}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!adding && <button onClick={() => setAdding(true)}>➕ Add Learning Resource</button>}

      {adding && (
        <div>
          <label>Select Type:</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as "Local" | "HCMUT_LIBRARY")}>
            <option value="">-- Select --</option>
            <option value="Local">Local</option>
            <option value="HCMUT_LIBRARY">HCMUT_LIBRARY</option>
          </select>

          {selectedType === "Local" && (
            <>
              <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
              <input type="url" placeholder="Or link" value={link} onChange={(e) => setLink(e.target.value)} />
            </>
          )}

          <button onClick={handleAddResource}>Save</button>
          <button onClick={() => setAdding(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default LearningResources;
