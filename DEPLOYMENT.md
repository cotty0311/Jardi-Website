# Jardi website deployment

- Website repository: https://github.com/cotty0311/Jardi-Website
- App repository (unchanged): https://github.com/cotty0311/Jardi-LocationTool
- Custom domain: `jardi.cc`
- Canonical document routes: `/`, `/install`, `/location`, etc.
- Language and version selections persist in browser storage; payloads remain under `/1.0.0/zh/` and `/1.0.0/en/`.
- Legacy `/1.0.0/zh-Hant/*.html` pages redirect to `/zh/`, retaining query and hash.

## Release gate

Pushes and pull requests only build and test. Publication requires a manual run of
`Publish Jardi documentation` on `main` with the `deploy` checkbox enabled.
Enable deployment after the checks below pass. DNS ownership and setup were confirmed on 2026-10-22.

Local verification:

```sh
npm ci
npm run check
npm test
npm run dev
```

Check both languages, light/dark/automatic mode, screenshot variants, navigation,
search, feedback, and direct page loads. `check` verifies all pages, image source
sets, language links, anchors, stylesheets, and search indexes. Feedback tests use
a local mock receiver and do not send email.

## GitHub Pages setup

1. Keep this folder's contents at the root of `Jardi-Website`, including `.github`.
2. Repository Settings → Pages → Source: **GitHub Actions**.
3. Add `jardi.cc` as the custom domain in **Pages settings** before pointing DNS at Pages.
4. Configure DNS with the confirmed provider, then verify the records publicly.
5. Once ready, manually run the workflow with `deploy=true`; check both jobs succeed.
6. Wait for GitHub's certificate provisioning, then enable **Enforce HTTPS**.
7. Verify HTTPS, HTTP-to-HTTPS redirection, direct document URLs, and assets on the live domain.

`dist/CNAME` records the intended domain, but Actions-based publishing uses the
repository's Pages settings; that file alone does not bind the domain.

## Configured DNS records

The authoritative nameservers are `georgia.ns.cloudflare.com` and
`vicky.ns.cloudflare.com`. Cloudflare is confirmed. The four DNS-only A records and the www CNAME below are configured; GitHub has approved a certificate for both hostnames and HTTPS enforcement is enabled (verified 2026-10-22).

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | cotty0311.github.io |

Use these records at the confirmed DNS provider. Inspect existing records before
changing them; do not modify unrelated email or verification records.

```sh
dig jardi.cc A +short
dig www.jardi.cc CNAME +short
curl -I https://jardi.cc/
curl -I http://jardi.cc/
curl -I https://jardi.cc/interface
curl -I https://jardi.cc/location
```

DNS propagation and certificate availability may take time. HTTPS is complete only
when the certificate is valid and GitHub confirms enforcement. Do not treat a
successful build or a CNAME file as proof of live HTTPS.

Sources: [GitHub custom-domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
and [GitHub HTTPS setup](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).
