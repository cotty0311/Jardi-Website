import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { reportForm } from '../scripts/components.mjs';
const script=fs.readFileSync(new URL('../assets/report.js',import.meta.url),'utf8');

// No external requests: exercise the real submit handler against a fake receiver.
for(const [locale,language] of [['zh-Hant','zh-TW'],['en','en']]) {
 test(`feedback payload and retry lifecycle (${locale})`,async()=>{
  const html=reportForm({feedback:{endpoint:'https://formspree.io/f/xyekavza'}},'1.0.0',locale);
  assert.match(html,new RegExp(`type="hidden" name="language" value="${language}"`));
  assert.ok(!html.includes('name="consent"'));
  assert.ok(!html.includes('回報將透過'));
  const fields={language,email:'test@example.com',category:'Documentation',subject:'Local test',version:'1.0.0',system:'macOS',message:'Example report content'};
  const nodes=new Map();
  for(const id of ['report-dialog','report-form','report-status','report-submit','report-open','report-close','report-copy','report-download']){
   nodes.set('#'+id,{handlers:{},addEventListener(event,fn){this.handlers[event]=fn},dataset:{},textContent:'',disabled:false});
  }
  const form=nodes.get('#report-form'),button=nodes.get('#report-submit'),status=nodes.get('#report-status');
  form.dataset.endpoint='https://formspree.io/f/xyekavza';
  let resets=0,requests=[],resolveRequest;
  form.reportValidity=()=>true;form.reset=()=>resets++;
  class MockFormData extends FormData{constructor(){super();for(const [key,value] of Object.entries(fields))this.set(key,value)}}
  const events={};
  const context=vm.createContext({document:{documentElement:{lang:locale},querySelector:s=>nodes.get(s),addEventListener:(name,fn)=>events[name]=fn},FormData:MockFormData,AbortController,setTimeout,clearTimeout,fetch:(url,options)=>{requests.push({url,options});return new Promise(resolve=>resolveRequest=resolve)}});
  vm.runInContext(script,context);
  const submit=()=>form.handlers.submit({preventDefault(){}});
  const first=submit();assert.equal(button.disabled,true);
  await submit();assert.equal(requests.length,1,'Prevent duplicate requests');
  assert.equal(requests[0].options.body.get('language'),language);
  assert.equal(requests[0].options.body.get('message'),fields.message);
  assert.equal(requests[0].options.headers.Accept,'application/json');
  resolveRequest({ok:false});await first;
  assert.equal(resets,0,'Preserve report after failure');assert.equal(button.disabled,false);
  const retry=submit();resolveRequest({ok:true});await retry;
  assert.equal(resets,1);assert.equal(button.disabled,false);
  assert.match(status.textContent,locale==='en'?/received/:/已收到/);
  // Pages without a form are safe, and returning to the form initializes it.
  const query=context.document.querySelector;context.document.querySelector=()=>null;
  events['jardi:navigate']();context.document.querySelector=query;events['jardi:navigate']();
  assert.equal(typeof form.handlers.submit,'function');
 });
}
