import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Resource {
  id: number;
  title: string;
  type: "Local" | "HCMUT_LIBRARY";
  fileUrl?: string;
  fileName?: string;
}

function LearningResources({ classId }: { classId: number }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [adding, setAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<"Local" | "HCMUT_LIBRARY" | "">("");
  const [file, setFile] = useState<File | null>(null);
  const { user } = useAuth();

  const fetchResources = useCallback(async () => {
    try {
      const res = await api.get(`/materials/class/${classId}`);
      // Transform backend data to frontend format
      const transformedResources = res.data.map((resource: any) => ({
        id: resource.id,
        title: resource.title,
        type: "Local", // Since we're only handling Local files now
        fileUrl: resource.file_url, // Use the file_url from backend
        fileName: resource.title, // Use title as fileName
      }));
      setResources(transformedResources);
    } catch (err) {
      console.error("Failed to fetch resources", err);
    }
  }, [classId]);

  // Fetch class resources from backend
  useEffect(() => {
    if (classId) {
      fetchResources();
    }
  }, [classId, fetchResources]);

  const handleAddResource = async () => {
    if (!selectedType) return alert("Please select a resource type.");
    if (!user) return alert("You must be logged in to add a resource.");

    try {
      if (selectedType === "Local") {
        if (!file) return alert("Please upload a file.");
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("tutor_id", user.id);

        await api.post(`/materials/class/${classId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Refresh the resources list to get the updated data from backend
        await fetchResources();
        
      } else {
        // HCMUT_LIBRARY logic (if you implement it later)
        const newResource = {
          id: Date.now(),
          title: "Imported from HCMUT_LIBRARY",
          type: "HCMUT_LIBRARY" as const,
        };
        setResources((prev) => [...prev, newResource]);
      }

      setAdding(false);
      setSelectedType("");
      setFile(null);
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
                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#0066cc", textDecoration: "underline" }}>
                      📎 {r.fileName || "Download File"}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <button 
                    onClick={() => handleRemoveResource(r.id)} 
                    style={{ 
                      backgroundColor: "#dc3545", 
                      color: "white", 
                      border: "none", 
                      padding: "5px 10px", 
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!adding && (
        <button 
          onClick={() => setAdding(true)} 
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          ➕ Add Learning Resource
        </button>
      )}

      {adding && (
        <div style={{ 
          marginTop: "15px", 
          padding: "15px", 
          border: "1px solid #ddd", 
          borderRadius: "4px",
          backgroundColor: "#f9f9f9"
        }}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Select Type:
            </label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value as "Local" | "HCMUT_LIBRARY")}
              style={{ 
                padding: "8px", 
                borderRadius: "4px", 
                border: "1px solid #ccc",
                width: "200px"
              }}
            >
              <option value="">-- Select --</option>
              <option value="Local">Local File</option>
              <option value="HCMUT_LIBRARY">HCMUT Library</option>
            </select>
          </div>

          {selectedType === "Local" && (
            <div style={{ marginTop: "10px" }}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  File:
                </label>
                <input 
                  type="file" 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
                  style={{ 
                    padding: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "4px"
                  }}
                />
                <small style={{ display: "block", marginTop: "5px", color: "#666" }}>
                  File will be uploaded to cloud storage
                </small>
              </div>
            </div>
          )}

          {selectedType === "HCMUT_LIBRARY" && (
            <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#fff3cd", border: "1px solid #ffeaa7" }}>
              <p style={{ margin: 0, color: "#856404" }}>
                HCMUT Library integration coming soon...
              </p>
            </div>
          )}

          <div style={{ marginTop: "15px" }}>
            <button 
              onClick={handleAddResource}
              disabled={selectedType === "Local" && !file}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: selectedType === "Local" && !file ? "not-allowed" : "pointer",
                opacity: selectedType === "Local" && !file ? 0.6 : 1,
                marginRight: "10px"
              }}
            >
              Save
            </button>
            <button 
              onClick={() => {
                setAdding(false);
                setSelectedType("");
                setFile(null);
              }}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LearningResources;