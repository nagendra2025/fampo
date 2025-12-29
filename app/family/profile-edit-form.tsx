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
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(profile.name || "");
    setRole(profile.role || "parent");
    setDateOfBirth(profile.date_of_birth || "");
    setBio(profile.bio || "");
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

    onSubmit({
      name: name.trim() || null,
      role,
      date_of_birth: dateOfBirth || null,
      bio: bio.trim() || null,
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

