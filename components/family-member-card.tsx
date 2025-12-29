"use client";

import Image from "next/image";
import { calculateAge } from "@/lib/utils/age";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: "father" | "mother" | "son" | "daughter" | "parent" | "child" | null;
  photo_url: string | null;
  date_of_birth: string | null;
  bio: string | null;
}

interface FamilyMemberCardProps {
  profile: Profile;
  isOwnProfile?: boolean;
  onEdit?: () => void;
}

const roleLabels = {
  father: "Father",
  mother: "Mother",
  son: "Son",
  daughter: "Daughter",
  parent: "Parent",
  child: "Child",
};

const roleColors = {
  father: "bg-blue-100 text-blue-800",
  mother: "bg-pink-100 text-pink-800",
  son: "bg-green-100 text-green-800",
  daughter: "bg-purple-100 text-purple-800",
  parent: "bg-gray-100 text-gray-800",
  child: "bg-yellow-100 text-yellow-800",
};

export default function FamilyMemberCard({
  profile,
  isOwnProfile = false,
  onEdit,
}: FamilyMemberCardProps) {
  const displayName = profile.name || profile.email.split("@")[0];
  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const role = profile.role || "parent";

  return (
    <div
      className={`group relative flex flex-col items-center rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-xl ${
        isOwnProfile ? "ring-2 ring-indigo-500" : ""
      }`}
    >
      {/* Photo */}
      <div className="relative mb-3 h-24 w-24 overflow-hidden rounded-full bg-gray-200">
        {profile.photo_url ? (
          <Image
            src={profile.photo_url}
            alt={displayName}
            fill
            className="object-cover"
            unoptimized={profile.photo_url.startsWith('data:')}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 text-3xl font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="mb-1 text-lg font-semibold text-gray-900">{displayName}</h3>

      {/* Role Badge */}
      <span
        className={`mb-2 rounded-full px-3 py-1 text-xs font-medium ${roleColors[role]}`}
      >
        {roleLabels[role]}
      </span>

      {/* Age */}
      {age !== null && (
        <p className="text-sm text-gray-600">Age {age}</p>
      )}

      {/* Edit Button (for own profile) */}
      {isOwnProfile && onEdit && (
        <button
          onClick={onEdit}
          className="mt-2 rounded-lg bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-200"
        >
          Edit Profile
        </button>
      )}
    </div>
  );
}

