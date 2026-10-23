# Room branding & launch concept

October 22, 2026. Isolated local exploration owned by the Branding & Launch chat. No production app, pairing, backend, domain routing, or access changes.

- `index.html`: responsive landing-page concept.
- `brand.html`: three vector logo directions, palette, typography, and voice. Direction 01, Open Room, was selected by the owner on October 22, 2026.
- `assets/room-mark.svg`: initial scalable mark and concept favicon.
- `room.css`: shared standalone styling.
- `LAUNCH-BASICS.md`: preparation and acceptance checklist.

Preview from the project root with `python3 -m http.server 8891 --bind 127.0.0.1`, then open `/marketing/brand.html` or `/marketing/`.

## Content and verification boundaries

All display illustrations are HTML/CSS concept compositions and use demo data. They are not exact production screenshots. Replace them with approved screenshots or real device photography before publication. No testimonials, waitlist collection, analytics, or public registration claims are invented. All app links point to the existing account entry and explain invitation-only access.

The current concept deliberately uses `noindex,nofollow`. Before publication, add canonical and social metadata, production icons and approved social image; remove concept labels and noindex only after the launch gates pass. There are no placeholder privacy or support links because those destinations do not exist yet. That is a publication blocker, not a completed legal setup.

## Integration

This directory is not connected to production routing. The apex and www currently redirect through the app Worker according to docs/CUSTOM-DOMAIN.md. Coordinate a reviewed hostname-routing change with App UX & Integration; keep app.getroomdisplay.com and existing device origins intact. Do not publish this folder as the app's root assets.

## Design decisions still open

Open Room is the approved logo direction. Confirm the headline; decide whether the first landing page is for invited testers only or should collect requests for access. Collection needs a real destination, stated purpose and privacy coverage. Until then the CTA opens the existing invitation-only beta.

The older-device section uses an original CSS illustration inspired by early white iPads: broad bezel, inset 4:3 screen, front camera and physical Home button. It is not a photograph or an exact model rendering. Hero and face examples are preserved. Future lifestyle images can supplement these illustrations after product displays are selected.

## Launch preparation update

Ivan Torres confirmed as operator; public beta/support/privacy contact: ivantorresmia@gmail.com. Email-first invitations request model, OS and browser; no mailing list, automatic enrollment or newsletter subscription is created. Solo-developer copy and tested iPad 3/iOS 9.3.5 plus iPad 4/iOS 10.3.4 list added.

Support, privacy and beta-terms HTML pages are prepared. Legal pages are visibly drafts pending operational review. The backend currently lacks a validated full account-deletion process; provider log/backups/email retention and service locations remain to be confirmed. No blanket privacy promises or invented retention deadlines are made.

Icons: PNG 16/32/48/180/192/512, multi-resolution favicon.ico, SVG master. Social preview: assets/social-preview.png (1200 × 630). Rebuild using tools/export-assets.py with Pillow installed. SEO metadata points to intended production root paths; robots and all HTML keep drafts unindexed. sitemap.xml is prepared but not advertised until publication. No analytics or audience trackers added.

Before publication: review legal copy and resolve operational gaps, check Open-Meteo eligibility for Room's intended activity (free API is noncommercial only), test the email request flow, replace/remove draft labels as appropriate, remove noindex on approved public pages, change robots to allow indexing and point to sitemap, then coordinate apex routing and app smoke tests with integration owner. The public build should exclude brand.html, README.md, tools/, LAUNCH-BASICS.md and other internal files. This directory has not been deployed.

Sources reviewed October 22, 2026: https://firebase.google.com/support/privacy ; https://open-meteo.com/en/terms ; https://oag.ca.gov/sites/all/files/agweb/pdfs/cybersecurity/making_your_privacy_practices_public.pdf . These inform drafting and provider checks, not a claim that Room's obligations have been fully determined.
