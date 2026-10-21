# Jardi 使用文檔網站

純靜態網站，文章來自 `content/zh/*.md` 與 `content/en/*.md`。建置後的 HTML、搜尋索引和圖片放在 `dist/`，可部署到 GitHub Pages，不需要後端。網站沿用專案 `icon.png` 的花園視覺，圖片已複製至 `assets/jardi.png`，所以 Website 可獨立作為 GitHub repository。

## 本機預覽：改 Markdown 就同步

需要 Node.js 22 或更新版本。終端機切換至本資料夾：

```bash
cd /path/to/Jardi/Website
npm ci
npm run dev
```

開啟 http://localhost:4173 。之後編輯並儲存 `content/zh/*.md` 與 `content/en/*.md`，預覽會自動重新建置並刷新。停止預覽按 Ctrl+C。若連接埠被占用，可用 `PORT=4174 npm run dev`。

- `npm run build`：將 Markdown 轉為可部署的 `dist/`。
- `npm run check`：建置並檢查兩種語言的本地連結、圖片、章節錨點、唯一 ID、導覽與搜尋索引。
- `npm test`：以本機模擬接收端驗證表單語言欄位、重複送出防護、失敗保留與重試，不會寄出郵件。
- 不要直接編輯 `dist/`：它是產生的成品，下次建置會覆寫。
- 直接按兩下 HTML 不適合完整預覽：全文搜尋需要 HTTP，請使用上面的預覽指令。

## 內容在哪裡？

| 檔案 | 頁面 |
| --- | --- |
| `content/zh/Index.md` | 首頁介紹 |
| `content/zh/Install.md` | 安裝、權限、初次連線 |
| `content/zh/UserGuide_0.md` | 介面介紹 |
| `content/zh/UserGuide_1.md` | 虛擬定位與清除定位 |
| `content/zh/UserGuide_1-2.md` | 自動位移、沿線、Orbit |
| `content/zh/UserGuide_2.md` | 圖片校準與路線輸出 |
| `content/zh/UserGuide_3.md` | 小鈴鐺與通知 |
| `content/zh/Data.md` | CSV 編輯與備份 |
| `content/zh/Example.md` | 操作練習 |
| `content/zh/FAQ.md` | 疑難排解 |
| `content/zh/About.md` | 關於與資料處理 |
| `content/zh/Problem.md` | 問題回報 |
| `content/zh/Support.md` | 贊助支持 |

每頁用一個 `# 標題`；`##` 會自動成為右側頁內目錄，手機版以可展開目錄呈現。支援標準 Markdown、表格、程式碼區塊、引用、清單與圖片。內部連結直接寫 `[安裝](Install.md)`，建置時會轉成 HTML。圖片可放入 `assets/`，內容引用 `../../assets/檔名.png`。原始 HTML 亦會保留，因此只建置受信任作者的內容。

首頁大標與介紹來自 Index.md 的第一個標題、第一段文字；導覽標籤、描述與頁面排序在 `site.config.json`。首頁導覽入口與共用介面在 `scripts/build.mjs`，配色與響應式版面在 `assets/style.css`，搜尋／模式切換在 `assets/app.js`。

特殊標記由建置器處理：`{{download}}` 產生該版本的下載按鈕或準備中說明，`{{version-status}}`、`{{update-status}}` 產生相應版本資訊。不需手動更改每個頁面的版本號碼。

## GitHub Pages 與 jardi.cc

網站使用獨立 repository：[cotty0311/Jardi-Website](https://github.com/cotty0311/Jardi-Website)。網站內的 App 連結仍指向 `cotty0311/Jardi-LocationTool`。

`.github/workflows/pages.yml` 在 push、pull request 時建置、檢查連結並執行測試，**不會自動部署**。確認 Pages、DNS 與測試完成後，才能從 Actions 手動執行工作流程並勾選 `deploy`；只有 main 分支可部署。

`site.config.json` 的 domain 已設為 `jardi.cc`，建置會產生 `dist/CNAME`。使用 GitHub Actions 部署時，仍必須在 repository 的 Pages 設定登記自訂網域，CNAME 檔本身不會完成綁定。

實際部署順序、DNS 記錄、HTTPS 驗證與目前狀態見 [DEPLOYMENT.md](DEPLOYMENT.md)。

## 版本更新與舊版文件

目前專案準備 1.0.0，尚未發佈。因此 `site.config.json` 將它設為 `preview`，下載網址為 `null`，頁面顯示「準備中」。不會把未發佈版本當作 stable。

### App 正式發佈時

先確認 App 的 Release 與 DMG 下載網址可供公開使用，再執行（以下是正式發佈後的範例）：

```bash
npm run version:release -- 1.0.0 https://github.com/cotty0311/Jardi-LocationTool/releases/download/v1.0.0/Jardi-Location-Tool-1.0.0.dmg
npm run check
```

此指令只處理網站：將目前 content 複製至 `versions/1.0.0/`，保存頁面清單、下載網址並登記為 stable。它不會發佈 App，也不會替你確認遠端安裝包是否存在。commit / push 後，網站預設開啟版本號最新的 stable；下拉選單可切換各版同一篇文章（該版本沒有此頁時回首頁）。

### 開始下一版文件

```bash
npm run version:prepare -- 1.1.0
```

在本 App 專案裡也可以只執行 `npm run version:prepare`，自動讀取上層 `Scripts/Info.plist` 的 `CFBundleShortVersionString`。若網站是獨立 repository，請明確傳入版本號。

新的 preview 使用 `content/`，舊版 stable 使用快照。繼續編輯 content，完成 App 正式發佈後再執行 `version:release`。有 stable 時，首頁仍預設指向最新 stable；預覽新版需從版本選單切換。

**網站不會監看遠端 App 自動升版。每次 App 發佈時跑一次版本指令，再推送網站即可。** 同一 stable 版本不能再執行 release 以免覆蓋快照；若只是修正文檔錯字，直接編輯 `versions/版本號/zh/*.md` 或 `versions/版本號/en/*.md`，check 後推送。正式版快照建立後，只改 content 不會改動 stable 頁面。

## 語言與導覽

繁體中文 Markdown 放在 `content/zh/`，英文放在 `content/en/`，兩者檔名一致。網站路由為 `/版本/zh/頁面.html` 與 `/版本/en/頁面.html`；繁體中文的 HTML lang 仍為 `zh-Hant`，回報表單仍提交 `zh-TW`。舊 `/zh-Hant/` 文件網址會保留章節與查詢參數，轉到 `/zh/`。共用圖片與動畫由建置器複用。共用英文介面位於 `scripts/i18n.mjs`，搜尋與互動訊息在對應資產腳本中維護。

站內文件導覽使用 History API 更新內容，保留原本的 header DOM；返回／前進、語言與版本切換均支援。首次載入或 JavaScript 不可用時，仍可直接開啟每個靜態 HTML 頁面。動畫的獨立頁面、下載與外部連結沿用一般瀏覽器導覽。

## 功能與驗證範圍

提供桌面左右側欄、行動版可展開目錄、本地全文搜尋（⌘K / Ctrl+K）、程式碼複製、淺色／深色／跟隨系統、版本選單與繁體中文／英文切換。頁面正文已預先產生，不需要 JavaScript 才能閱讀；互動搜尋與切換功能需啟用 JavaScript。

`npm run check` 只驗證網站內部連結，不會連接 iPhone、下載 DMG 或保證外部連結與 App 相容性。對外發佈前仍需以正式安裝包核對實際操作步驟。

## 字體與 CSS 維護

全站介面使用 `font/jf-openhuninn-2.1.ttf`（jf-openhuninn），程式碼保留等寬字體。`assets/style.css` 只保留一份 `@font-face`，以 `../font/jf-openhuninn-2.1.ttf` 引用，建置時會複製整個 `font/` 至 `dist/font/`。不要改成 `/font/...`，否則 GitHub Pages repository 子路徑會失效。

樣式已按區塊整理，緊湊行距直接寫在對應規則內，不需在檔案底部再疊加整份覆寫。共用字體與頂部高度由 `:root` 的 `--font-body`、`--font-code`、`--header-height` 控制。新增或更換字體後，`npm run check` 也會檢查 CSS 引用的資源是否存在。預覽程式新增了 font 監看；若還開著舊的預覽程序，請重新啟動 `npm run dev`。

## 在 Markdown 加入圖片

推薦把共用文章圖片放在 `content/images/`（`content/image/` 也支援），接著在 Markdown 寫：

```markdown
![連接 Mac 與 iPhone](image/connect-mac-iphone.png)
```

建置會把圖片複製到對應版本與語言的頁面旁，版本快照也會一起保存圖片。請使用檔案實際名稱，注意英文大小寫；例如範例裡的 `install.png` 只有在你真的建立這個檔案時才可使用。文章圖片會自動縮至內容寬度，保持比例。

共用圖片也可以放在 `assets/images/`，引用方式為 `![說明](../../assets/images/檔名.png)`。Markdown 內的替代文字方便讀者理解圖片，也有助無障礙閱讀。儲存圖片和 Markdown 後，`npm run dev` 會更新預覽；`npm run check` 會檢查是否有找不到的圖片。

## 文件結構、互動示範與影片

使用指南依序為 `UserGuide_0.md`（介面）、`UserGuide_1.md`（虛擬定位）、`UserGuide_1-2.md`（虛擬移動）、`UserGuide_2.md`（圖片工具）、`UserGuide_3.md`（通知）、`Data.md`（資料）。範例使用 `Example.md`；More 包含 FAQ、About、Problem、Support。導覽與搜尋順序由 `site.config.json` 控制。

`content/_Animation/` 會連同子資料夾的 HTML、CSS、JavaScript 和圖片複製到每個文件版本；Markdown 中使用 `../_Animation/動畫名稱/index.html`，iframe 使用 sandbox 隔離、自動配合內容高度與明暗色，原始動畫檔不需改動。示範速度與 Orbit 圓形是教學示意，文件已註明與 App 實作的差別。

圖片工具影片保留原始 MOV 作為素材，網頁載入同名 MP4；本次僅重新封裝 H.264，沒有重壓影片。網站不複製原始 MOV，減少部署體積。MP4 設為手動播放、`preload="none"`，支援全螢幕及下載。本機預覽支援 Range 請求，更新 dev.mjs 後請重啟預覽程序。

## 問題回報表單與隱藏收件信箱

`Problem.md` 的 `{{report-form}}` 會產生對話框表單，包含 Email、主題、類型、Jardi／系統版本和內容。目前 `site.config.json` 的 `feedback.endpoint` 已設定為 `https://formspree.io/f/xyekavza`，使用原生 JavaScript 的 `fetch` AJAX 寄送，不需 React、額外 SDK 或自建後端。若將 endpoint 改回 null，表單只提供複製／下載。

若要真正寄信又不公開收件信箱，需要外部表單接收服務。可在自己的 Formspree 帳戶建立表單、於服務端設定收件信箱，完成驗證後將公開接收網址填入 `feedback.endpoint`（例如服務提供的 `https://formspree.io/f/表單ID`）。不要填入收件 Email、SMTP 密碼或私密 API key。網站採 FormData POST，要求 JSON 回應；接收服務必須支援跨來源請求。設定完成後重新 build，送出按鈕才會開放。

公開 endpoint 是服務的表單識別網址，會出現在前端，但不包含收件信箱；垃圾訊息防護與用量限制需在服務端設定。接收成功只表示服務接受，不能保證已進收件匣。目前已完成網址串接，未送出真實測試郵件；上線後可自行提交一份測試回報，確認 Formspree 後台與收件匣皆收到。

## 隨主題與語言切換的截圖

`block` 與 `open_edit_csv` 的截圖放在 `content/images/screenshot/`，檔名為 `{名稱}-{light|dark}-{zh|en}.png`。在中文或英文 Markdown 引用對應的 light 圖片，例如：

```markdown
![介面介紹](../images/screenshot/block-light-zh.png)
```

建置器會產生 `<picture>`，自動加入同語言的 dark 版本。跟隨系統模式使用瀏覽器的配色偏好；手動選擇淺色／深色時會立即覆寫，站內切頁與語言切換也會重新套用。`npm run check` 會檢查 light 與 dark 資源。

連線插圖與作者圖片使用 `illustration-small`，目前寬度 220px、最大寬度 100%、高度自動。可在 Markdown 中寫 `<img class="illustration-small" src="../images/connect-mac-iphone.png" alt="Mac 與 iPhone 連接">`。
