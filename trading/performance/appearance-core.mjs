export const APPEARANCE_KEY='nykuto-trading-appearance-v1';
export const DEFAULT_COLORS=Object.freeze({positive:'#166d55',negative:'#8c3444',background:'#091321'});
export function validateAppearance(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==3||Object.keys(value).some(k=>!Object.hasOwn(DEFAULT_COLORS,k))||Object.values(value).some(v=>typeof v!=='string'||!/^#[a-fA-F0-9]{6}$/.test(v)))throw new Error('Choisis trois couleurs valides pour le calendrier.');
  return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,v.toLowerCase()]));
}
// Choose the higher-contrast black/white foreground for each selected background.
export function foreground(hex){
  const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  const l=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
  return (l+.05)/.05>=1.05/(l+.05)?'#000000':'#ffffff';
}
