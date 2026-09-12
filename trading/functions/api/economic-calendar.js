import {parseBlsIcs,parseFedFomcHtml,parseBeaHtml,dedupeEvents,classifyCalendarRisk} from '../../../calendar/economic-calendar-core.mjs';

const SOURCES=Object.freeze({
  BLS:'https://www.bls.gov/schedule/news_release/bls.ics',
  FED:'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
  BEA:'https://www.bea.gov/news/schedule/full'
});

function json(body,status=200){
  return new Response(JSON.stringify(body),{status,headers:{
    'content-type':'application/json; charset=utf-8',
    'cache-control':'public, max-age=300, s-maxage=900',
    'x-content-type-options':'nosniff'
  }});
}

async function text(url){
  const response=await fetch(url,{headers:{
    accept:'text/html,text/calendar,text/plain;q=0.9,*/*;q=0.5',
    'user-agent':'NykutoTradingCalendar/1.0'
  }});
  if(!response.ok)throw Error(`${new URL(url).hostname} ${response.status}`);
  return response.text();
}

export async function loadEconomicCalendar(now=Date.now()){
  const year=Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric'}).format(new Date(now)));
  const requests={BLS:text(SOURCES.BLS),FED:text(SOURCES.FED),BEA:text(SOURCES.BEA)};
  const entries=await Promise.all(Object.entries(requests).map(async([name,promise])=>{
    try{return [name,{ok:true,text:await promise}];}
    catch(error){return [name,{ok:false,error:error instanceof Error?error.message:String(error)}];}
  }));
  const result=Object.fromEntries(entries);
  const sourceErrors=entries.filter(([,value])=>!value.ok).map(([name,value])=>`${name}: ${value.error}`);
  const events=[];
  if(result.BLS.ok)events.push(...parseBlsIcs(result.BLS.text,SOURCES.BLS));
  if(result.FED.ok)events.push(...parseFedFomcHtml(result.FED.text,SOURCES.FED));
  if(result.BEA.ok)events.push(...parseBeaHtml(result.BEA.text,year,SOURCES.BEA));
  return {
    fetchedAt:now,
    sourceErrors,
    sources:Object.fromEntries(entries.map(([name,value])=>[name,{ok:value.ok,url:SOURCES[name]}])),
    events:dedupeEvents(events)
  };
}

export async function onRequestGet(){
  const now=Date.now();
  try{
    const calendar=await loadEconomicCalendar(now);
    const risk=classifyCalendarRisk({...calendar,now});
    const horizon=calendar.events.filter(event=>event.at>=now-24*3600000&&event.at<=now+120*86400000);
    return json({schema:1,timeZone:'America/New_York',researchOnly:true,ordersEnabled:false,...calendar,events:horizon,risk});
  }catch(error){
    return json({
      schema:1,researchOnly:true,ordersEnabled:false,fetchedAt:now,events:[],
      risk:classifyCalendarRisk({events:[],now,fetchedAt:NaN,sourceErrors:[String(error)]}),
      error:error instanceof Error?error.message:'Economic calendar unavailable'
    },502);
  }
}
