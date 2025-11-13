import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserProfileProps {
  name: string;
  email: string;
  avatarUrl?: string;
  location?: string;
  ID?: string;
  Faculty?: string;
  role?: "mentee" | "tutor" | "coordinator" | "admin";
}

const UserProfile: React.FC<UserProfileProps> = ({
  name,
  email,
  avatarUrl,
  location,
  ID,
  role,
  Faculty,
}) => {
  const label =
    role === "tutor" ? "Expertise" : role === "mentee" ? "Needs" : null;

  const menteeNeeds = [
    "Math",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Computer Science",
  ];

  const tutorExpertise = [
    "Math",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Computer Science",
  ];

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");

  const options = role === "mentee" ? menteeNeeds : tutorExpertise;

  const [error, setError] = useState("");

  const [isSaved, setIsSaved] = useState(false);

  const addItem = () => {
    if (!newItem) return;

    if (selectedItems.includes(newItem)) {
      setError(`${newItem} is already added.`);
      return;
    }

    setSelectedItems([...selectedItems, newItem]);
    setNewItem("");
    setError("");
  };

  const removeItem = (item: string) => {
    setSelectedItems(selectedItems.filter((i) => i !== item));
  };

  const handleSave = () => {
    if (selectedItems.length === 0) {
      setError(`Please add at least one ${label?.toLowerCase()}.`);
      return;
    }
    setIsSaved(true);
    setError("");
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex items-center px-6 py-6">
        <img
          className="w-20 h-20 object-cover rounded-full border-2 border-blue-500"
          src={avatarUrl || "https://i.pravatar.cc/150?u=default"}
          alt={`${name}'s avatar`}
        />
        <div className="ml-6 space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
          <p className="text-sm text-gray-600">{email}</p>
          {ID && <p className="text-sm text-gray-500">ID: {ID}</p>}
          {location && (
            <p className="text-sm text-gray-500">Location: {location}</p>
          )}
          {Faculty && (
            <p className="text-sm text-gray-500">Faculty: {Faculty}</p>
          )}

          {/* Editable Bio Section */}
          {label && (
            <div className="space-y-2 text-sm text-gray-700">
              {!isSaved ? (
                <>
                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={addItem}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add {label}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <select
                      className="w-full border rounded p-2 text-sm"
                      value={newItem}
                      onChange={(e) => {
                        setNewItem(e.target.value);
                        setError("");
                      }}
                    >
                      <option value="" disabled hidden>
                        Select {label.toLowerCase()}
                      </option>
                      {options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  )}

                  {selectedItems.length === 0 ? (
                    <p className="text-gray-500 italic">
                      No {label.toLowerCase()} added yet
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {selectedItems.map((item) => (
                        <li
                          key={item}
                          className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded"
                        >
                          <span>{item}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button
                    type="button"
                    className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleSave}
                  >
                    Save {label}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-gray-700">
                  <strong>{label}:</strong> {selectedItems.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
