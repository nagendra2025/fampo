"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { formatDateOfBirth } from "@/lib/utils/age";

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
  sms_enabled: boolean | null;
}

interface ProfileEditFormProps {
  profile: Profile;
  onSubmit: (data: Partial<Profile>) => void;
  onClose: () => void;
}

export default function ProfileEditForm({
  profile,
  onSubmit,
  onClose,
}: ProfileEditFormProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"father" | "mother" | "son" | "daughter" | "parent" | "child">("parent");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(profile.name || "");
    setRole(profile.role || "parent");
    setDateOfBirth(profile.date_of_birth || "");
    setBio(profile.bio || "");
    setPhoneNumber(profile.phone_number || "");
    setNotificationsEnabled(profile.notifications_enabled ?? true);
    setSmsEnabled(profile.sms_enabled ?? true);
    setPhotoUrl(profile.photo_url || "");
    setPreview(profile.photo_url);
  }, [profile]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/profiles/${profile.id}/photo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      setPhotoUrl(data.url);
    } catch (error: any) {
      alert(`Upload error: ${error.message}`);
      setPreview(profile.photo_url);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number format (E.164: +1234567890)
    let validatedPhoneNumber = phoneNumber.trim() || null;
    if (validatedPhoneNumber && !validatedPhoneNumber.startsWith("+")) {
      alert("Phone number must start with + and country code (e.g., +1234567890)");
      return;
    }

    onSubmit({
      name: name.trim() || null,
      role,
      date_of_birth: dateOfBirth || null,
      bio: bio.trim() || null,
      phone_number: validatedPhoneNumber,
      notifications_enabled: notificationsEnabled,
      sms_enabled: smsEnabled,
      photo_url: photoUrl || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            
            {preview ? (
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-100">
                  <Image
                    src={preview}
                    alt="Profile"
                    fill
                    className="object-cover"
                    unoptimized={preview.startsWith('data:')}
                  />
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="photo-upload"
                    className={`inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white cursor-pointer transition-colors hover:bg-indigo-700 ${
                      uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {uploading ? "Uploading..." : "Change Photo"}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Max 2MB, JPG/PNG/GIF</p>
                </div>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white cursor-pointer transition-colors hover:bg-indigo-700"
                >
                  {uploading ? "Uploading..." : "Upload Photo"}
                </label>
                <p className="text-xs text-gray-500 mt-1">Max 2MB, JPG/PNG/GIF</p>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your name"
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "father" | "mother" | "son" | "daughter" | "parent" | "child")
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="father">Father</option>
              <option value="mother">Mother</option>
              <option value="son">Son</option>
              <option value="daughter">Daughter</option>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth (optional)
            </label>
            <input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Used to calculate and display your age
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio (optional)
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="A short description about yourself..."
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number (optional)
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+1234567890"
            />
            <p className="mt-1 text-xs text-gray-500">
              Format: + followed by country code and number (e.g., +1234567890)
            </p>
          </div>

          {/* Notification Settings */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Notification Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable Notifications</span>
              </label>

              {notificationsEnabled && (
                <label className="flex items-center gap-3 pl-8">
                  <input
                    type="checkbox"
                    checked={smsEnabled}
                    onChange={(e) => setSmsEnabled(e.target.checked)}
                    disabled={!notificationsEnabled}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">SMS Notifications</span>
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-lg font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-lg font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

