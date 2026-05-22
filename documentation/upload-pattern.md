# Photo Upload Feature - Implementation Summary

## What Was Built

Created a complete photo upload system for the List My Closet app with the following features:

### 1. Upload Context (`src/contexts/upload.tsx`)

A reusable context that manages the entire photo upload lifecycle:

**State Machine** (extensible for future steps):
- `idle` - No upload in progress
- `selecting` - User is selecting photos
- `uploading` - Photos are being uploaded
- `uploaded` - Upload complete
- `processing` - (Ready for future AI processing)
- `analyzing` - (Ready for future brand recognition)
- `complete` - (Ready for final completion state)
- `error` - Upload failed

**Features**:
- ✅ Multi-photo selection support
- ✅ File size validation (10MB limit per photo)
- ✅ Progress tracking (current file / total files / percentage)
- ✅ Listing draft ID generation (UUID v4)
- ✅ Supabase storage integration
- ✅ **Enhanced permission handling for iOS/Android**
- ✅ **Checks existing permissions before requesting**
- ✅ **Better error messages for denied permissions**
- ✅ Error state management
- ✅ Automatic compression (0.8 quality)
- ✅ EXIF data removal for privacy

**Storage Structure**:
- Bucket: `listing_photos`
- Path: `{userId}/{listingDraftId}/{filename}`
- Returns both file paths and public URLs

### 2. Permissions Configuration

**iOS (`app.json`):**
```json
"infoPlist": {
  "NSPhotoLibraryUsageDescription": "We need access to your photo library to upload photos of your clothing items for listing creation.",
  "NSPhotoLibraryAddUsageDescription": "We need access to save photos to your library."
}
```

**Android (`app.json`):**
```json
"permissions": [
  "READ_MEDIA_IMAGES",
  "READ_EXTERNAL_STORAGE"
]
```

### 3. Permission Handling

The upload context now:
1. **Checks current permission status** before requesting
2. **Differentiates between denied and not determined** states
3. **Provides helpful error messages** directing users to settings if needed
4. **Handles permission errors gracefully** with try/catch

Permission states handled:
- `granted` - Proceed with upload
- `denied` - Show message to enable in settings
- Other - Request permission with explanation

### 4. Home Screen Updates (`src/screens/home/home.tsx`)

Updated to integrate upload functionality:
- Upload button triggers photo picker
- Loading indicator during upload
- Progress display (X of Y files, percentage)
- Error messages shown in red text below button
- Success state showing photo count
- "Upload More Photos" option after initial upload

### 5. Dependencies Installed

```bash
expo-image-picker@~17.0.10  # Photo selection
uuid@^9.0.1                  # UUID generation
@types/uuid                  # TypeScript types
```

### 6. Configuration Required

You need to configure the Supabase storage bucket:

1. Create a bucket named `listing_photos` in your Supabase project
2. Set appropriate permissions (authenticated users can upload)
3. Configure CORS if needed for web
4. The context uses existing `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `.env.local`

**Important**: After updating `app.json`, you must rebuild your app:
```bash
# For iOS
npx expo prebuild --clean
npx expo run:ios

# For Android
npx expo prebuild --clean
npx expo run:android
```

### 7. Usage Example

```typescript
import { useUpload } from '../../contexts/upload';

function MyComponent() {
  const { 
    uploadPhotos,      // Function to trigger upload
    state,             // Current state
    progress,          // Upload progress
    error,             // Error message
    uploadedPhotos,    // Array of uploaded photos
    listingDraftId,    // Generated listing ID
    resetUpload,       // Reset to idle
    setState           // Manually change state
  } = useUpload();

  return (
    <Button onPress={uploadPhotos} isLoading={state === 'uploading'} />
  );
}
```

### 8. Return Data Structure

```typescript
interface UploadedPhoto {
  uri: string;          // Original local URI
  fileName: string;     // File name
  filePath: string;     // Supabase storage path
  publicUrl: string;    // Public URL for the file
  fileSize: number;     // File size in bytes
}
```

## Next Steps

The upload context is ready to be extended with additional states:

1. **Processing State**: After upload, transition to `processing`
2. **AI Analysis**: Use `analyzing` state for brand recognition
3. **Description Generation**: Add state for generating descriptions
4. **Price Suggestion**: Add state for price calculation

The `listingDraftId` is retained across states and can be used when creating the final listing in your backend.

## File Locations

- Context: `/src/contexts/upload.tsx`
- Home Screen: `/src/screens/home/home.tsx`
- Context Export: `/src/contexts/index.tsx`
- App Provider: `/App.tsx`
- Permissions Config: `/app.json`

