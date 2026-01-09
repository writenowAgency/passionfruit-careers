# Improved Photo Upload & Display Architecture

## Problems with Current Approach

1. ❌ **Inconsistent rendering** - Different components use different methods (expo-image vs HTML img)
2. ❌ **No caching strategy** - Images reload every time
3. ❌ **No error handling** - Broken images show nothing
4. ❌ **Platform-specific code scattered** - Hard to maintain
5. ❌ **No loading states** - Users don't know when image is loading
6. ❌ **Employer photos not implemented** - Only works for job seekers
7. ❌ **No fallback system** - If R2 is down, everything breaks

## New Architecture Design

### Core Principles

1. ✅ **Single source of truth** - One reusable component for all images
2. ✅ **Graceful degradation** - Fallbacks for every failure scenario
3. ✅ **Progressive enhancement** - Loading states, error states, success states
4. ✅ **Universal compatibility** - Works on web, iOS, Android
5. ✅ **Performance optimized** - Proper caching, lazy loading
6. ✅ **User type agnostic** - Works for job seekers, employers, admins

### Component Hierarchy

```
ProfileImage (Reusable Component)
    ├── Loading State (Skeleton/Spinner)
    ├── Success State (Image Display)
    │   ├── Web: <img> with srcset
    │   └── Native: expo-image with cache
    ├── Error State (Fallback Avatar)
    └── Empty State (Initials Avatar)

PhotoUploadWidget (Reusable Component)
    ├── ProfileImage (Display)
    ├── Upload Button
    ├── Upload Progress
    ├── Delete Button
    └── Change Button
```

## Implementation Plan

### 1. Create Universal Image Component

**File:** `src/components/common/ProfileImage.tsx`

**Features:**
- Automatic fallback to initials
- Loading skeleton
- Error boundary
- Retry mechanism
- Platform-optimized rendering
- Cache control
- CORS handling

### 2. Create Universal Upload Widget

**File:** `src/components/common/PhotoUploadWidget.tsx`

**Features:**
- Works for any user type (job seeker, employer)
- Progress tracking
- Image preview before upload
- Compression/optimization
- Multiple file format support
- Drag & drop (web)
- Camera access (mobile)

### 3. Unified Backend Endpoint

**Current:** Separate endpoints for each user type
**New:** Generic `/api/users/{userId}/photo` endpoint

**Benefits:**
- Single code path
- Easier maintenance
- Consistent behavior
- Shared validation

### 4. Optimized Storage Strategy

**File naming:** `{userType}/{userId}/{timestamp}-{hash}.{ext}`
**Examples:**
- `job-seekers/1/1765360000-abc123.jpg`
- `employers/5/1765360100-def456.jpg`

**CDN Configuration:**
- Cache-Control headers
- CORS headers
- Image optimization
- Multiple sizes (thumbnail, medium, full)

## Technical Specifications

### Image Component Props

```typescript
interface ProfileImageProps {
  imageUrl?: string | null;
  userName: string;        // For fallback initials
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  shape?: 'circle' | 'square' | 'rounded';
  editable?: boolean;      // Show edit icon overlay
  onEdit?: () => void;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}
```

### Upload Widget Props

```typescript
interface PhotoUploadWidgetProps {
  currentPhotoUrl?: string | null;
  userName: string;
  userType: 'job_seeker' | 'employer' | 'admin';
  userId: number;
  onUploadSuccess: (photoUrl: string) => void;
  onUploadError: (error: Error) => void;
  onDelete?: () => void;
  maxSizeMB?: number;
  allowedFormats?: string[];
  showPreview?: boolean;
}
```

## Benefits of New Approach

### For Developers

1. ✅ **DRY Code** - Write once, use everywhere
2. ✅ **Type Safety** - Full TypeScript support
3. ✅ **Easy Testing** - Isolated, testable components
4. ✅ **Maintainable** - Single place to fix bugs
5. ✅ **Extensible** - Easy to add features

### For Users

1. ✅ **Consistent UX** - Same experience everywhere
2. ✅ **Fast Loading** - Optimized images, proper caching
3. ✅ **Reliable** - Graceful fallbacks, error recovery
4. ✅ **Accessible** - Alt text, screen reader support
5. ✅ **Responsive** - Works on all screen sizes

### For Business

1. ✅ **Scalable** - Works for 10 users or 10 million
2. ✅ **Cost Efficient** - Optimized bandwidth usage
3. ✅ **Secure** - Proper authentication, validation
4. ✅ **Professional** - Polished, production-ready
5. ✅ **Future Proof** - Easy to migrate storage providers

## Migration Strategy

### Phase 1: Create New Components (No Breaking Changes)
- Build ProfileImage component
- Build PhotoUploadWidget component
- Add comprehensive tests

### Phase 2: Gradual Adoption
- Replace PhotoUpload in EditProfileScreen
- Replace Avatar in ProfileScreen
- Add employer photo upload
- Test thoroughly

### Phase 3: Backend Optimization
- Add image resizing/optimization
- Implement CDN headers
- Add image variants (thumbnails)
- Optimize database queries

### Phase 4: Cleanup
- Remove old PhotoUpload component
- Remove platform-specific code
- Update documentation
- Performance audit

## Success Metrics

- [ ] **All images load < 1 second**
- [ ] **Zero broken image icons**
- [ ] **Works on web, iOS, Android**
- [ ] **Works for all user types**
- [ ] **Graceful offline handling**
- [ ] **< 5% error rate**
- [ ] **100% test coverage**
