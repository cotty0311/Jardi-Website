# Jardi website deployment

- Website repository: https://github.com/cotty0311/Jardi-Website
- App repository (unchanged): https://github.com/cotty0311/Jardi-LocationTool
- Custom domain: `jardi.cc`
- Canonical document routes: `/1.0.0/zh/` and `/1.0.0/en/`
- Legacy `/1.0.0/zh-Hant/*.html` pages redirect to `/zh/`, retaining query and hash.

## Release gate

Pushes and pull requests only build and test. Publication requires a manual run of
`Publish Jardi documentation` on `main` with the `deploy` checkbox enabled.
Do not enable deployment until the checks below pass and DNS ownership/setup is confirmed.

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

## DNS records to prepare

The nameservers observed on 2026-10-21 were `georgia.ns.cloudflare.com` and
`vicky.ns.cloudflare.com`. Provider/account confirmation is still required before
changing DNS. No apex A records or www CNAME were returned at inspection time.

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
curl -I https://jardi.cc/1.0.0/zh/interface.html
curl -I https://jardi.cc/1.0.0/en/location.html
```

DNS propagation and certificate availability may take time. HTTPS is complete only
when the certificate is valid and GitHub confirms enforcement. Do not treat a
successful build or a CNAME file as proof of live HTTPS.

Sources: [GitHub custom-domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
and [GitHub HTTPS setup](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).
