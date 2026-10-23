# Google Search 與 SEO

## 自動產生的檔案

執行 `npm run check`（或 `npm run build`）後：

- `dist/sitemap.xml`：列出所有公開文件的 canonical URL；目前 13 頁 × 2 種語言，共 26 個網址。版本快照會依 `site.config.json.versions` 自動加入。
- `dist/robots.txt`：允許搜尋引擎抓取全部路徑及資源，並提供 sitemap 的 HTTPS 網址。
- 每頁有獨立 title、meta description、canonical，以及互相對應的 `zh-Hant`、`en`、`x-default` hreflang。
- 首頁與下載安裝頁包含 `SoftwareApplication` JSON-LD：真實 App 名稱、作者、macOS 需求、版本、圖片、下載與說明連結。不虛構價格、評分或評論；不保證符合 Google 軟體應用程式複合式搜尋結果的額外資格。

中文敘述在 `site.config.json.pages[].description`，英文在 `descriptionEn`；標題使用各頁的 `title` 與既有英譯。更新 Markdown 或版本後重新建置、部署，搜尋資料即可同步。網址來源為 `site.config.json.domain`，目前是 `jardi.cc`。

## 語言、網址與舊連結

Google 需要不同語言各有可獨立讀取的網址。因此新增穩定英文入口：

| 內容 | 中文 canonical | 英文 canonical |
| --- | --- | --- |
| 首頁 | `https://jardi.cc/` | `https://jardi.cc/en/` |
| 虛擬定位 | `https://jardi.cc/location/` | `https://jardi.cc/en/location/` |
| 安裝 | `https://jardi.cc/install/` | `https://jardi.cc/en/install/` |

這些都是完整靜態 HTML；不需要 JavaScript、登入或已儲存的語言偏好。英文入口會優先顯示英文，不會被先前儲存的中文偏好覆蓋。原本的乾淨網址、語言／版本選擇、SPA 導覽與舊路徑仍可使用。正常 SPA 導覽延續原本的簡短網址，同時更新整組 SEO head 資料。

Canonical 及 sitemap 使用目錄尾端的 `/`，因為 GitHub Pages 會先將無尾斜線的路徑轉到該網址。既有 `/{version}/{zh|en}/*.html` 仍提供完整文件；最新版的重複 HTML 指向相應的穩定語言 canonical。舊版本文件保留各自的 canonical 與語言配對，避免混淆不同版本。

404 與內嵌動畫使用 `noindex, follow`，不列入 sitemap；動畫仍可載入、文件仍可爬取。舊轉址也不列入 sitemap。正式內容頁全部允許索引；沒有封鎖 CSS、JavaScript 或圖片。

## 提交至 Google Search Console

1. 開啟 [Google Search Console](https://search.google.com/search-console)，登入管理網站的 Google 帳號。
2. 新增 **Domain 資源**，輸入 `jardi.cc`（不含 `https://` 或路徑）。若已驗證，直接選擇既有資源。
3. Google 若要求 DNS 驗證，在 Cloudflare → `jardi.cc` → DNS → Records 新增 Google 提供的 **TXT** 記錄；名稱為 `@`，內容完整貼上 `google-site-verification=...`。保留既有 Pages A/CNAME 記錄，完成後回到 Google 按驗證。請保留驗證 TXT。
4. 確認部署完成，而且 `https://jardi.cc/sitemap.xml` 與 `https://jardi.cc/robots.txt` 可公開讀取。
5. 在左側 **Sitemaps／網站地圖**，新增 `https://jardi.cc/sitemap.xml` 並提交。
6. 用 **URL Inspection／網址審查** 分別檢查 `https://jardi.cc/`、`https://jardi.cc/en/` 及一組中英文指南網址，執行「測試實際網址」，必要時「要求建立索引」。
7. 後續檢查「網頁索引」及 Sitemap 處理狀態。新增文章後通常不必重複提交相同 sitemap；重新部署後 Google 可再次抓取。

提交 sitemap 不保證立即收錄或特定排名。可使用 [Rich Results Test](https://search.google.com/test/rich-results) 檢查部署後的首頁與安裝頁；因沒有虛構評分與價格，可能不具備軟體複合式搜尋結果所需的全部欄位，這不會阻止一般網頁收錄。

## 驗證

```bash
npm run check
npm test
```

`check` 會重新產生正式成品，檢查 sitemap 是否完整、canonical 是否指向存在且可索引的頁面、hreflang 是否互相回連、JSON-LD 是否可解析，以及原有連結、錨點、下載、圖片、搜尋與分析設定。`test` 包含 SEO、分析事件、回報表單與主題圖片的離線回歸測試，不會寄送測試郵件。

參考：[Google sitemap 文件](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)、[多語言 hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)、[SoftwareApplication](https://developers.google.com/search/docs/appearance/structured-data/software-app)、[Search Console 所有權驗證](https://support.google.com/webmasters/answer/9008080)。
