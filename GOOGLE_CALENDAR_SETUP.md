# Google Calendar Integration Setup Guide

This guide provides step-by-step instructions for setting up Google Calendar integration with Thunder CRM.

## Overview

Thunder CRM now supports bi-directional sync with Google Calendar, allowing you to:
- Sync tasks from Thunder CRM to Google Calendar
- Import Google Calendar events as tasks
- Automatic sync when creating, updating, or deleting tasks
- Manual sync controls in the calendar interface

## Prerequisites

1. **Google Cloud Console Account**: You need a Google Cloud account
2. **Supabase Project**: Your Supabase project must be set up
3. **Environment Variables**: All required environment variables must be configured

## Step 1: Google Cloud Console Setup

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 1.2 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Configure the OAuth consent screen if prompted
4. Set the application type to "Web application"
5. Add authorized redirect URIs:
   - `https://[your-supabase-project].supabase.co/auth/v1/callback`
   - `http://localhost:54321/auth/v1/callback` (for local development)
6. Note the Client ID and Client Secret

## Step 2: Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase Edge Functions (for deployment)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 3: Supabase Edge Functions Deployment

### 3.1 Install Supabase CLI (Optional)
If you don't have Supabase CLI installed:

**Option A: Using npm (global)**
```bash
npm install -g supabase
```

**Option B: Using npx (no installation)**
```bash
npx supabase functions deploy google-calendar-auth
```

**Option C: Using Homebrew (macOS)**
```bash
brew install supabase/tap/supabase
```

### 3.2 Deploy Edge Functions

**Method 1: Using Supabase CLI (preferred)**
```bash
# Login to Supabase
supabase login

# Deploy functions
supabase functions deploy google-calendar-auth
supabase functions deploy google-calendar-sync
```

**Method 2: Using Supabase Dashboard (manual)**
1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** → **Deploy Function**
3. Upload the function files:
   - `supabase/functions/google-calendar-auth/index.ts`
   - `supabase/functions/google-calendar-sync/index.ts`
4. Set environment variables (see below)

### 3.3 Set Environment Variables for Functions

**Using CLI:**
```bash
supabase secrets set GOOGLE_CLIENT_ID=your_google_client_id
supabase secrets set GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Using Dashboard:**
1. Go to **Edge Functions** → **Settings** → **Secrets**
2. Add these secrets:
   - `GOOGLE_CLIENT_ID`: your_google_client_id
   - `GOOGLE_CLIENT_SECRET`: your_google_client_secret

## Step 4: Database Setup

### 4.1 Update Database Schema

**Method 1: Using Supabase SQL Editor (recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** → **New Query**
3. Copy and paste the contents of `database/google_calendar_schema.sql`
4. Click **Run** to execute the schema updates

**Method 2: Manual SQL Commands**
Run these commands one by one in the SQL Editor:

```sql
-- Add Google Calendar integration fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

-- Create Google Calendar settings table
CREATE TABLE IF NOT EXISTS google_calendar_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    calendar_id TEXT DEFAULT 'primary',
    last_sync TIMESTAMP WITH TIME ZONE,
    is_connected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### 4.2 Verify Schema Updates

After running the SQL, verify the changes:
1. Check that `tasks` table has `google_calendar_event_id` column
2. Check that `google_calendar_settings` table exists
3. Verify RLS policies are active for the new table

## Step 5: Complete Setup Checklist

### ✅ **Before Starting**
- [ ] Google Cloud Console project created
- [ ] OAuth 2.0 credentials generated
- [ ] Redirect URIs configured
- [ ] Google Calendar API enabled
- [ ] Environment variables set in `.env.local`

### ✅ **Database Setup**
- [ ] Database schema updated with SQL commands
- [ ] RLS policies verified
- [ ] Tables created successfully

### ✅ **Edge Functions**
- [ ] Functions deployed via CLI or dashboard
- [ ] Environment variables set in Supabase
- [ ] Function URLs noted for frontend use

### ✅ **Frontend Configuration**
- [ ] Environment variables in `.env.local` updated
- [ ] Google Calendar settings component integrated
- [ ] Calendar integration removed from calendar page

## Step 6: Testing the Integration

### 6.1 Test Connection
1. Navigate to `/dashboard/settings`
2. Find **Google Calendar Integration** section
3. Click **Connect Google Calendar**
4. Complete OAuth flow
5. Verify connection status shows "Connected"

### 6.2 Test Sync
1. Create a new task in Thunder CRM
2. Check that it appears in Google Calendar
3. Create an event in Google Calendar
4. Click **Sync Now** in settings
5. Verify the event appears as a task in Thunder CRM

### 6.3 Test Disconnection
1. Click **Disconnect** in Google Calendar settings
2. Verify connection status shows "Not Connected"
3. Confirm tokens are removed from database

## Troubleshooting

### Common Issues

**"Access token not provided" error**
- Ensure `SUPABASE_ACCESS_TOKEN` is set or use `supabase login`

**"Function not found" error**
- Verify functions are deployed in Supabase dashboard
- Check function names match exactly

**OAuth redirect issues**
- Ensure redirect URI in Google Cloud Console matches exactly
- Check for trailing slashes in URLs

**Database permission errors**
- Verify RLS policies are enabled
- Check user authentication is working

### Getting Help
- Check Supabase logs in dashboard
- Review Google Cloud Console OAuth logs
- Test API endpoints directly using curl/Postman

```sql
-- Add Google Calendar event ID column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_google_calendar_event_id 
ON tasks(google_calendar_event_id);
```

### 4.2 Enable Row Level Security (RLS)

Ensure RLS is properly configured for the tasks table:

```sql
-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = assigned_user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = assigned_user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = assigned_user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = assigned_user_id);
```

## Step 5: Testing the Integration

### 5.1 Local Development

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the calendar page (`/dashboard/calendar`)

3. Click "Connect Google Calendar" in the sidebar

4. Follow the OAuth flow to authorize your Google account

### 5.2 Testing Sync Functionality

1. **Create a task** with a due date - it should appear in your Google Calendar
2. **Update a task** - changes should sync to Google Calendar
3. **Delete a task** - it should be removed from Google Calendar
4. **Manual sync** - click "Sync Now" to import Google Calendar events

## Troubleshooting

### Common Issues

#### 1. OAuth Redirect Mismatch
- Ensure the redirect URI in Google Cloud Console matches exactly with your Supabase URL
- Check for trailing slashes in URLs

#### 2. Token Refresh Issues
- Ensure the Google Calendar API is enabled in your project
- Check that the OAuth consent screen is properly configured

#### 3. Edge Function Deployment Errors
- Verify all environment variables are set correctly
- Check that your Supabase CLI is updated to the latest version

#### 4. Sync Not Working
- Check browser console for errors
- Verify the user has authorized Google Calendar access
- Ensure tasks have due dates (required for calendar events)

### Debug Mode

Enable debug logging by adding this to your browser console:

```javascript
localStorage.setItem('debug-google-calendar', 'true');
```

## Security Considerations

- OAuth tokens are stored securely in Supabase
- All API calls use server-side processing
- User data is isolated per user account
- Row Level Security ensures users only access their own data

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all environment variables are correctly set
3. Ensure Google Calendar API is enabled
4. Review the Supabase Edge Functions logs in the Supabase dashboard
