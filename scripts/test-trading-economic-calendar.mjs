import test from 'node:test';
import assert from 'node:assert/strict';
import {ECONOMIC_CALENDAR_POLICY,newYorkLocalToUtc,parseBlsIcs,parseFedFomcHtml,parseBeaHtml,dedupeEvents,classifyCalendarRisk} from '../trading/calendar/economic-calendar-core.mjs';
import {currentCalendarRisk} from '../trading/assist/vision.mjs';

const iso=ms=>new Date(ms).toISOString();

test('calendar policy remains research-only and cannot silently enable execution',()=>{
  assert.equal(ECONOMIC_CALENDAR_POLICY.researchOnly,true);
  assert.equal(ECONOMIC_CALENDAR_POLICY.executionAllowed,false);
  assert.equal(ECONOMIC_CALENDAR_POLICY.postTierAMinutes,120);
});

test('New York local conversion follows EST and EDT instead of a fixed UTC offset',()=>{
  assert.equal(iso(newYorkLocalToUtc({year:2026,month:1,day:13,hour:8,minute:30})),'2026-01-13T13:30:00.000Z');
  assert.equal(iso(newYorkLocalToUtc({year:2026,month:7,day:14,hour:8,minute:30})),'2026-07-14T12:30:00.000Z');
});

test('BLS iCalendar keeps CPI, Employment Situation and PPI with causal official times',()=>{
  const ics=`BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART;TZID=America/New_York:20260714T083000\nSUMMARY:Consumer Price Index for June 2026\nEND:VEVENT\nBEGIN:VEVENT\nDTSTART;TZID=America/New_York:20260702T083000\nSUMMARY:Employment Situation for June 2026\nEND:VEVENT\nBEGIN:VEVENT\nDTSTART;TZID=America/New_York:20260715T083000\nSUMMARY:Producer Price Index for June 2026\nEND:VEVENT\nEND:VCALENDAR`;
  const events=parseBlsIcs(ics);
  assert.deepEqual(events.map(e=>[e.kind,e.tier]),[['CPI','A'],['NFP','A'],['PPI','B']]);
  assert.equal(iso(events[0].at),'2026-07-14T12:30:00.000Z');
});

test('Fed calendar maps the policy decision to the second meeting day at 14:00 ET',()=>{
  const html='<h4>2026 FOMC Meetings</h4><div>September</div><div>15-16*</div><div>October</div><div>27-28</div><h4>2027 FOMC Meetings</h4><div>January</div><div>26-27</div>';
  const events=parseFedFomcHtml(html);
  assert.equal(events.length,3);
  assert.equal(iso(events[0].at),'2026-09-16T18:00:00.000Z');
  assert.equal(events[0].kind,'FOMC');assert.equal(events[0].tier,'A');
});

test('BEA schedule keeps PCE and GDP advance while later GDP estimates remain lower tier',()=>{
  const html=`<table><tr><td>July 30 8:30 AM</td><td>News</td><td>GDP (Advance Estimate), 2nd Quarter 2026</td></tr><tr><td>July 30 8:30 AM</td><td>News</td><td>Personal Income and Outlays, June 2026</td></tr><tr><td>August 26 8:30 AM</td><td>News</td><td>GDP (Second Estimate) and Corporate Profits, 2nd Quarter 2026</td></tr></table>`;
  const events=parseBeaHtml(html,2026);
  assert.deepEqual(events.map(e=>[e.kind,e.tier]),[['GDP_ADVANCE','B'],['PCE','B'],['GDP_LATER','C']]);
  assert.equal(iso(events[0].at),'2026-07-30T12:30:00.000Z');
});

test('deduplication keeps one event per type/time and prefers BLS for duplicate releases',()=>{
  const at=Date.parse('2026-07-14T12:30:00Z');
  const input=[{kind:'CPI',tier:'A',at,source:'ALT',name:'CPI',id:'a'},{kind:'CPI',tier:'A',at,source:'BLS',name:'Consumer Price Index',id:'b'}];
  assert.equal(dedupeEvents(input)[0].source,'BLS');
});

test('Tier A states separate warning, live execution risk and post-event research caution',()=>{
  const at=Date.parse('2026-07-14T12:30:00Z'),events=[{kind:'CPI',tier:'A',at,source:'BLS',name:'CPI'}];
  let risk=classifyCalendarRisk({events,now:at-20*60000,fetchedAt:at-60*60000});
  assert.equal(risk.state,'EVENT_SOON');assert.equal(risk.researchAdmission,'CAUTION');assert.equal(risk.newPlanAllowed,true);
  risk=classifyCalendarRisk({events,now:at+5*60000,fetchedAt:at-60*60000});
  assert.equal(risk.state,'EVENT_LIVE');assert.equal(risk.autoExecutionAllowed,false);assert.equal(risk.analyticalAllowed,true);
  risk=classifyCalendarRisk({events,now:at+90*60000,fetchedAt:at-60*60000});
  assert.equal(risk.state,'POST_A_RISK');assert.equal(risk.researchAdmission,'BLOCK_CANDIDATE');
  risk=classifyCalendarRisk({events,now:at+121*60000,fetchedAt:at-60*60000});
  assert.equal(risk.state,'CLEAR');
});

test('Tier B stays contextual and stale calendars fail safe without pretending the market is clear',()=>{
  const at=Date.parse('2026-07-15T12:30:00Z'),events=[{kind:'PPI',tier:'B',at,source:'BLS',name:'PPI'}];
  let risk=classifyCalendarRisk({events,now:at+10*60000,fetchedAt:at-60*60000});
  assert.equal(risk.state,'EVENT_CONTEXT');assert.equal(risk.researchAdmission,'ALLOW');
  risk=classifyCalendarRisk({events,now:at+10*60000,fetchedAt:at-13*3600000});
  assert.equal(risk.state,'CALENDAR_STALE');assert.equal(risk.autoExecutionAllowed,false);
});

test('partial official sources never become a false CLEAR state',()=>{
  const now=Date.parse('2026-07-14T14:00:00Z');
  const risk=classifyCalendarRisk({events:[],now,fetchedAt:now,sourceErrors:['BLS unavailable']});
  assert.equal(risk.calendarStatus,'PARTIAL');
  assert.equal(risk.state,'CALENDAR_PARTIAL');
  assert.equal(risk.researchAdmission,'CAUTION');
});

test('Nykuto analysis-side calendar loader detects a live CPI window from official-source fixtures',async()=>{
  const now=Date.parse('2026-07-14T12:25:00Z');
  const bls=`BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART;TZID=America/New_York:20260714T083000\nSUMMARY:Consumer Price Index for June 2026\nEND:VEVENT\nEND:VCALENDAR`;
  const fed='<h4>2026 FOMC Meetings</h4><div>September 15-16</div>';
  const bea='<table><tr><td>July 30 8:30 AM</td><td>News</td><td>Personal Income and Outlays, June 2026</td></tr></table>';
  const fetcher=async url=>{
    if(String(url).includes('bls.gov'))return new Response(bls,{status:200});
    if(String(url).includes('federalreserve.gov'))return new Response(fed,{status:200});
    if(String(url).includes('bea.gov'))return new Response(bea,{status:200});
    throw new Error('Unexpected URL');
  };
  const risk=await currentCalendarRisk(now,fetcher);
  assert.equal(risk.state,'EVENT_LIVE');
  assert.equal(risk.event.kind,'CPI');
  assert.equal(risk.researchAdmission,'BLOCK_CANDIDATE');
  assert.equal(risk.autoExecutionAllowed,false);
});
