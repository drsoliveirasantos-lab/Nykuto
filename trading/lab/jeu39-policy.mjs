export const JEU39_POLICY=Object.freeze({id:'jeu39-model-hours-v1',symbol:'MNQ',lastEntryMinuteExclusive:660,targetR:2,maximumRiskUSD:100,dailyLossUSD:200,forecastBars:4,lookbackBars:64,forecastIntervalSeconds:900,independent:false,executionAllowed:false});
export const JEU39_VARIANTS=Object.freeze([
 {id:'baseline',label:'Référence · risque 100 $'},
 {id:'mnq-before-11',label:'Nasdaq · nouvelles entrées avant 11 h NY'},
 {id:'mnq-kronos',label:'Nasdaq · veto directionnel Kronos-mini'}
].map(Object.freeze));
export const JEU39_MODEL=Object.freeze({model:'NeoQuasar/Kronos-mini',modelRevision:'f4e68697d9d5aed55cef5c96aabc3376bcad9f81',tokenizerRevision:'26966d0035065a0cae0ebad7af8ece35bc1fb51c',codeRevision:'67b630e67f6a18c9e9be918d9b4337c960db1e9a',seed:42,temperature:1,topP:0.9,sampleCount:1});
