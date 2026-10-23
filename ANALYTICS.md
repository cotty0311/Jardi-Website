# Website analytics

Analytics is optional. Both providers are disabled until a real site token or
Measurement ID is configured. No sample IDs are shipped or substituted at build
time. The providers can be enabled independently, with no backend or API secrets.

## Configure the identifiers

Edit the `analytics` object in `site.config.json`:

- `cloudflareToken`: the **Web Analytics site token** from Cloudflare → Web Analytics
  → select/add `jardi.cc` → Manage site → JS snippet → `data-cf-beacon.token`.
  This is not a Cloudflare API token or zone/account ID.
- `ga4MeasurementId`: the **Measurement ID** from Google Analytics → Admin → Data
  streams → the `jardi.cc` web stream. It starts with `G-` and is not the numeric
  property ID, stream ID, or a Measurement Protocol API secret.
- `ga4HistoryTrackingDisabled`: keep `false` until the GA4 setting below is disabled,
  then change to `true`. Builds reject an enabled GA4 ID without this confirmation.

Keep an unconfigured identifier `null` to disable that provider. The identifiers
are public browser configuration; never put account passwords or private API
keys here. Analytics only runs on the configured `domain` and its `www` hostname;
localhost previews do not send analytics.

Alternatively, configure GitHub repository **Settings → Secrets and variables →
Actions → Variables** (repository variables, not environment variables scoped to
only the deploy job):

| Repository variable | Equivalent config field |
| --- | --- |
| `JARDI_CLOUDFLARE_TOKEN` | `analytics.cloudflareToken` |
| `JARDI_GA4_MEASUREMENT_ID` | `analytics.ga4MeasurementId` |
| `JARDI_GA4_HISTORY_TRACKING_DISABLED` | `analytics.ga4HistoryTrackingDisabled` (`true` after completing the setting below) |

The Pages workflow passes these to the **build** job. Nonempty variables take
precedence over the config file; empty/unset variables retain the file settings.
The same environment names work for local builds. Remove both the variable and
the config value to disable a provider. Rebuild and deploy after configuration
changes; changing repository variables alone does not update the live site.

## Required GA4 setting: avoid duplicate page views

In the selected GA4 web stream, open **Enhanced measurement → Settings → Page
views → Show advanced settings** and disable **Page changes based on browser
history events**. Then set `ga4HistoryTrackingDisabled` to `true` (or the matching
repository variable to `true`). Also remove any separate GA4/Google Tag Manager
page-view tag for this site; use this integration as the single page-view owner.

This integration sets `send_page_view: false` on every full page load and sends
one manual `page_view` when the router commits the final displayed content.
Google's history-based enhanced measurement is independent of that option and
must be disabled in the web stream. This is especially important here because
scroll restoration also calls `history.replaceState`.

The initial event waits for stored language/version restoration and legacy URL
normalization. Back/forward navigation and actual language/version changes count
as views. Consecutive notifications for the same page/language/version, hash-only
navigation, query changes, and scrolling do not. Returning from another page
counts as a new view. Redirect documents do not include analytics, and animation
iframes skip analytics so they do not add phantom views to the parent page.

## Cloudflare configuration

Use the manual JS snippet installation mode. Do not also enable automatic beacon
injection or paste a second snippet into Markdown. The module loads the official
Cloudflare beacon once with `spa: true`; Cloudflare handles its own SPA
measurement. Jardi does not manually send a second Cloudflare page-view event.
Cloudflare reports clean URLs; GA4's parameters distinguish languages and guide
versions sharing the same public URL.

## GA4 events

All custom events include `page_slug`, `content_language` (`zh-TW` or `en`),
`jardi_version`, `page_location`, and `page_title`.

| Event | Trigger | Additional parameters |
| --- | --- | --- |
| `page_view` | Initial settled content and committed page/language/version changes | `page_referrer` |
| `dmg_download` | A DMG link is clicked, including the installation button | `file_name`, `link_url` |
| `language_switch` | A successful change from the displayed language to another | `previous_language`, `selected_language` |
| `guide_view` | A user-guide page is viewed, including direct entry or a return visit | `guide_slug` |
| `feedback_click` | A link to the feedback page or the button opening its form is clicked | `action`: `open_page` or `open_form` |

GA4 may also collect its own enhanced `file_download` event if File downloads is
on. `dmg_download` is the dedicated Jardi DMG click metric; do not sum the two as
one download count. GA4 custom dimensions can be registered for `content_language`,
`jardi_version`, `guide_slug`, and `selected_language` if needed in reports.

The integration never reads feedback email addresses, subjects, messages, search
queries, coordinates, or uploaded files. URLs supplied to GA4 omit queries and
fragments. Click tracking does not prevent browser actions, await the network,
or change the direct DMG download behavior. Vendor scripts load asynchronously;
blocked scripts or unavailable analytics do not block the website.

## Verify and release

```sh
npm run check
npm test
```

The build check verifies consistent configuration and exactly one analytics
module per eligible HTML document, including both languages and all versions.
Offline tests exercise configuration validation, committed page counts,
language/version changes, guide returns, DMG and feedback events, independent
providers, blocked scripts, localhost suppression, iframe suppression, and
sanitized URLs. Tests never contact Google, Cloudflare, or Formspree.

After supplying real IDs and completing the GA4 setting, deploy with the existing
Pages workflow. On the live site:

1. In browser Network tools, check one `gtag/js` load and one Cloudflare beacon
   script load per browser document. Internal navigation must not reload them.
2. Use GA4 Realtime or DebugView (enable debug mode with Google's debugging tools)
   to verify one `page_view` after initial load and each real navigation, and none
   on scrolling, duplicate route notifications, or anchor jumps.
3. Switch languages and versions, visit guides, click the DMG link, and open the
   feedback form. Confirm the event names and public metadata listed above.
4. Confirm visits appear in Cloudflare Web Analytics after its processing delay.
5. Block analytics requests and confirm navigation, theme, search, download, and
   feedback still work. Do not submit a live feedback report just to test analytics.

Production delivery can only be confirmed after real IDs are configured and the
vendor dashboards show receipt. A passing offline test is not proof of live
analytics collection.

Sources: [GA4 manual page views](https://developers.google.com/analytics/devguides/collection/ga4/views),
[GA4 SPA measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications),
[Cloudflare setup](https://developers.cloudflare.com/web-analytics/get-started/),
[Cloudflare SPA measurement](https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/).
