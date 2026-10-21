function initReport(){
const reportDialog=document.querySelector('#report-dialog');
const reportForm=document.querySelector('#report-form');
if(!reportForm)return;
const t=(zh,en)=>document.documentElement.lang==='en'?en:zh;
const reportStatus=document.querySelector('#report-status');
const submitButton=document.querySelector('#report-submit');
let sending=false;
document.querySelector('#report-open').addEventListener('click',()=>reportDialog.showModal());
document.querySelector('#report-close').addEventListener('click',()=>reportDialog.close());
function reportText(){
 const data=new FormData(reportForm);
 return [t('Jardi 問題回報','Jardi feedback'),`${t('聯絡 Email','Contact email')}: ${data.get('email')}`,`${t('主題','Subject')}: ${data.get('subject')}`,`${t('類型','Category')}: ${data.get('category')}`,`${t('Jardi 版本','Jardi version')}: ${data.get('version')}`,`${t('系統版本','System version')}: ${data.get('system')}`,'',data.get('message')].join('\n');
}
document.querySelector('#report-copy').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(reportText());reportStatus.textContent=t('已複製回報內容，尚未寄送。','Report copied. It has not been sent.')}
 catch{reportStatus.textContent=t('無法使用剪貼簿，請下載文字檔或手動複製。','Clipboard unavailable. Download the text or copy it manually.')}
});
document.querySelector('#report-download').addEventListener('click',()=>{
 const url=URL.createObjectURL(new Blob([reportText()],{type:'text/plain;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='jardi-report.txt';link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);reportStatus.textContent=t('已準備下載回報文字檔，尚未寄送。','Report text is ready to download. It has not been sent.');
});
reportForm.addEventListener('submit',async event=>{
 event.preventDefault();
 const endpoint=reportForm.dataset.endpoint;
 if(!endpoint || sending || !reportForm.reportValidity())return;
 sending=true;submitButton.disabled=true;submitButton.textContent=t('寄送中…','Sending…');reportStatus.textContent=t('正在傳送回報，請稍候。','Sending your report. Please wait.');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch(endpoint,{method:'POST',body:new FormData(reportForm),headers:{Accept:'application/json'},signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error('rejected');
  // A successful provider response confirms receipt, not inbox delivery.
  reportStatus.textContent=t('接收服務已收到回報，謝謝你！','The service received your report. Thank you!');reportForm.reset();
 }catch{
  reportStatus.textContent=t('尚未確認寄送成功。請稍後再試；已填內容會保留，也可先複製或下載。','Delivery could not be confirmed. Try again later; your text is preserved and can be copied or downloaded.');
 }finally{clearTimeout(timer);sending=false;submitButton.disabled=false;submitButton.textContent=t('送出回報','Send report');}
});

}
initReport();
document.addEventListener("jardi:navigate",initReport);
