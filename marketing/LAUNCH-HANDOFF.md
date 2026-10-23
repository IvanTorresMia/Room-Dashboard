# Room marketing launch handoff

October 22, 2026. Owner authorizes passing this to Room — App UX & Integration for launch. Open Room identity, landing direction, support contact, and proposed beta/pricing/terms direction approved. Ivan Torres operates the project; ivantorresmia@gmail.com is intentionally public. Owner wants a small free, email-request invitation beta and welcomes feedback as a solo developer. Do not open public enrollment or upgrade services.

## Public files to package

index.html, support.html, privacy.html, terms.html, room.css, site.webmanifest, robots.txt, sitemap.xml, and assets/ (SVG, ICO, PNG icons, social-preview.png). Serve at https://getroomdisplay.com/ with www canonicalized to apex. Exclude brand.html, tools/, README.md, LAUNCH-BASICS.md, this handoff and other repository sources. Keep app.getroomdisplay.com, workers.dev and existing display pairings intact. Current Worker redirects all apex/www paths to the app before assets; its host routing and asset allowlist must be deliberately changed by integration owner.

## Checks completed in branding chat

- `tools/check-launch.py` passes: HTML language/title/viewport and single H1; duplicate IDs; image alt text; local asset/link and cross-page fragment targets; beta email URI recipient and template; PNG/ICO sizes; social image 1200×630; manifest JSON; sitemap and SVG XML.
- Browser rendered main page at desktop size; phone 390px and tablet 768px iframe viewports visually inspected at the hero. This is responsive browser inspection, not physical-device certification or a full accessibility audit.
- FAQ expanded by mouse and collapsed with Enter successfully. Support page rendered and inspected. Email template is correct; sending/receiving mail was not tested and no mail was sent.
- Social preview visually inspected; no paid fonts, external images, audience analytics, billing or signup changes introduced.
- Exact repeatable check: bundled Python with Pillow, `marketing/tools/check-launch.py`. No app regression suites run because production source is untouched.

## Remaining checks before publication

1. Privacy page explicitly flags unconfirmed hosting/auth/email log and backup retention, service locations, and unvalidated full account/data deletion. Resolve against actual provider settings and implement/test an owner-operated deletion process or otherwise establish an accurate working request process. Removing the draft banner alone does not resolve these. User approved proposed terms, but app acceptance integration is not implemented.
2. Weather provider review: https://open-meteo.com/en/terms checked Oct 22. Free API: noncommercial only; <10,000 calls/day, 5,000/hour, 600/minute. Personal home automation and voluntary donations are allowed examples; commercial products/promotional activities excluded. A public free beta is not automatically cleared. Establish eligibility or seek provider clarification for intended activity before expanding weather use; no paid plan authorized. Verify app weather attribution (required CC BY 4.0) at the actual point of display. Public HTML illustrations are labeled demo data, not a new live weather feed. Provider says free API logs may include coordinates and are deleted after 90 days.
3. One uncoached invited-tester setup and actual email delivery acceptance remain human/external checks. Do not claim them passed based on static link checks.
4. Before publication remove concept bar/identity link from public landing and replace demo footer as needed; retain honest illustrative-data labels. Legal pages still have DRAFT text. Keep noindex until policy review complete; then enable approved public-page indexing, use production robots allow + sitemap URL. Noindex brand.html stays internal/excluded regardless.
5. Check public pages at narrow widths beyond the hero and review long policy pages. Confirm contrast/focus and no horizontal scroll. App-domain compatibility is separate.

## Deployment acceptance

Root returns marketing 200; www redirects to apex; app root/account/display/connect and old host remain correct; unauthorized API calls still rejected; marketing must not expose app API under alternate origin; internal/config files 404; CSS/icons/social image/manifest serve correct types; production canonical/OG links resolve; privacy/support/terms and mailto work; verify one existing connected display and account room access. Record deployment version and rollback. Do not stage/commit unrelated dirty checkout files.

No deployment, Git commit, push, remote email or provider contact was performed by the branding chat. Site is prepared for integration with the explicitly listed review gaps; not certified fully launch-ready.


## Integration update — October 22

Account deletion implemented and deployed by App UX & Integration. Read ../docs/ACCOUNT-DELETION.md for exact behavior, tested cases, retained security record, pending/partial failure recovery, provider retention/location findings and operator process. Do not replace privacy draft wording with a blanket immediate-erasure claim. Release f86fd802-fae5-4d3a-bfe8-095f4d480693; no real account was deleted as a test. Provider retention research is documented, but exact Cloudflare service-wide logs, all data locations, and Gmail retention configuration remain unconfirmed. Real Firebase deletion acceptance and operator recovery remain external checks. Public marketing routing/files are still not deployed.
