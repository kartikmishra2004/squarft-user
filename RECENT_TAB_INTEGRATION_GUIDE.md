# Recent Projects Tab - Integration Guide

## Overview
This feature tracks projects that users have recently viewed, displaying them in a "Recent" tab for 3 days from their last view. Every time a user re-views a project, the 3-day timer resets (rolling window).

## ✅ What's Already Done

### 1. Redux Slice Created
- **File**: `store/slices/recentProjectsSlice.js`
- **Storage Key**: `@squarft_recent_projects`
- **Expiration**: 3 days (rolling window)

### 2. Store Configuration Updated
- ✅ `recentProjectsSlice` added to Redux store
- Available as `state.recentProjects`

### 3. UI Component Created
- **File**: `components/myActivity/RecentTabContent.jsx`
- Shows recent projects sorted by most recent first
- Displays time ago (e.g., "2h ago", "1d ago")
- Auto-enriches tracker IDs with full project data

---

## 🔧 Integration Steps

### Step 1: Initialize on App Boot

Call `hydrateAndCleanRecentTrackers()` when the app starts to load recent projects from storage and remove expired entries.

**Where**: `app/_layout.jsx` or `app/index.jsx` (root layout)

```javascript
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { hydrateAndCleanRecentTrackers } from './store/slices/recentProjectsSlice';

function RootLayout() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Hydrate recent projects on app boot
    dispatch(hydrateAndCleanRecentTrackers());
  }, [dispatch]);

  // ... rest of your layout
}
```

---

### Step 2: Track Project Views

Call `addToRecentProjects(projectId)` whenever a user opens a project detail screen.

**Where**: Project detail screen (e.g., `app/(screens)/project-detail.jsx`)

```javascript
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocalSearchParams } from 'expo-router';
import { addToRecentProjects } from '../../store/slices/recentProjectsSlice';

function ProjectDetailScreen() {
  const dispatch = useDispatch();
  const { id, slug } = useLocalSearchParams();

  useEffect(() => {
    // Track this project view
    const projectId = slug || id;
    if (projectId) {
      dispatch(addToRecentProjects(String(projectId)));
    }
  }, [id, slug, dispatch]);

  // ... rest of your screen
}
```

---

### Step 3: Add "Recent" Tab to My Activity Screen

Update your My Activity screen to include the Recent tab.

**Where**: `app/(tabs)/myActivity.jsx`

```javascript
import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import SavedTabContent from '../../components/myActivity/SavedTabContent';
import ContactedTabContent from '../../components/myActivity/ContactedTabContent';
import RecentTabContent from '../../components/myActivity/RecentTabContent';

const TABS = [
  { id: 'saved', label: 'Saved' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'recent', label: 'Recent' },
];

export default function MyActivity() {
  const [activeTab, setActiveTab] = useState('saved');

  return (
    <View className="flex-1">
      {/* Tab Headers */}
      <View className="flex-row bg-white border-b border-gray-200">
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 ${activeTab === tab.id ? 'border-b-2 border-[#4A43EC]' : ''}`}
          >
            <Text className={`text-center font-semibold ${activeTab === tab.id ? 'text-[#4A43EC]' : 'text-gray-500'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'saved' && <SavedTabContent />}
      {activeTab === 'contacted' && <ContactedTabContent />}
      {activeTab === 'recent' && <RecentTabContent />}
    </View>
  );
}
```

---

## 📊 Available Selectors

Use these selectors in your components to access recent projects data:

```javascript
import { useSelector } from 'react-redux';
import {
  selectRecentProjects,
  selectRecentProjectIds,
  selectIsProjectRecent,
  selectRecentProjectsCount,
  selectRecentProjectsLoading,
} from './store/slices/recentProjectsSlice';

function MyComponent() {
  // Get all recent projects (sorted by most recent first)
  const recentProjects = useSelector(selectRecentProjects);

  // Get just the IDs
  const recentIds = useSelector(selectRecentProjectIds);

  // Check if a specific project is recent
  const isRecent = useSelector(selectIsProjectRecent('project-123'));

  // Get count
  const count = useSelector(selectRecentProjectsCount);

  // Get loading state
  const loading = useSelector(selectRecentProjectsLoading);
}
```

---

## 🎯 Key Behaviors

### Rolling Window (Different from "Seen" Feature)
- **First view**: Project added with timestamp
- **Re-view**: Timestamp **UPDATED** (resets 3-day timer)
- **Expiration**: Projects removed after 3 days from last view

### Data Structure
```javascript
{
  id: "project-123",           // Project identifier
  lastViewedAt: 1704067200000  // Unix timestamp (milliseconds)
}
```

### Automatic Cleanup
- Runs on app boot via `hydrateAndCleanRecentTrackers()`
- Removes projects older than 3 days
- Saves cleaned list back to AsyncStorage

---

## 🧪 Testing

### Manual Testing

1. **Test tracking**:
   ```javascript
   // In project detail screen, verify console logs
   console.log('Project viewed:', projectId);
   ```

2. **Test persistence**:
   - View a project
   - Close and reopen the app
   - Check if project still appears in Recent tab

3. **Test rolling window**:
   - View a project
   - Wait a few seconds
   - View it again
   - Check if timestamp updated (use Redux DevTools or console)

4. **Test expiration**:
   - Manually set a project's `lastViewedAt` to 4 days ago in AsyncStorage
   - Restart the app
   - Verify project is removed from Recent tab

### Programmatic Testing

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear all recent projects
await AsyncStorage.removeItem('@squarft_recent_projects');

// Manually add a project
const testData = [{
  id: 'test-project-1',
  lastViewedAt: Date.now()
}];
await AsyncStorage.setItem('@squarft_recent_projects', JSON.stringify(testData));

// Read raw data
const stored = await AsyncStorage.getItem('@squarft_recent_projects');
console.log('Recent projects:', JSON.parse(stored));
```

---

## 🔍 Debugging

### Check Storage Directly
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.getItem('@squarft_recent_projects').then(data => {
  console.log('Recent projects storage:', JSON.parse(data));
});
```

### Monitor Redux State
```javascript
import { useSelector } from 'react-redux';

const recentState = useSelector(state => state.recentProjects);
console.log('Recent projects state:', recentState);
```

---

## 🛠️ Utility Actions

### Clear All Recent Projects
```javascript
import { clearAllRecentProjects } from './store/slices/recentProjectsSlice';

// In a component
const dispatch = useDispatch();
dispatch(clearAllRecentProjects());
```

### Clear Error State
```javascript
import { clearError } from './store/slices/recentProjectsSlice';

dispatch(clearError());
```

---

## 📝 Notes

1. **No Backend Required**: This feature is 100% local using AsyncStorage
2. **Privacy**: User data never leaves their device
3. **Performance**: Minimal overhead, uses efficient timestamp comparisons
4. **Reliability**: Handles corrupted storage data gracefully
5. **Flexibility**: Can be extended to track additional metadata if needed

---

## ✅ Checklist

- [ ] Call `hydrateAndCleanRecentTrackers()` on app boot
- [ ] Call `addToRecentProjects(projectId)` in project detail screen
- [ ] Add "Recent" tab to My Activity screen
- [ ] Test tracking by viewing projects
- [ ] Test persistence by restarting app
- [ ] Test rolling window by re-viewing projects
- [ ] Test UI displays time ago correctly
- [ ] Verify empty state shows when no recent projects

---

## 🎨 Customization

### Change Expiration Period
Edit `recentProjectsSlice.js`:
```javascript
// Change from 3 days to 7 days
const THREE_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
```

### Add More Metadata
Extend the tracker structure:
```javascript
{
  id: projectId,
  lastViewedAt: now,
  viewCount: existingProject ? existingProject.viewCount + 1 : 1,
  firstViewedAt: existingProject?.firstViewedAt || now,
}
```

---

## 🚀 Ready to Go!

The feature is fully implemented and ready to use. Just follow the 3 integration steps above!
