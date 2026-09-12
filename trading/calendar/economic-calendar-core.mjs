const NY_TZ = 'America/New_York';
const MINUTE = 60_000;

export const ECONOMIC_CALENDAR_POLICY = Object.freeze({
  tierA: Object.freeze(['CPI', 'NFP', 'FOMC']),
  tierB: Object.freeze(['PPI', 'PCE', 'GDP_ADVANCE']),
  preTierAMinutes: 30,
  liveBeforeMinutes: 5,
  liveAfterMinutes: 10,
  postTierAMinutes: 120,
  staleAfterMinutes: 12 * 60,
  researchOnly: true,
  executionAllowed: false
});

const MONTHS = Object.freeze({
  january:1,february:2,march:3,april:4,may:5,june:6,
  july:7,august:8,september:9,october:10,november:11,december:12
});

function normalizeSpace(value='') {
  return value.replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
}

function decodeHtml(value='') {
  return value
    .replace(/&nbsp;|&#160;/gi,' ')
    .replace(/&amp;/gi,'&')
    .replace(/&quot;/gi,'"')
    .replace(/&#39;|&apos;/gi,"'")
    .replace(/&ndash;|&#8211;/gi,'–')
    .replace(/&mdash;|&#8212;/gi,'—')
    .replace(/<[^>]+>/g,' ');
}

function nyParts(ms) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: NY_TZ, year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'
  }).formatToParts(new Date(ms));
  return Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
}

export function newYorkLocalToUtc({year,month,day,hour=0,minute=0,second=0}) {
  const target = Date.UTC(year, month-1, day, hour, minute, second);
  let guess = target;
  for (let i=0;i<4;i+=1) {
    const p = nyParts(guess);
    const rendered = Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);
    const diff = target-rendered;
    guess += diff;
    if (!diff) break;
  }
  return guess;
}

function parseTime12(hourText, minuteText, ampm) {
  let hour = Number(hourText);
  const minute = Number(minuteText || 0);
  const suffix = String(ampm||'').toUpperCase();
  if (suffix==='PM' && hour!==12) hour += 12;
  if (suffix==='AM' && hour===12) hour = 0;
  return {hour,minute};
}

function eventId(source, kind, at) {
  return `${source}:${kind}:${new Date(at).toISOString()}`;
}

function makeEvent({source,kind,name,tier,at,officialUrl,metadata={}}) {
  return {id:eventId(source,kind,at),source,kind,name,tier,at,officialUrl,metadata};
}

export function classifyReleaseName(summary='') {
  const s = normalizeSpace(summary).toLowerCase();
  if (/consumer price index|\bcpi\b/.test(s) && !/producer/.test(s)) return {kind:'CPI',tier:'A'};
  if (/employment situation|nonfarm|non-farm|\bnfp\b/.test(s)) return {kind:'NFP',tier:'A'};
  if (/producer price index|\bppi\b/.test(s)) return {kind:'PPI',tier:'B'};
  if (/personal income and outlays|pce price/.test(s)) return {kind:'PCE',tier:'B'};
  if (/(gdp|gross domestic product).*advance|advance estimate.*(gdp|gross domestic product)/.test(s)) return {kind:'GDP_ADVANCE',tier:'B'};
  if (/(gdp|gross domestic product).*(second|third|updated|revised) estimate|second estimate.*(gdp|gross domestic product)|third estimate.*(gdp|gross domestic product)/.test(s)) return {kind:'GDP_LATER',tier:'C'};
  return null;
}

function unfoldIcs(text='') {
  return text.replace(/\r?\n[ \t]/g,'').split(/\r?\n/);
}

function parseIcsDate(raw, params='') {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?(Z)?$/.exec(raw.trim());
  if (!m) return null;
  const parts={year:+m[1],month:+m[2],day:+m[3],hour:+(m[4]||0),minute:+(m[5]||0),second:+(m[6]||0)};
  if (m[7]) return Date.UTC(parts.year,parts.month-1,parts.day,parts.hour,parts.minute,parts.second);
  if (/TZID=America\/New_York/i.test(params) || !/TZID=/i.test(params)) return newYorkLocalToUtc(parts);
  return null;
}

export function parseBlsIcs(text, officialUrl='https://www.bls.gov/schedule/news_release/bls.ics') {
  const lines=unfoldIcs(text); const events=[]; let current=null;
  for (const line of lines) {
    if (line==='BEGIN:VEVENT') { current={}; continue; }
    if (line==='END:VEVENT') {
      if (current?.summary && current?.dtstart) {
        const cls=classifyReleaseName(current.summary);
        const at=parseIcsDate(current.dtstart,current.dtparams||'');
        if (cls && Number.isFinite(at)) events.push(makeEvent({source:'BLS',kind:cls.kind,name:normalizeSpace(current.summary),tier:cls.tier,at,officialUrl}));
      }
      current=null; continue;
    }
    if (!current) continue;
    const i=line.indexOf(':'); if (i<0) continue;
    const left=line.slice(0,i),value=line.slice(i+1); const [key,...params]=left.split(';');
    if (key==='SUMMARY') current.summary=value.replace(/\\,/g,',').replace(/\\n/g,' ');
    if (key==='DTSTART') { current.dtstart=value; current.dtparams=params.join(';'); }
  }
  return events;
}

function extractYearSections(text) {
  const out=[];
  const yearRe=/(20\d{2})\s+FOMC\s+Meetings/gi;
  const marks=[]; let m;
  while ((m=yearRe.exec(text))) marks.push({year:Number(m[1]),index:m.index,end:yearRe.lastIndex});
  for (let i=0;i<marks.length;i+=1) out.push({year:marks[i].year,text:text.slice(marks[i].end,marks[i+1]?.index ?? text.length)});
  return out;
}

export function parseFedFomcHtml(html, officialUrl='https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm') {
  const text=normalizeSpace(decodeHtml(html)); const events=[];
  for (const section of extractYearSections(text)) {
    const re=/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:\s*[–-]\s*(\d{1,2}))?\*?/gi;
    let m;
    while ((m=re.exec(section.text))) {
      const month=MONTHS[m[1].toLowerCase()]; const day=Number(m[3]||m[2]);
      if (!month || !day) continue;
      const at=newYorkLocalToUtc({year:section.year,month,day,hour:14,minute:0});
      events.push(makeEvent({source:'FED',kind:'FOMC',name:'FOMC policy decision',tier:'A',at,officialUrl,metadata:{meetingStartDay:Number(m[2]),meetingEndDay:day,timeBasis:'standard statement time 14:00 ET'}}));
    }
  }
  return events;
}

function extractBeaRows(html) {
  const rows=[...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(m=>normalizeSpace(decodeHtml(m[1]))).filter(Boolean);
  if (rows.length) return rows;
  return String(html).split(/\r?\n/).map(normalizeSpace).filter(Boolean);
}

export function parseBeaHtml(html, year, officialUrl='https://www.bea.gov/news/schedule/full') {
  const events=[];
  for (const row of extractBeaRows(html)) {
    const m=/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\s+(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s+(.+)/i.exec(row);
    if (!m) continue;
    const month=MONTHS[m[1].toLowerCase()],day=Number(m[2]); const {hour,minute}=parseTime12(m[3],m[4],m[5]);
    const title=normalizeSpace(m[6]).replace(/^(?:N\s*ews|News|D\s*ata|Data|A\s*rticle|Article)\s+/i,'');
    const cls=classifyReleaseName(title); if (!cls) continue;
    const at=newYorkLocalToUtc({year,month,day,hour,minute});
    events.push(makeEvent({source:'BEA',kind:cls.kind,name:title,tier:cls.tier,at,officialUrl}));
  }
  return events;
}

export function dedupeEvents(events=[]) {
  const byKey=new Map();
  for (const e of events) {
    if (!e || !Number.isFinite(e.at) || !e.kind) continue;
    const key=`${e.kind}:${e.at}`;
    const prev=byKey.get(key);
    if (!prev || (prev.source!=='BLS' && e.source==='BLS')) byKey.set(key,e);
  }
  return [...byKey.values()].sort((a,b)=>a.at-b.at || a.kind.localeCompare(b.kind));
}

export function freshnessStatus({fetchedAt, now=Date.now(), sourceErrors=[]}={}) {
  if (!Number.isFinite(fetchedAt)) return 'ERROR';
  if (now-fetchedAt > ECONOMIC_CALENDAR_POLICY.staleAfterMinutes*MINUTE) return 'STALE';
  return sourceErrors.length ? 'PARTIAL' : 'FRESH';
}

export function classifyCalendarRisk({events=[], now=Date.now(), fetchedAt=now, sourceErrors=[]}={}) {
  const calendarStatus=freshnessStatus({fetchedAt,now,sourceErrors});
  if (calendarStatus==='ERROR' || calendarStatus==='STALE') return {
    calendarStatus,state:'CALENDAR_STALE',tier:null,event:null,minutesToEvent:null,minutesSinceEvent:null,
    analyticalAllowed:true,newPlanAllowed:true,autoExecutionAllowed:false,researchAdmission:'CAUTION',
    reason:'Economic calendar is stale or unavailable; do not assume the market is news-safe.'
  };
  const clean=dedupeEvents(events); let nearestFuture=null,nearestPast=null;
  for (const e of clean) {
    if (e.at>=now && (!nearestFuture || e.at<nearestFuture.at)) nearestFuture=e;
    if (e.at<=now && (!nearestPast || e.at>nearestPast.at)) nearestPast=e;
  }
  const futureMin=nearestFuture ? (nearestFuture.at-now)/MINUTE : Infinity;
  const pastMin=nearestPast ? (now-nearestPast.at)/MINUTE : Infinity;
  const liveCandidates=clean.filter(e=>e.tier==='A' && now>=e.at-ECONOMIC_CALENDAR_POLICY.liveBeforeMinutes*MINUTE && now<=e.at+ECONOMIC_CALENDAR_POLICY.liveAfterMinutes*MINUTE);
  if (liveCandidates.length) {
    const event=liveCandidates.sort((a,b)=>Math.abs(a.at-now)-Math.abs(b.at-now))[0];
    return {calendarStatus,state:'EVENT_LIVE',tier:'A',event,minutesToEvent:(event.at-now)/MINUTE,minutesSinceEvent:(now-event.at)/MINUTE,
      analyticalAllowed:true,newPlanAllowed:true,autoExecutionAllowed:false,researchAdmission:'BLOCK_CANDIDATE',
      reason:'Tier A release window: extreme 5m range/volume and intrabar ambiguity observed in MNQ history.'};
  }
  const postA=clean.filter(e=>e.tier==='A' && now>e.at && now<=e.at+ECONOMIC_CALENDAR_POLICY.postTierAMinutes*MINUTE).sort((a,b)=>b.at-a.at)[0];
  if (postA) return {calendarStatus,state:'POST_A_RISK',tier:'A',event:postA,minutesToEvent:null,minutesSinceEvent:(now-postA.at)/MINUTE,
    analyticalAllowed:true,newPlanAllowed:true,autoExecutionAllowed:false,researchAdmission:'BLOCK_CANDIDATE',
    reason:'New MNQ plans opened within 120 minutes after Tier A underperformed in the long-history diagnostic.'};
  const soonA=clean.filter(e=>e.tier==='A' && e.at>now && e.at<=now+ECONOMIC_CALENDAR_POLICY.preTierAMinutes*MINUTE).sort((a,b)=>a.at-b.at)[0];
  if (soonA) return {calendarStatus,state:'EVENT_SOON',tier:'A',event:soonA,minutesToEvent:(soonA.at-now)/MINUTE,minutesSinceEvent:null,
    analyticalAllowed:true,newPlanAllowed:true,autoExecutionAllowed:false,researchAdmission:'CAUTION',
    reason:'Tier A event within 30 minutes. Historical data does not justify auto-closing active plans, but execution risk is elevated.'};
  const nearB=clean.filter(e=>e.tier==='B' && Math.abs(e.at-now)<=30*MINUTE).sort((a,b)=>Math.abs(a.at-now)-Math.abs(b.at-now))[0];
  if (nearB) return {calendarStatus,state:'EVENT_CONTEXT',tier:'B',event:nearB,minutesToEvent:(nearB.at-now)/MINUTE,minutesSinceEvent:(now-nearB.at)/MINUTE,
    analyticalAllowed:true,newPlanAllowed:true,autoExecutionAllowed:false,researchAdmission:'ALLOW',
    reason:'Tier B event is contextual only; the long-history test did not support a hard cooldown.'};
  if (calendarStatus==='PARTIAL') return {calendarStatus,state:'CALENDAR_PARTIAL',tier:null,event:nearestFuture,minutesToEvent:Number.isFinite(futureMin)?futureMin:null,minutesSinceEvent:Number.isFinite(pastMin)?pastMin:null,
    analyticalAllowed:true,newPlanAllowed:true,autoExecutionAllowed:false,researchAdmission:'CAUTION',
    reason:'At least one official calendar source is unavailable; known events remain visible but absence of news is not verified.'};
  return {calendarStatus,state:'CLEAR',tier:null,event:nearestFuture,minutesToEvent:Number.isFinite(futureMin)?futureMin:null,minutesSinceEvent:Number.isFinite(pastMin)?pastMin:null,
    analyticalAllowed:true,newPlanAllowed:true,autoExecutionAllowed:false,researchAdmission:'ALLOW',reason:'No tested Tier A risk window is active.'};
}
