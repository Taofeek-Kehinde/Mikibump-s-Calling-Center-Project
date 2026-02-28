# TODO - Candy Form Updates

## Implementation Plan:

### 1. Update canyform.tsx
- [ ] Add 15-word limit to message input
- [ ] Add text-to-speech preview functionality
- [ ] Store the message text in Firestore
- [ ] Change expiration from 24 hours to 15 hours

### 2. Update CandyView.tsx
- [ ] Display the message content
- [ ] Use text-to-speech when unlocked (after 15 minutes)
- [ ] Update button styling: red when waiting, green when ready
- [ ] Change expiration from 24 hours to 15 hours
- [ ] Show: candy type, name, time, date

### 3. Update Firestore data structure
- [ ] Add message field to store the text message
