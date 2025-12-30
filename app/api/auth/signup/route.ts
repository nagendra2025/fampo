import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { calculateAge } from "@/lib/utils/age";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const formData = await request.formData();
    
    // Extract form fields
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirmation = formData.get("passwordConfirmation") as string;
    const gender = formData.get("gender") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const nickName = formData.get("nickName") as string;
    const punchLine = formData.get("punchLine") as string | null;
    const file = formData.get("file") as File;

    // Validation (photo is now optional)
    if (!email || !password || !passwordConfirmation || !gender || !dateOfBirth || !nickName) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== passwordConfirmation) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate gender
    if (gender !== "male" && gender !== "female") {
      return NextResponse.json(
        { error: "Invalid gender selection" },
        { status: 400 }
      );
    }

    // Validate file (only if provided - photo is optional)
    if (file) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Profile picture must be an image file" },
          { status: 400 }
        );
      }

      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "Profile picture must be less than 2MB" },
          { status: 400 }
        );
      }
    }

    // Validate date of birth (must be in the past)
    const dob = new Date(dateOfBirth);
    const today = new Date();
    if (dob >= today) {
      return NextResponse.json(
        { error: "Date of birth must be in the past" },
        { status: 400 }
      );
    }

    // Calculate age
    const age = calculateAge(dateOfBirth);

    // Determine role based on age and gender
    let role: string;
    if (age < 26) {
      role = gender === "male" ? "son" : "daughter";
    } else {
      role = gender === "male" ? "father" : "mother";
    }

    // Generate temporary user ID for file upload (we'll use a temp UUID)
    // Actually, we need to create the user first, then upload the photo
    // But we can't upload to storage without auth. Let's create user first with a placeholder,
    // then update with photo. Actually, better approach: create user, get ID, upload photo, update profile.

    // Get the site URL - prioritize environment variable for production
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    request.headers.get('origin') || 
                    'http://localhost:3000';
    const emailRedirectTo = `${siteUrl}/auth/confirm`;

    // Create user account first (without photo)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          role,
          gender,
          date_of_birth: dateOfBirth,
          nick_name: nickName,
          punch_line: punchLine || null,
          // photo_url will be added after upload if provided
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    const userId = authData.user.id;
    let publicUrl: string | null = null;

    // Upload profile picture if provided
    // Use admin client since user is not authenticated yet (needs email confirmation)
    if (file) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `profiles/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer();
        
        // Use admin client to bypass RLS (user is not authenticated yet)
        const adminClient = createAdminClient();
        const { data: uploadData, error: uploadError } = await adminClient.storage
          .from("memories")
          .upload(fileName, arrayBuffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (!uploadError && uploadData) {
          // Get public URL
          const {
            data: { publicUrl: url },
          } = adminClient.storage.from("memories").getPublicUrl(fileName);
          publicUrl = url;
          console.log("Photo uploaded successfully:", publicUrl);
        } else {
          console.error("Photo upload failed:", uploadError?.message);
          // Don't fail signup if photo upload fails
        }
      } catch (uploadErr: any) {
        // Upload failed - not critical, user can add photo later
        console.error("Photo upload error:", uploadErr.message);
      }
    }

    // Update user metadata and profile with photo URL if upload was successful
    if (publicUrl) {
      console.log(`[SIGNUP] Starting photo URL update for user ${userId}`);
      console.log(`[SIGNUP] Photo URL: ${publicUrl}`);
      
      // Update user metadata with photo URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          photo_url: publicUrl,
        },
      });

      if (updateError) {
        console.error("[SIGNUP] Failed to update user metadata:", updateError);
      } else {
        console.log("[SIGNUP] User metadata updated successfully");
      }

      // Wait for profile trigger to run, then update profile
      // Use admin client to bypass RLS since user is not authenticated yet
      // Retry logic to ensure profile exists before updating
      let retries = 10; // Increased retries
      let profileUpdated = false;
      const adminClient = createAdminClient();
      
      console.log("[SIGNUP] Waiting for profile to be created by trigger...");
      
      while (retries > 0 && !profileUpdated) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms (faster checks)
        
        // First, check if profile exists
        const { data: existingProfile, error: checkError } = await adminClient
          .from("profiles")
          .select("id, photo_url")
          .eq("id", userId)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
          console.warn(`[SIGNUP] Profile check error (attempt ${11 - retries}/10):`, checkError?.message);
        }

        if (existingProfile) {
          console.log(`[SIGNUP] Profile found, current photo_url: ${existingProfile.photo_url || 'NULL'}`);
          
          // Try using the database function first (more reliable)
          try {
            const { data: functionResult, error: functionError } = await adminClient.rpc(
              'update_profile_photo_url',
              {
                user_id: userId,
                photo_url_value: publicUrl
              }
            );

            if (!functionError && functionResult === true) {
              profileUpdated = true;
              console.log(`[SIGNUP] ✅ Profile photo updated via function!`);
            } else {
              // Fallback to direct update if function fails
              console.warn(`[SIGNUP] Function update failed, trying direct update:`, functionError?.message);
              
              const { data: updatedProfile, error: profileError } = await adminClient
                .from("profiles")
                .update({
                  photo_url: publicUrl,
                })
                .eq("id", userId)
                .select()
                .single();

              if (!profileError && updatedProfile) {
                profileUpdated = true;
                console.log(`[SIGNUP] ✅ Profile photo updated via direct update! New photo_url: ${updatedProfile.photo_url}`);
              } else {
                console.warn(`[SIGNUP] Direct update also failed:`, profileError?.message);
                retries--;
              }
            }
          } catch (rpcError: any) {
            // Function might not exist yet, use direct update
            console.warn(`[SIGNUP] RPC function error (may not exist), using direct update:`, rpcError?.message);
            
            const { data: updatedProfile, error: profileError } = await adminClient
              .from("profiles")
              .update({
                photo_url: publicUrl,
              })
              .eq("id", userId)
              .select()
              .single();

            if (!profileError && updatedProfile) {
              profileUpdated = true;
              console.log(`[SIGNUP] ✅ Profile photo updated via direct update! New photo_url: ${updatedProfile.photo_url}`);
            } else {
              console.warn(`[SIGNUP] Profile update attempt ${11 - retries}/10 failed:`, profileError?.message);
              retries--;
            }
          }
          
          // Verify the update if successful
          if (profileUpdated) {
            const { data: verifyProfile } = await adminClient
              .from("profiles")
              .select("photo_url")
              .eq("id", userId)
              .single();
            
            if (verifyProfile?.photo_url === publicUrl) {
              console.log("[SIGNUP] ✅ Verification: Photo URL correctly saved in database");
            } else {
              console.error(`[SIGNUP] ❌ Verification failed! Expected: ${publicUrl}, Got: ${verifyProfile?.photo_url}`);
            }
          }
        } else {
          // Profile doesn't exist yet, wait and retry
          console.log(`[SIGNUP] Profile not found yet (attempt ${11 - retries}/10), waiting...`);
          retries--;
        }
      }

      if (!profileUpdated) {
        console.error("[SIGNUP] ❌ CRITICAL: Failed to update profile photo after all retries!");
        console.error("[SIGNUP] User ID:", userId);
        console.error("[SIGNUP] Photo URL:", publicUrl);
        // Don't fail signup, but log the error
      }
    } else {
      console.log("[SIGNUP] No photo URL to save (photo upload skipped or failed)");
    }

    // Final verification: Check if photo was saved (for debugging)
    let finalPhotoUrl: string | null = null;
    if (publicUrl) {
      try {
        const adminClient = createAdminClient();
        const { data: finalProfile } = await adminClient
          .from("profiles")
          .select("photo_url")
          .eq("id", userId)
          .single();
        finalPhotoUrl = finalProfile?.photo_url || null;
        
        if (finalPhotoUrl === publicUrl) {
          console.log("[SIGNUP] ✅ Final verification: Photo URL is correctly saved");
        } else {
          console.error(`[SIGNUP] ❌ Final verification failed! Expected: ${publicUrl}, Got: ${finalPhotoUrl}`);
        }
      } catch (err) {
        console.error("[SIGNUP] Error during final verification:", err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please check your email to confirm your account.",
        user: {
          id: userId,
          email: authData.user.email,
        },
        photoSaved: finalPhotoUrl === publicUrl, // For debugging
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    
    // Ensure we always return valid JSON
    const errorMessage = error?.message || "An error occurred during signup";
    
    return NextResponse.json(
      { error: errorMessage },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

