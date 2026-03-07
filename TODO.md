# LiveStartTime Fix TODO

## Task: Fix liveStartTime countdown not working properly

### Issues Identified:
1. `liveStartTime` is not being saved to localStorage when it changes (missing useEffect)
2. Two conflicting countdown mechanisms - one in Dashboard.tsx and one in AppContext.tsx

### Steps Completed:

- [x] 1. Add useEffect in AppContext.tsx to persist liveStartTime to localStorage
- [x] 2. Fix the countdown logic in AppContext.tsx to properly sync with Firebase
- [x] 3. Remove conflicting countdown logic from dashboard.tsx
- [x] 4. Add liveStartTime to storage sync for cross-tab support

### How the fix works:
1. When `isLive` becomes `true`, the AppContext sets `liveStartTime` to the current timestamp and saves it to both localStorage and Firebase
2. The countdown timer uses the `liveStartTime` to calculate remaining time (15 minutes = 900 seconds)
3. Every second, it updates the remaining time in both state and Firebase
4. When remaining time reaches 0, it automatically sets `isLive` to `false` in Firebase, making the app go offline
5. The `liveStartTime` is synced across tabs via localStorage storage events

