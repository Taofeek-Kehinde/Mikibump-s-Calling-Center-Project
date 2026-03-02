# TODO - QR Code Admin Form Updates

## Task: Update QR code flow to direct to adminform.tsx with full viewing capabilities

### Changes Required:

1. [ ] **Qrcode.tsx** - Change QR code URL from `/qrform/:id` to `/adminform/:id`
   - Line that generates QR URL: `const qrUrl = \`${window.location.origin}/qrform/${id}\`;`
   
2. [ ] **Adminform.tsx** - Add WhatsApp button and "CHECK THIS OUT" button when viewing saved submission
   - Add WhatsApp "TALK TO ME" button (like in Qrform.tsx)
   - Add "CHECK THIS OUT" button if link exists in saved data
   - Currently only shows WhatsApp number text, needs buttons instead

### Implementation Steps:
1. Edit Qrcode.tsx to change the URL path
2. Edit Adminform.tsx to add action buttons for saved submissions
