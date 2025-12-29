import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Users can only update their own profile
  if (user.id !== id) {
    return NextResponse.json(
      { error: "You can only update your own profile" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { name, role, photo_url, date_of_birth, bio } = body;

  const updateData: any = {};

  if (name !== undefined) updateData.name = name;
  if (role !== undefined) updateData.role = role;
  if (photo_url !== undefined) updateData.photo_url = photo_url;
  if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth || null;
  if (bio !== undefined) updateData.bio = bio || null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

