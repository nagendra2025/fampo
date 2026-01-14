"use client";

import { useState } from "react";
import FamilyMemberCard from "@/components/family-member-card";
import ProfileEditForm from "./profile-edit-form";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: "father" | "mother" | "son" | "daughter" | "parent" | "child" | null;
  photo_url: string | null;
  date_of_birth: string | null;
  bio: string | null;
  phone_number: string | null;
  notifications_enabled: boolean | null;
  whatsapp_enabled: boolean | null;
  sms_enabled: boolean | null;
}

interface FamilyPageClientProps {
  profiles: Profile[];
  currentProfile: Profile | null;
}

export default function FamilyPageClient({
  profiles,
  currentProfile,
}: FamilyPageClientProps) {
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [localProfiles, setLocalProfiles] = useState(profiles);

  const refreshProfiles = async () => {
    const response = await fetch("/api/profiles");
    if (response.ok) {
      const data = await response.json();
      setLocalProfiles(data.profiles);
    }
  };

  const handleUpdateProfile = async (
    id: string,
    profileData: Partial<Profile>
  ) => {
    const response = await fetch(`/api/profiles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });

    if (response.ok) {
      await refreshProfiles();
      setEditingProfile(null);
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };

  const handleEditClick = (profile: Profile) => {
    setEditingProfile(profile);
  };

  const handleFormClose = () => {
    setEditingProfile(null);
  };

  return (
    <div className="space-y-8">
      {/* Family Members Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {localProfiles.map((profile) => (
          <FamilyMemberCard
            key={profile.id}
            profile={profile}
            isOwnProfile={profile.id === currentProfile?.id}
            onEdit={() => handleEditClick(profile)}
          />
        ))}
      </div>

      {/* Profile Edit Form Modal */}
      {editingProfile && (
        <ProfileEditForm
          profile={editingProfile}
          onSubmit={(data) => handleUpdateProfile(editingProfile.id, data)}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

