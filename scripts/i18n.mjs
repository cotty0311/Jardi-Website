// Shared shell and form labels. Article translations live in content/en.
export const english = {
 '下載安裝':'Installation and setup','開始探索':'Getting started','使用指南':'User Guide','範例練習':'Practice examples',
 '歡迎來到 Jardi':'Welcome to Jardi','安裝與初次設定':'Installation and setup','介面介紹':'Interface overview','虛擬定位':'Virtual location','虛擬移動':'Virtual movement','圖片座標工具':'Image coordinate tool','通知與鈴鐺':'Notifications and the bell','地點、路徑與備份':'Places, routes, and backups','常見問題':'Frequently asked questions','關於 Jardi':'About Jardi','回報問題':'Report a problem','贊助支持':'Support Jardi',
 '跳到主要內容':'Skip to content','主要導覽':'Main navigation','Jardi 文件版本':'Jardi documentation version','搜尋文件':'Search documentation','切換色彩模式':'Change color mode','文件語言':'Documentation language','文件目錄':'Documentation navigation','本頁目錄':'On this page','在這一頁':'On this page','接著閱讀 →':'Read next →','← 上一頁':'← Previous','協助改善這一頁 ↗':'Help improve this page ↗','文件':'Documentation','開始使用':'Get started','閱讀使用指南 →':'Read the user guide →','粉色花朵與蝴蝶翅膀的 Jardi 花園插畫':'Jardi garden illustration with pink flowers and butterfly wings','USB 連接 iPhone':'USB connection to iPhone','繁體中文指南':'English guide','準備中':'Preview',
 'FAQ · 常見問題':'FAQ','About us · 關於':'About us','Problem · 回報問題':'Report a problem','Support · 贊助支持':'Support us',
 '搜尋 Jardi 指南':'Search the Jardi guide','關閉搜尋':'Close search','搜尋關鍵字':'Search keywords','搜尋定位、安裝、Orbit…':'Search location, setup, Orbit…','輸入關鍵字，搜尋目前版本的文件。':'Enter keywords to search this version of the guide.','目前版本':'Version','Esc 關閉':'Esc to close','搜尋':'Search',
 '✎ 填寫問題回報':'✎ Write a report','關閉問題回報':'Close report','問題回報':'Feedback form','聯絡 Email':'Contact email','問題類型':'Category','請選擇':'Choose a category','連線與安裝':'Connection and installation','定位與移動':'Location and movement','通知':'Notifications','文件問題':'Documentation issue','功能建議／其他':'Feature suggestion / other','主題':'Subject','簡短描述遇到的問題':'Briefly describe the problem','Jardi 版本':'Jardi version','macOS / iOS 版本':'macOS / iOS version','例如 macOS 14 / iOS 17':'For example, macOS 14 / iOS 17','內容':'Message','操作步驟：':'Steps to reproduce:','預期結果：':'Expected result:','實際結果／錯誤訊息：':'Actual result / error:','已嘗試的處理方式：':'What you have tried:',
 '送出前請確認內容，不要填寫密碼、私人座標或裝置識別碼。':'Review your report before sending. Do not include passwords, private coordinates, or device identifiers.','複製內容':'Copy report','下載文字檔':'Download text','送出回報':'Send report','寄送尚未開放':'Sending unavailable','尚未設定接收服務；複製與下載只在你的瀏覽器內處理，不會寄送。':'Sending is not configured. Copy and download work locally in your browser.'
};
export function translate(text) {
 // A single pass avoids translating parts of already-translated phrases.
 const keys=Object.keys(english).sort((a,b)=>b.length-a.length);
 return text.replace(new RegExp(keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g'),match=>english[match]);
}
