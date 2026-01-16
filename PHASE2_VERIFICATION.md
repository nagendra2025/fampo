# Phase 2 Verification Guide

## ✅ Phase 2: Enhanced Signup Flow - COMPLETE

### What Was Done

1. **Created Signup API Route:** `app/api/auth/signup/route.ts`
   - Handles file upload for profile picture
   - Validates all form fields
   - Calculates age from date of birth
   - Determines role automatically (age < 26 = son/daughter, age >= 26 = father/mother)
   - Creates user account with metadata
   - Uploads profile picture to Supabase Storage
   - Updates profile with photo URL

2. **Updated Signup Form:** `app/signup/page.tsx`
   - Added all required fields:
     - Email
     - Password
     - Password Confirmation
     - Gender (Male/Female dropdown)
     - Date of Birth
     - Profile Picture (with preview)
     - Nick Name
     - Punch Line (optional)
   - Form validation
   - Success message after signup (email confirmation required)

3. **Created Email Confirmation:** `app/auth/confirm/route.ts` and `app/auth/confirm/page.tsx`
   - Handles email confirmation link
   - Shows success/error messages
   - Redirects to login after confirmation

### How to Verify

#### Step 1: Enable Email Confirmation in Supabase

**Important:** Before testing, you must enable email confirmation:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to **Authentication → Settings**

2. **Enable Email Confirmation**
   - Under **"Email Auth"** section
   - **Enable** "Enable email confirmations"
   - Save settings

3. **Configure Email Redirect URL (if needed)**
   - Add your site URL to allowed redirect URLs
   - For local testing: `http://localhost:3000/auth/confirm`
   - For production: `https://your-domain.com/auth/confirm`

#### Step 2: Test Signup Flow

1. **Navigate to Signup Page**
   - Go to: `http://localhost:3000/signup`
   - You should see the new enhanced signup form

2. **Fill Out the Form**
   - **Email:** Use a real email address (you'll receive confirmation email)
   - **Password:** At least 6 characters
   - **Confirm Password:** Must match password
   - **Gender:** Select Male or Female
   - **Date of Birth:** 
     - For testing role = "son": Use a date that makes age < 26 (e.g., 2005-01-01)
     - For testing role = "father": Use a date that makes age >= 26 (e.g., 1990-01-01)
   - **Profile Picture:** Upload an image (JPG, PNG, or GIF, max 2MB)
   - **Nick Name:** Enter a name (e.g., "Raji")
   - **Punch Line:** Optional, can leave blank

3. **Submit the Form**
   - Click "Create Account"
   - You should see: "Check Your Email" message
   - Form should not redirect (email confirmation required)

#### Step 3: Verify Email Confirmation

1. **Check Your Email**
   - Look for confirmation email from Supabase
   - Click the confirmation link

2. **Verify Confirmation Page**
   - Should redirect to `/auth/confirm?success=true`
   - Should show "Email Confirmed!" message
   - Click "Sign In Now" button

3. **Login After Confirmation**
   - Go to login page
   - Use the email and password you signed up with
   - Should successfully log in

#### Step 4: Verify Profile Data

1. **Check Supabase Database**
   - Go to **Table Editor → profiles**
   - Find the new user's profile
   - Verify these fields:
     - ✅ `email` - Should match signup email
     - ✅ `name` - Should be the nick_name you entered
     - ✅ `nick_name` - Should be the nick name you entered
     - ✅ `role` - Should be automatically assigned:
       - Age < 26 + Male = "son"
       - Age < 26 + Female = "daughter"
       - Age >= 26 + Male = "father"
       - Age >= 26 + Female = "mother"
     - ✅ `gender` - Should be "male" or "female"
     - ✅ `date_of_birth` - Should be the date you entered
     - ✅ `photo_url` - Should be a Supabase Storage URL
     - ✅ `bio` - Should be the punch line (if provided)

2. **Check Supabase Storage**
   - Go to **Storage → memories bucket**
   - Look for folder: `profiles/{user-id}/`
   - Should contain the uploaded profile picture

#### Step 5: Test Role Assignment Logic

**Test Case 1: Son (Age < 26, Male)**
- Date of Birth: 2005-01-01 (age = ~19)
- Gender: Male
- Expected Role: "son"
- Verify in database

**Test Case 2: Daughter (Age < 26, Female)**
- Date of Birth: 2008-06-15 (age = ~16)
- Gender: Female
- Expected Role: "daughter"
- Verify in database

**Test Case 3: Father (Age >= 26, Male)**
- Date of Birth: 1990-03-20 (age = ~34)
- Gender: Male
- Expected Role: "father"
- Verify in database

**Test Case 4: Mother (Age >= 26, Female)**
- Date of Birth: 1992-11-10 (age = ~32)
- Gender: Female
- Expected Role: "mother"
- Verify in database

### ✅ Verification Checklist

- [ ] Signup form displays all required fields
- [ ] Profile picture upload works with preview
- [ ] Form validation works (password match, required fields)
- [ ] Can submit form successfully
- [ ] "Check Your Email" message appears after signup
- [ ] Confirmation email received
- [ ] Email confirmation link works
- [ ] Profile created in database with all fields
- [ ] Role assigned correctly based on age and gender
- [ ] Profile picture uploaded to Supabase Storage
- [ ] Photo URL saved in profile
- [ ] Can login after email confirmation

### Common Issues & Solutions

**Issue: "Email confirmation not working"**
- ✅ Check email confirmation is enabled in Supabase Dashboard
- ✅ Check spam folder for confirmation email
- ✅ Verify redirect URL is in allowed URLs list

**Issue: "Photo upload fails"**
- ✅ Check `memories` bucket exists and is accessible
- ✅ Verify file is under 2MB
- ✅ Check file is a valid image format

**Issue: "Role not assigned correctly"**
- ✅ Verify date of birth is correct
- ✅ Check age calculation (should be < 26 or >= 26)
- ✅ Verify gender is "male" or "female"
- ✅ Check signup API logs for errors

**Issue: "Profile not created"**
- ✅ Check trigger `on_auth_user_created` exists
- ✅ Verify `handle_new_user()` function is updated (from Phase 1)
- ✅ Check database logs for errors

### Next Steps

Once Phase 2 is verified ✅, we'll proceed to:
- **Phase 3:** Login Verification (quick check)
- **Phase 4:** Home Page - Profile picture and greeting

---

**Status:** Ready for Verification  
**Next Phase:** Phase 3 - Login Verification



