# Company branding

## Title screen partnership
- `tarento.png` — Tarento wordmark (transparent)
- `loophealth.png` — Loophealth mark

Shown above **Enrolment Quest** as `Tarento × Loophealth`.

## Enrolment portal QR
- `qr_enrol_portal.png` — scannable QR for `https://benefits.loophealth.com/`
  Regenerate: `npx qrcode "https://benefits.loophealth.com/" -o public/branding/qr_enrol_portal.png -w 512`

## Focus Zone / in-game
Drop the company logo as **`logo.png`** (transparent PNG, ~160–320px wide).
Until `logo.png` is present, the game falls back to `logo.svg`.

`CONFIG.LOGO_URL` points at `logo.png` for Focus Zone headers.
