# TODO: Modify Music Playback Logic

## Tasks:
- [x] Modify dashboard.tsx: in music useEffect, only play music if data.playing and isLive, set currentMusic to data.url (which will be '/music/music.mp3')
- [x] Modify Admin.tsx: in handleGoLive, set Firebase music to { url: '/music/music.mp3', playing: true }
- [x] Modify Admin.tsx: in handleGoOffline, set Firebase music playing: false
- [x] Ensure music persists across refresh via Firebase
- [x] Test on localhost and Vercel

## Notes:
- Keep Firebase music saving for persistence
- Music only plays when LIVE, automatically
- Hardcode URL to '/music/music.mp3' in Admin
