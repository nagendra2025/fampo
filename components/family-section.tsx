"use client";

import Link from "next/link";
import FamilyMemberCard from "./family-member-card";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: "father" | "mother" | "son" | "daughter" | "parent" | "child" | null;
  photo_url: string | null;
  date_of_birth: string | null;
  bio: string | null;
}

interface FamilySectionProps {
  profiles: Profile[];
  currentUserId: string;
}

export default function FamilySection({
  profiles,
  currentUserId,
}: FamilySectionProps) {
  const router = useRouter();

  if (profiles.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">
          👨‍👩‍👧‍👦 Meet the Family
        </h2>
        <p className="text-gray-600">
          Your family members on Rasna
        </p>
      </div>

      {/* Family Members Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {profiles.map((profile) => (
          <FamilyMemberCard
            key={profile.id}
            profile={profile}
            isOwnProfile={profile.id === currentUserId}
            onEdit={() => router.push("/family")}
          />
        ))}
      </div>

      {/* View Full Family Link */}
      <div className="text-center">
        <Link
          href="/family"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          View Full Family →
        </Link>
      </div>
    </section>
  );
}

