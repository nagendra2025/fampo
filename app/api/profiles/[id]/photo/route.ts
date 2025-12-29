import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
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

  // Users can only upload their own profile photo
  if (user.id !== id) {
    return NextResponse.json(
      { error: "You can only upload your own profile photo" },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "File must be an image" },
      { status: 400 }
    );
  }

  // Validate file size (max 2MB for profile photos)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "File size must be less than 2MB" },
      { status: 400 }
    );
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `profiles/${id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Delete old photo if exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("photo_url")
    .eq("id", id)
    .single();

  if (existingProfile?.photo_url) {
    // Extract file path from URL
    const urlParts = existingProfile.photo_url.split("/");
    const filePath = urlParts.slice(urlParts.indexOf("profiles")).join("/");
    await supabase.storage.from("memories").remove([filePath]);
  }

  // Upload to Supabase Storage (using memories bucket)
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("memories")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: uploadError.message },
      { status: 500 }
    );
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("memories").getPublicUrl(fileName);

  // Update profile with new photo URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ photo_url: publicUrl })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url: publicUrl,
    path: uploadData.path,
  });
}

