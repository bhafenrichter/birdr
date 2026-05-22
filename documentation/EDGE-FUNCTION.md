# Edge Function Integration - Generate Listing

## Overview

After photos are uploaded to Supabase storage, the app automatically calls a Supabase Edge Function to generate listing metadata using AI.

## Flow

```
1. User uploads photos → "uploading" state
2. Photos saved to Supabase storage → "uploaded" state
3. Automatically call edge function → "processing" state
4. Edge function completes → "complete" state
5. User can view generated listing
```

## Edge Function Details

**Endpoint**: `https://sknrjppafcgsktlryzcd.supabase.co/functions/v1/generate-listing`

**Method**: `POST`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {access_token}"
}
```

**Request Body**:
```json
{
  "user_id": "uuid-from-supabase-auth",
  "listing_id": "listing-{draft-uuid}"
}
```

**Response**:
```json
{
  "success": true,
  "listing_id": "listing-{draft-uuid}",
  "message": "Listing generated successfully"
}
```

## Implementation

### Upload Context (`src/contexts/upload.tsx`)

Added `generateListing()` function that:

1. **Validates authentication**: Checks user is logged in
2. **Validates data**: Ensures listingDraftId exists
3. **Gets auth token**: Retrieves current session access token
4. **Formats listing_id**: Prepends "listing-" to the draft UUID
5. **Calls edge function**: POST request with user_id and listing_id
6. **Handles response**: Transitions to "complete" on success, "error" on failure

### Automatic Invocation

The edge function is called **automatically** after photo upload completes:

```typescript
// In uploadPhotos() function
setState("uploaded");
await generateListing(); // Automatically called
```

### State Management

**New States**:
- `processing`: Edge function is running
- `complete`: Listing has been generated successfully

**State Flow**:
- ✅ `idle` → `selecting` → `uploading` → `uploaded` → `processing` → `complete`
- ❌ Any step can transition to `error` on failure

### Home Screen Updates

The UI now responds to all states:

**Before Upload**:
- Camera icon
- "Create New Listing" heading
- Upload button

**During Upload**:
- Camera icon
- Loading spinner on button
- Button disabled

**After Upload (Processing)**:
- Camera icon
- "Processing Photos..." heading
- "We're analyzing your photos..." description
- No upload button (processing in progress)

**Complete**:
- Success animation (Lottie)
- "Listing Ready!" heading
- "View Listing" button
- Can upload more photos

**Error**:
- Red error text below content
- User can retry upload

## Error Handling

Errors are handled at multiple levels:

1. **Authentication errors**: "Unable to get authentication session"
2. **Validation errors**: "No listing ID found"
3. **Network errors**: Caught and displayed to user
4. **Edge function errors**: Error message from function response
5. **HTTP errors**: "Edge function failed: {response}"

All errors set state to "error" and display message in red text.

## Testing

To test the integration:

1. Upload photos through the app
2. Watch console for "Listing generated successfully" log
3. Verify state transitions: uploading → uploaded → processing → complete
4. Check Supabase logs for edge function invocation
5. Verify listing_id format: `listing-{uuid}`

## Future Enhancements

Potential improvements:

1. **Polling for completion**: If edge function is async, poll for status
2. **Retry logic**: Automatic retry on transient failures
3. **Progress updates**: Real-time progress from edge function
4. **Notification**: Push notification when listing is ready
5. **Partial failures**: Handle when some photos succeed but others fail

## File Locations

- Edge function integration: `/src/contexts/upload.tsx`
- UI updates: `/src/screens/home/home.tsx`
- Types: `GenerateListingResponse` interface

## Environment Variables

The edge function URL is hardcoded in `upload.tsx`. To make it configurable:

```typescript
// .env.local
EXPO_PUBLIC_EDGE_FUNCTION_URL=https://sknrjppafcgsktlryzcd.supabase.co/functions/v1/generate-listing

// In upload.tsx
const EDGE_FUNCTION_URL = process.env.EXPO_PUBLIC_EDGE_FUNCTION_URL;
```
