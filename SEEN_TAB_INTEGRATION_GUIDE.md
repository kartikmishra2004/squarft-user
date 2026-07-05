# Seen Tab - Project View Tracking Integration Guide

## Overview
This feature implements a **fully local** tracking system for monitoring how many times users view projects. Projects viewed 5+ times appear in a "Seen" tab for exactly 7 days from qualification, using only AsyncStorage - **no backend changes required**.

## Architecture

### Data Flow
```
User opens project 
  → dispatch(incrementProjectView(projectId))
  → AsyncStorage updated
  → Redux state updated
  → UI reflects changes
```

### Data Structure
Each tracked project follows this shape:
```javascript
{
  id: string,                    // Project unique identifier
  count: number,                 // View count (caps at 5)
  firstQualifiedAt: number | null // Timestamp when count hit 5, null otherwise
}
```

## Files Created

1. **`store/slices/projectViewTrackingSlice.js`**
   - Redux slice with async thunks
   - AsyncStorage integration
   - Selectors for UI consumption

2. **`components/myActivity/SeenTabContent.jsx`**
   - Example UI component for "Seen" tab
   - Shows how to consume the tracking data

3. **`store/store.js`** (modified)
   - Added `projectViewTracking` reducer

## Integration Steps

### Step 1: Initialize on App Boot

In your root `_layout.jsx` or `app/index.jsx`, hydrate the trackers on mount:

```javascript
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { hydrateAndCleanTrackers } from './store/slices/projectViewTrackingSlice';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Hydrate and clean expired trackers on app boot
    dispatch(hydrateAndCleanTrackers());
  }, [dispatch]);

  return (
    // Your app content
  );
}
```

### Step 2: Track Project Views

Whenever a user opens/views a project, increment the view count:

**In `app/(screens)/project-detail.jsx`:**

```javascript
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocalSearchParams } from 'expo-router';
import { incrementProjectView } from '../../store/slices/projectViewTrackingSlice';

export default function ProjectDetail() {
  const dispatch = useDispatch();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    if (id) {
      // Track view when project is opened
      dispatch(incrementProjectView(id));
    }
  }, [id, dispatch]);

  return (
    // Your project detail UI
  );
}
```

### Step 3: Display Seen Projects

**Add "Seen" tab to your My Activity screen:**

```javascript
// In app/(tabs)/myActivity.jsx or similar

import { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import SeenTabContent from '../../components/myActivity/SeenTabContent';
import SavedTabContent from '../../components/myActivity/SavedTabContent';
import ContactedTabContent from '../../components/myActivity/ContactedTabContent';

export default function MyActivity() {
  const [activeTab, setActiveTab] = useState('saved');

  return (
    <View className="flex-1">
      {/* Tab Header */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TabButton 
          label="Saved" 
          active={activeTab === 'saved'} 
          onPress={() => setActiveTab('saved')} 
        />
        <TabButton 
          label="Seen" 
          active={activeTab === 'seen'} 
          onPress={() => setActiveTab('seen')} 
        />
        <TabButton 
          label="Contacted" 
          active={activeTab === 'contacted'} 
          onPress={() => setActiveTab('contacted')} 
        />
      </View>

      {/* Tab Content */}
      {activeTab === 'saved' && <SavedTabContent />}
      {activeTab === 'seen' && <SeenTabContent />}
      {activeTab === 'contacted' && <ContactedTabContent />}
    </View>
  );
}

function TabButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 py-4 ${active ? 'border-b-2 border-purple-600' : ''}`}
    >
      <Text className={`text-center font-manrope-bold ${active ? 'text-purple-600' : 'text-gray-500'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
```

## Available Selectors

### Select All Qualified Projects
```javascript
import { useSelector } from 'react-redux';
import { selectSeenProjects } from '../store/slices/projectViewTrackingSlice';

const seenProjects = useSelector(selectSeenProjects);
// Returns: Array of trackers with count >= 5
```

### Get View Count for Specific Project
```javascript
import { useSelector } from 'react-redux';
import { selectProjectViewCount } from '../store/slices/projectViewTrackingSlice';

const viewCount = useSelector(selectProjectViewCount(projectId));
// Returns: number (0 if not tracked)
```

### Check if Project is Qualified
```javascript
import { useSelector } from 'react-redux';
import { selectIsProjectSeen } from '../store/slices/projectViewTrackingSlice';

const isSeen = useSelector(selectIsProjectSeen(projectId));
// Returns: boolean
```

### Check Hydration Status
```javascript
import { useSelector } from 'react-redux';
import { selectViewTrackingHydrated } from '../store/slices/projectViewTrackingSlice';

const isHydrated = useSelector(selectViewTrackingHydrated);
// Returns: boolean (true after hydrateAndCleanTrackers completes)
```

## Enriching Seen Projects with Full Data

The `SeenTabContent.jsx` component shows tracker data. To display full project details, you have two options:

### Option 1: Join with Existing Redux State
```javascript
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectSeenProjects } from '../../store/slices/projectViewTrackingSlice';

const seenTrackers = useSelector(selectSeenProjects);
const allProjects = useSelector((state) => state.project.list); // Your existing project list

const enrichedProjects = useMemo(() => {
  return seenTrackers.map(tracker => {
    const project = allProjects.find(p => p.id === tracker.id);
    return {
      ...tracker,
      ...project, // Merge project details
    };
  }).filter(p => p.name); // Filter out projects not found
}, [seenTrackers, allProjects]);
```

### Option 2: Fetch Project Details on Demand
```javascript
import { useEffect, useState } from 'react';
import { projectApi } from '../../services/projectApi';

const [enrichedProjects, setEnrichedProjects] = useState([]);

useEffect(() => {
  const fetchProjectDetails = async () => {
    const promises = seenTrackers.map(async (tracker) => {
      try {
        const project = await projectApi.getProjectById(tracker.id);
        return { ...tracker, ...project };
      } catch (error) {
        return tracker; // Return tracker only if fetch fails
      }
    });
    
    const results = await Promise.all(promises);
    setEnrichedProjects(results);
  };

  if (seenTrackers.length > 0) {
    fetchProjectDetails();
  }
}, [seenTrackers]);
```

## Behavioral Rules

### View Count Incrementing
- ✅ Increments each time `incrementProjectView` is called
- ✅ Stops incrementing at 5 (threshold)
- ✅ No duplicates created (finds existing tracker by ID)

### Qualification Timestamp
- ✅ Set **only** when count transitions from 4 to 5
- ✅ **Never** resets or updates after being set
- ✅ 7-day countdown starts from this timestamp

### Expiration & Cleanup
- ✅ Projects expire exactly 7 days after `firstQualifiedAt`
- ✅ Cleanup happens on app boot via `hydrateAndCleanTrackers()`
- ✅ Expired projects are removed from both storage and state

### Edge Cases Handled
- ✅ Invalid AsyncStorage data → resets to empty array
- ✅ Missing project ID → thunk rejects with error
- ✅ Duplicate tracker prevention → uses `.findIndex()` to update existing
- ✅ Null `firstQualifiedAt` → not qualified, won't show in Seen tab

## Testing & Debugging

### Manual Testing
```javascript
import { useDispatch } from 'react-redux';
import { 
  incrementProjectView, 
  clearAllTrackers,
  hydrateAndCleanTrackers 
} from './store/slices/projectViewTrackingSlice';

// In a debug component or console:
const dispatch = useDispatch();

// Simulate 5 views to qualify a project
for (let i = 0; i < 5; i++) {
  dispatch(incrementProjectView('test-project-123'));
}

// Clear all tracking data
dispatch(clearAllTrackers());

// Manually trigger cleanup
dispatch(hydrateAndCleanTrackers());
```

### Check AsyncStorage
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkStorage = async () => {
  const data = await AsyncStorage.getItem('@project_view_trackers');
  console.log('Stored trackers:', JSON.parse(data));
};

checkStorage();
```

### Test Expiration
To test 7-day expiration without waiting, temporarily modify the constant:
```javascript
// In projectViewTrackingSlice.js
const SEVEN_DAYS_MS = 60 * 1000; // 1 minute for testing
```

## Performance Considerations

- **AsyncStorage reads/writes**: Async operations won't block UI
- **Cleanup frequency**: Only on app boot (not on every view)
- **Memory footprint**: Minimal - only stores IDs and counts
- **Storage size**: ~100 bytes per project (negligible)

## Maintenance

### To Change Qualification Threshold
```javascript
// In projectViewTrackingSlice.js
const QUALIFICATION_THRESHOLD = 10; // Change from 5 to 10
```

### To Change Expiration Period
```javascript
// In projectViewTrackingSlice.js
const SEVEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000; // 14 days instead of 7
```

### To Add Background Cleanup (Optional)
```javascript
import { useEffect } from 'react';
import { AppState } from 'react-native';

useEffect(() => {
  const subscription = AppState.addEventListener('change', nextAppState => {
    if (nextAppState === 'active') {
      // Clean expired trackers when app comes to foreground
      dispatch(hydrateAndCleanTrackers());
    }
  });

  return () => subscription.remove();
}, [dispatch]);
```

## Summary

✅ **Created Files:**
- `store/slices/projectViewTrackingSlice.js` - Core tracking logic
- `components/myActivity/SeenTabContent.jsx` - UI example
- `store/store.js` - Added reducer (modified)

✅ **Key Features:**
- Fully local (no backend)
- 7-day expiration from qualification
- View count caps at 5
- Automatic cleanup on boot
- TypeScript-ready structure

✅ **Integration Points:**
1. Call `hydrateAndCleanTrackers()` on app boot
2. Call `incrementProjectView(projectId)` when project is opened
3. Use `selectSeenProjects` selector in Seen tab UI

No backend changes required! 🎉
