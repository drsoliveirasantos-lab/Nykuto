import { chartMarkers } from './chart-indicators.mjs';

// Rendering has no influence on the selection or the descriptive calculations.
export function createAnalysisChart(library, hosts, formatters) {
  const options={
    layout:{background:{type:'solid',color:'#07111f'},textColor:'#c7d9e8',fontSize:11},
    grid:{vertLines:{color:'#17283c'},horzLines:{color:'#17283c'}},
    rightPriceScale:{borderColor:'#263d56',minimumWidth:76},
    timeScale:{timeVisible:true,secondsVisible:false,borderColor:'#263d56',tickMarkFormatter:formatters.tick},
    localization:{locale:'fr-FR',timeFormatter:formatters.stamp}
  };
  const main=library.createChart(hosts.price,{...options,width:hosts.price.clientWidth,height:hosts.price.clientHeight});
  let oscillator=null, rsi=null, lines=[], lastSelection=null;
  const candles=main.addCandlestickSeries({upColor:'#34dfbc',downColor:'#fb8b9e',borderVisible:false,wickUpColor:'#34dfbc',wickDownColor:'#fb8b9e',priceFormat:{type:'price',precision:2,minMove:0.25}});
  const line=(color,extra={})=>main.addLineSeries({color,lineWidth:1,priceLineVisible:false,lastValueVisible:false,crosshairMarkerVisible:false,...extra});
  const overlays={ema9:line('#f0c078'),ema21:line('#81bfff'),middle:line('#c4a3ff',{lineStyle:2}),upper:line('#9470bf'),lower:line('#9470bf')};
  const volume=main.addHistogramSeries({priceFormat:{type:'volume'},priceScaleId:'volume',priceLineVisible:false,lastValueVisible:false,visible:false});
  volume.priceScale().applyOptions({scaleMargins:{top:.82,bottom:0}});
  function syncRange(range) { if(range&&oscillator) oscillator.timeScale().setVisibleLogicalRange(range); }
  main.timeScale().subscribeVisibleLogicalRangeChange(syncRange);
  function resize() {
    main.resize(hosts.price.clientWidth,hosts.price.clientHeight);
    if(oscillator&&!hosts.rsiPanel.hidden) oscillator.resize(hosts.rsi.clientWidth,hosts.rsi.clientHeight);
    syncRange(main.timeScale().getVisibleLogicalRange());
  }
  function draw(selected,result,indicators,interval,layers,selectionKey) {
    const changed=selectionKey!==lastSelection;
    if(changed) candles.setData(selected.map(({time,open,high,low,close})=>({time,open,high,low,close})));
    candles.setMarkers(chartMarkers(selected,result,interval,layers));
    for(const [key,overlay] of Object.entries(overlays)) {
      if(changed) overlay.setData(indicators[key]);
      overlay.applyOptions({visible:key.startsWith('ema')?layers.ema:layers.bands});
    }
    if(changed) volume.setData(indicators.volume);
    volume.applyOptions({visible:layers.volume});
    candles.priceScale().applyOptions({scaleMargins:{top:.12,bottom:layers.volume ? .22 : .1}});
    lines.forEach(l=>candles.removePriceLine(l));lines=[];
    if(layers.levels) for(const p of [result.activeHigh,result.activeLow].filter(Boolean)) {
      lines.push(candles.createPriceLine({price:p.price,color:p.type==='high'?'#81bfff':'#f0c078',lineWidth:1,lineStyle:2,axisLabelVisible:true,title:`${p.type==='high'?'Sommet':'Creux'}${p.broken?' franchi':''}`}));
    }
    hosts.rsiPanel.hidden=!layers.rsi;
    if(layers.rsi&&!oscillator) {
      oscillator=library.createChart(hosts.rsi,{...options,width:hosts.rsi.clientWidth,height:hosts.rsi.clientHeight,handleScroll:false,handleScale:false,timeScale:{...options.timeScale,visible:false},rightPriceScale:{...options.rightPriceScale,scaleMargins:{top:.05,bottom:.05}}});
      rsi=oscillator.addLineSeries({color:'#c4a3ff',lineWidth:2,priceLineVisible:false,priceFormat:{type:'price',precision:1,minMove:.1},autoscaleInfoProvider:()=>({priceRange:{minValue:0,maxValue:100}})});
      for(const threshold of [30,70]) rsi.createPriceLine({price:threshold,color:'#8595ae',lineWidth:1,lineStyle:2,axisLabelVisible:true,title:''});
    }
    // Whitespace during warm-up aligns all logical indices with the price pane.
    if(rsi) rsi.setData(indicators.rsi);
    if(changed) main.timeScale().fitContent();
    lastSelection=selectionKey;
    resize();
  }
  return { draw, resize, fit:()=>main.timeScale().fitContent(), destroy:()=>{main.timeScale().unsubscribeVisibleLogicalRangeChange(syncRange);oscillator?.remove();main.remove();} };
}
