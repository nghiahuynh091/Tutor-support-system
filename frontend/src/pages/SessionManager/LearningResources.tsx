import { useState, useEffect } from "react";

interface Resource {
  id: number;
  title: string;
  type: "Local" | "HCMUT_LIBRARY";
  fileUrl?: string; // link to uploaded file or external URL
  fileName?: string;
}

function LearningResources() {
  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem("learningResources");
    return saved ? JSON.parse(saved) : [];
  });

  const [adding, setAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<"Local" | "HCMUT_LIBRARY" | "">("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");

  useEffect(() => {
    localStorage.setItem("learningResources", JSON.stringify(resources));
  }, [resources]);

  const handleAddClick = () => {
    setAdding(true);
  };

  const handleAddResource = () => {
    if (!selectedType) {
      alert("Please select a resource type.");
      return;
    }

    if (selectedType === "Local") {
      if (title.trim() === "") {
        alert("Please enter a title.");
        return;
      }

      let newResource: Resource = {
        id: Date.now(),
        title,
        type: "Local",
      };

      if (file) {
        const fileUrl = URL.createObjectURL(file);
        newResource.fileUrl = fileUrl;
        newResource.fileName = file.name;
      } else if (link.trim() !== "") {
        newResource.fileUrl = link.trim();
        newResource.fileName = link.trim();
      } else {
        alert("Please upload a file or enter a link.");
        return;
      }

      setResources([...resources, newResource]);
    }

    if (selectedType === "HCMUT_LIBRARY") {
      const newResource: Resource = {
        id: Date.now(),
        title: "Imported from HCMUT_LIBRARY",
        type: "HCMUT_LIBRARY",
      };
      setResources([...resources, newResource]);
    }

    setAdding(false);
    setTitle("");
    setSelectedType("");
    setFile(null);
    setLink("");
  };

  const handleRemoveResource = (id: number) => {
    if (confirm("Are you sure you want to remove this resource?")) {
      setResources(resources.filter((r) => r.id !== id));
    }
  };

  return (
    <div style={{ marginTop: 15 }}>
      <h3>📚 Learning Resources</h3>

      {resources.length === 0 ? (
        <p>No learning resources added yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
            backgroundColor: "#f8fbff",
            border: "1px solid #b3d9ff",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#cce6ff" }}>
              <th style={{ padding: "8px", textAlign: "left" }}>Title</th>
              <th style={{ padding: "8px" }}>Type</th>
              <th style={{ padding: "8px" }}>Resource</th>
              <th style={{ padding: "8px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: "8px" }}>{r.title}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{r.type}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>
                  {r.fileUrl ? (
                    <a
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#007BFF", textDecoration: "underline" }}
                    >
                      {r.fileName || "Open"}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td style={{ padding: "8px", textAlign: "center" }}>
                  <button
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleRemoveResource(r.id)}
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
          onClick={handleAddClick}
          style={{
            marginTop: "15px",
            padding: "8px 15px",
            borderRadius: "8px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          ➕ Add Learning Resource
        </button>
      )}

      {adding && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            border: "1px solid #b3d9ff",
            borderRadius: "8px",
            backgroundColor: "#f0f8ff",
          }}
        >
          <h4>Add New Resource</h4>

          <label>
            <strong>Select Type:</strong>
          </label>
          <div style={{ marginTop: "5px" }}>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as "Local" | "HCMUT_LIBRARY")}
              style={{
                padding: "5px",
                borderRadius: "6px",
                border: "1px solid #66b3ff",
              }}
            >
              <option value="">-- Select --</option>
              <option value="Local">Local Resource</option>
              <option value="HCMUT_LIBRARY">HCMUT_LIBRARY</option>
            </select>
          </div>

          {selectedType === "Local" && (
            <>
              <div style={{ marginTop: "10px" }}>
                <label>
                  <strong>Enter Title:</strong>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter resource title"
                  style={{
                    width: "100%",
                    padding: "6px",
                    marginTop: "5px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              <div style={{ marginTop: "10px" }}>
                <label>
                  <strong>Upload File:</strong>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ display: "block", marginTop: "5px" }}
                />
              </div>

              <div style={{ marginTop: "10px" }}>
                <label>
                  <strong>Or enter a link:</strong>
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com/resource"
                  style={{
                    width: "100%",
                    padding: "6px",
                    marginTop: "5px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            </>
          )}

          {selectedType === "HCMUT_LIBRARY" && (
            <p style={{ color: "#0066cc", marginTop: "10px" }}>
              🔗 (Integration with HCMUT_LIBRARY will be available soon.)
            </p>
          )}

          <div style={{ marginTop: "15px" }}>
            <button
              onClick={handleAddResource}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                marginRight: "10px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              onClick={() => setAdding(false)}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
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
