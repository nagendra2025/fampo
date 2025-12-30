"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Memory {
  id: string;
  photo_url: string;
  note: string | null;
}

interface MemoryFormProps {
  memory?: Memory | null;
  onSubmit: (data: { photo_url: string; note: string | null }) => Promise<void> | void;
  onClose: () => void;
}

export default function MemoryForm({
  memory,
  onSubmit,
  onClose,
}: MemoryFormProps) {
  const [note, setNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (memory) {
      setNote(memory.note || "");
      setPhotoUrl(memory.photo_url);
      setPreview(memory.photo_url);
      setImageError(false);
    } else {
      setNote("");
      setPhotoUrl("");
      setPreview(null);
      setImageError(false);
    }
  }, [memory]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/memories/upload", {
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
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!memory && !photoUrl) {
      alert("Please upload a photo");
      return;
    }

    setUploading(true);
    try {
      await onSubmit({
        photo_url: photoUrl,
        note: note.trim() || null,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          {memory ? "Edit Memory" : "Add New Memory"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload/Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo {!memory && "*"}
            </label>
            
            {preview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                {imageError ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Failed to load image</p>
                  </div>
                ) : (
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized={preview.startsWith('data:')}
                    onError={() => {
                      setImageError(true);
                      console.error('Failed to load image:', preview);
                    }}
                  />
                )}
                {!memory && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setPhotoUrl("");
                      setImageError(false);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="absolute top-2 right-2 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white shadow-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition-colors">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">Click to upload photo</p>
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
                    {uploading ? "Uploading..." : "Choose Photo"}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Max 5MB, JPG/PNG/GIF
                  </p>
                </div>
              </div>
            )}

            {!memory && !preview && (
              <label
                htmlFor="photo-upload"
                className="mt-2 block text-center text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Or click here to select a file
              </label>
            )}
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700">
              Note (optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add a note about this memory..."
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
              disabled={uploading || (!memory && !photoUrl)}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-lg font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading
                ? memory
                  ? "Updating..."
                  : "Creating..."
                : memory
                  ? "Update Memory"
                  : "Create Memory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

