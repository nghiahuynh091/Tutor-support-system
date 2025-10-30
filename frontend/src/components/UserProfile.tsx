import React from "react";

interface UserProfileProps {
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  ID?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
  name,
  email,
  avatarUrl,
  bio,
  location,
  ID,
}) => {
  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex items-center px-6 py-4">
        <img
          className="w-20 h-20 object-cover rounded-full border-2 border-blue-500"
          src={avatarUrl || "https://i.pravatar.cc/150?u=default"}
          alt={`${name}'s avatar`}
        />
        <div className="ml-4">
          <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
          <p className="text-sm text-gray-600">{email}</p>
          {ID && <p className="text-sm text-gray-500">ID: {ID}</p>}
          {location && <p className="text-sm text-gray-500">{location}</p>}
        </div>
      </div>
      {bio && (
        <div className="px-6 py-4 border-t border-gray-200">
          <h3 className="text-md font-medium text-gray-700 mb-2">About</h3>
          <p className="text-sm text-gray-600">{bio}</p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
