const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function reportForm(config, version, pageLanguage = '') {
 const locale = new Intl.Locale(pageLanguage || 'en').maximize();
 const language = locale.language === 'zh' && locale.script === 'Hant' ? 'zh-TW' : 'en';
 const endpoint=config.feedback?.endpoint || '';
 if(endpoint && (!/^https:\/\//.test(endpoint) || new URL(endpoint).username || new URL(endpoint).password)) throw Error('feedback.endpoint 必須是公開 HTTPS 表單接收網址，不可包含信箱密碼或私密金鑰。');
 return `<div class="report-entry"><button type="button" class="button" id="report-open">✎ 填寫問題回報</button></div>
<dialog id="report-dialog" aria-labelledby="report-title"><div class="search-heading"><h2 id="report-title">問題回報</h2><button type="button" id="report-close" aria-label="關閉問題回報">✕</button></div>
<form id="report-form" data-endpoint="${escapeHTML(endpoint)}">
<input type="hidden" name="language" value="${language}">
<div class="report-grid"><label>聯絡 Email <input name="email" type="email" autocomplete="email" maxlength="254" required placeholder="you@example.com"></label><label>問題類型 <select name="category" required><option value="">請選擇</option>連線與安裝</option><option>定位與移動</option><option>圖片座標工具</option><option>通知</option><option>文件問題</option><option>功能建議／其他</option></select></label></div>
<label>主題 <input name="subject" maxlength="120" required placeholder="簡短描述遇到的問題"></label>
<div class="report-grid"><label>Jardi 版本 <input name="version" maxlength="40" value="${escapeHTML(version)}" required></label><label>macOS / iOS 版本 <input name="system" maxlength="120" placeholder="例如 macOS 14 / iOS 17"></label></div>
<label>內容 <textarea name="message" rows="7" minlength="10" maxlength="8000" required placeholder="操作步驟：&#10;預期結果：&#10;實際結果／錯誤訊息：&#10;已嘗試的處理方式："></textarea></label>

<p id="report-status" role="status">${endpoint ? '送出前請確認內容，不要填寫密碼、私人座標或裝置識別碼。' : '尚未設定接收服務；複製與下載只在你的瀏覽器內處理，不會寄送。'}</p>
<div class="report-actions"><button type="button" id="report-copy">複製內容</button><button type="button" id="report-download">下載文字檔</button><button type="submit" class="button" id="report-submit" ${endpoint?'':'disabled'}>${endpoint?'送出回報':'寄送尚未開放'}</button></div>
</form></dialog>`;
}
