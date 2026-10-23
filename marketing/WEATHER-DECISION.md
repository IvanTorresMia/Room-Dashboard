# Superseded recommendation

October 23: Ivan selected WeatherAPI.com Free, with Starter ($7/month) acceptable if later needed. No subscription purchase authorized here. The Open-Meteo discussion below is historical. See WEATHERAPI-HANDOFF.md for approved work and remaining integration.

# Weather provider decision — October 22, 2026

Recommendation: retain the already-tested Open-Meteo integration; seek written clarification of free beta eligibility before public promotion or expanding use. Do not buy or enable a paid service without Ivan's approval. Keep the beta invitation-only and measure weather requests, including direct display requests, geocoding and server fallback; server cache metrics alone are not total usage.

The official pricing page explicitly allows free evaluation/prototyping. The terms allow personal home automation and voluntary donations, but exclude commercial products/promotional activities. Neither "free to users" nor "beta" alone resolves the classification. The present project is a free personal home-display beta, but has a public product landing page and potential future paid offerings. This specific combination warrants clarification rather than a claim of definite approval or prohibition.

Official references checked Oct 22:
- https://open-meteo.com/en/terms : free noncommercial requests below 10,000/day, 5,000/hour, 600/minute; attribution under CC BY 4.0; free API logs potentially include coordinates and retained 90 days.
- https://open-meteo.com/en/pricing : evaluation and prototyping on free tier; subscription grants commercial use at customer-api.open-meteo.com with API key. No exact subscription price was available in the retrieved page; obtain an actual quote before budgeting.

## Draft clarification email — not sent

To: info@open-meteo.com
Subject: Free invitation-only home-display beta — licensing clarification

Hello,

I'm Ivan Torres, an independent developer building Room, a web application that gives older tablets a second life as personal clock/weather displays at home.

I'd like to invite a small number of people to test it at no charge, with no advertising or subscriptions. A public landing page at getroomdisplay.com would explain the beta and invite people to email me for access; enrollment remains manual. Weather and city search use Open-Meteo, with attribution. Displays refresh weather roughly every 15 minutes while visible, with a server fallback cache. I'll monitor usage against your free limits.

Would this limited beta and its informational landing page qualify for your free evaluation/prototyping or noncommercial terms? Are there restrictions we should follow for public invitations? If Room later introduces paid features, I would revisit licensing before doing so.

Thanks,
Ivan Torres

## If clarification is negative or unresolved

For a public weather-enabled release, get a commercial subscription quote and explicit owner budget approval, or disable weather for that launch after coordinating accurate product copy. If paying later, keep the provider API key server-side and proxy/cache weather; never embed a paid key in the legacy display code. A provider change is a separate integration/test project, not a shortcut around licensing. Do not silently treat missing response as permission.
