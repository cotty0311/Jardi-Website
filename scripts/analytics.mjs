import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export function analyticsConfig(config, env=process.env) {
 const settings=config.analytics || {};
 const cloudflareToken=(env.JARDI_CLOUDFLARE_TOKEN?.trim() || settings.cloudflareToken || '').trim();
 const ga4MeasurementId=(env.JARDI_GA4_MEASUREMENT_ID?.trim() || settings.ga4MeasurementId || '').trim();
 const historyDisabled=!env.JARDI_GA4_HISTORY_TRACKING_DISABLED
  ? settings.ga4HistoryTrackingDisabled === true : env.JARDI_GA4_HISTORY_TRACKING_DISABLED === 'true';
 if(cloudflareToken && !/^[a-f0-9]{32}$/i.test(cloudflareToken))throw Error('analytics.cloudflareToken must be the 32-character Web Analytics site token, not a Cloudflare API token.');
 if(ga4MeasurementId && !/^G-[A-Z0-9]{6,20}$/.test(ga4MeasurementId))throw Error('analytics.ga4MeasurementId must be a real GA4 Measurement ID starting with G-.');
 if(ga4MeasurementId && !historyDisabled)throw Error('Disable GA4 Enhanced Measurement → Page views → Page changes based on browser history events, then set analytics.ga4HistoryTrackingDisabled=true. This prevents duplicate page views.');
 return {cloudflareToken,ga4MeasurementId,hostname:config.domain || ''};
}

export function installAnalytics(root, out, settings) {
 if(!settings.cloudflareToken && !settings.ga4MeasurementId)return;
 const revision=createHash('sha256').update(fs.readFileSync(path.join(root,'assets/analytics.js'))).digest('hex').slice(0,12);
 const json=JSON.stringify(settings).replace(/</g,'\\u003c');
 const snippet=`<script id="jardi-analytics-config" type="application/json">${json}</script><script defer src="/assets/analytics.js?v=${revision}"></script>`;
 const visit=folder=>{
  for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
   const file=path.join(folder,entry.name);
   if(entry.isDirectory())visit(file);
   else if(entry.name.endsWith('.html')){
    const html=fs.readFileSync(file,'utf8');
    // Redirects are not content views. Embedded demos are filtered at runtime.
    if(/http-equiv=["']refresh["']/i.test(html))continue;
    fs.writeFileSync(file,html.replace(/<head\b[^>]*>/i,head=>head+snippet));
   }
  }
 };
 visit(out);
}
