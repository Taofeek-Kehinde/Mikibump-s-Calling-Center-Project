# TODO List

## Task: QR Code - URL Button Logic

### Understanding:
1. When scanning QR code, user goes to Adminform.tsx to fill form (voice note + WhatsApp number)
2. After form submission:
   - If URL was provided in QR generator → Show "CHECK THIS OUT" button + "TALK TO ME" button
   - If NO URL provided → Show only "TALK TO ME" button

### Implementation Done:
- [x] Added customUrl state and useSearchParams hook to Adminform.tsx
- [x] Added useEffect to get customUrl from query parameter
- [x] Updated handleSubmit to save customUrl along with form data

### How it works:
1. QR with URL: QR contains `/adminform/{id}?customUrl={url}`, Adminform saves url to Firestore, shows both buttons
2. QR without URL: QR contains `/adminform/{id}`, Adminform shows form, saves submission without link, shows only "TALK TO ME" button

### Files Modified:
- src/pages/Adminform.tsx - Added customUrl handling from query parameters
