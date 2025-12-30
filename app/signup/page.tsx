"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AnimatedRasna from "@/components/animated-rasna";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nickName, setNickName] = useState("");
  const [punchLine, setPunchLine] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, or GIF)");
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setError("Image must be less than 2MB");
      return;
    }

    setProfilePicture(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("Signup button clicked");
    setError(null);
    setLoading(true);

    // Validation
    console.log("Validating form data...");
    console.log("Email:", email);
    console.log("Gender:", gender);
    console.log("Date of Birth:", dateOfBirth);
    console.log("Nick Name:", nickName);
    console.log("Profile Picture:", profilePicture ? "Uploaded" : "Missing");
    
    if (password !== passwordConfirmation) {
      console.log("Validation failed: Passwords do not match");
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    if (!email || !password || !gender || !dateOfBirth || !nickName) {
      console.log("Validation failed: Missing required fields");
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }
    
    console.log("Validation passed, proceeding with signup");

    try {
      console.log("Starting signup process...");
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("passwordConfirmation", passwordConfirmation);
      formData.append("gender", gender);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("nickName", nickName);
      if (punchLine) {
        formData.append("punchLine", punchLine);
      }
      // Only append file if provided (photo is optional)
      if (profilePicture) {
        formData.append("file", profilePicture);
      }

      console.log("Sending signup request to /api/auth/signup");
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });
      
      console.log("Response received:", response.status, response.statusText);

      // Check if response is OK
      if (!response.ok) {
        // Try to parse error as JSON
        let errorMessage = "Signup failed";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const text = await response.text();
            errorMessage = text.substring(0, 200) || errorMessage;
          }
        } catch (parseErr) {
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned invalid response format");
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      // Success - show message
      console.log("Signup successful, setting success state");
      setSuccess(true);
    } catch (err: any) {
      // Handle all errors
      if (err instanceof SyntaxError) {
        setError("Server returned invalid response. Please try again.");
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(err.message || "An error occurred during signup");
      }
    } finally {
      setLoading(false);
    }
  };

  // Get max date (today) for date picker
  const maxDate = new Date().toISOString().split("T")[0];

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg text-center">
          <div className="text-6xl mb-4">✉️</div>
          <h1 className="text-3xl font-bold text-gray-900">Check Your Email</h1>
          <p className="mt-4 text-lg text-gray-600">
            We've sent a confirmation email to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Please click the link in the email to confirm your account and complete signup.
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 rounded-lg bg-indigo-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Join <AnimatedRasna className="inline-block !text-3xl" />
            </h1>
            <p className="mt-2 text-gray-600">Create your family account</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="flex items-center gap-4">
                {preview ? (
                  <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-100 border-2 border-indigo-500">
                    <Image
                      src={preview}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">📷</span>
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="profile-picture"
                  />
                  <label
                    htmlFor="profile-picture"
                    className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white cursor-pointer transition-colors hover:bg-indigo-700"
                  >
                    {preview ? "Change Photo" : "Upload Photo"}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Max 2MB, JPG/PNG/GIF</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            {/* Password Confirmation */}
            <div>
              <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="passwordConfirmation"
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                required
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                id="dateOfBirth"
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={maxDate}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">Used to calculate your age and assign your role</p>
            </div>

            {/* Nick Name */}
            <div>
              <label htmlFor="nickName" className="block text-sm font-medium text-gray-700">
                Nick Name <span className="text-red-500">*</span>
              </label>
              <input
                id="nickName"
                type="text"
                required
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Raji"
              />
              <p className="mt-1 text-xs text-gray-500">This will be used for your greeting (e.g., "Hello Raji")</p>
            </div>

            {/* Punch Line */}
            <div>
              <label htmlFor="punchLine" className="block text-sm font-medium text-gray-700">
                Punch Line (Optional)
              </label>
              <input
                id="punchLine"
                type="text"
                value={punchLine}
                onChange={(e) => setPunchLine(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="A short tagline about yourself..."
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-lg font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
