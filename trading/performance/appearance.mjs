import {APPEARANCE_KEY,DEFAULT_COLORS,validateAppearance,foreground} from './appearance-core.mjs';
const form=document.getElementById('perfColors'),status=document.getElementById('perfColorStatus');
const colors=()=>validateAppearance(Object.fromEntries(Object.keys(DEFAULT_COLORS).map(k=>[k,form.elements[k].value])));
function apply(value){
  const host=document.querySelector('.performance');
  for(const [key,hex] of Object.entries(value)){host.style.setProperty(`--calendar-${key}`,hex);host.style.setProperty(`--calendar-${key}-text`,foreground(hex));}
}
function fill(value){for(const [key,hex] of Object.entries(value))form.elements[key].value=hex;apply(value);}
try{
  await window.Nykuto.ready;
  let saved=DEFAULT_COLORS;
  try{saved=validateAppearance(window.Nykuto.read(APPEARANCE_KEY,DEFAULT_COLORS));}catch{status.textContent='Couleurs enregistrées illisibles : les couleurs par défaut sont affichées.';}
  fill(saved);form.querySelector('fieldset').disabled=false;
  form.addEventListener('input',()=>{apply(colors());status.textContent='Aperçu des couleurs · clique sur Enregistrer pour les garder dans ton compte.';});
  form.addEventListener('submit',async event=>{
    event.preventDefault();const inputs=form.querySelector('fieldset');inputs.disabled=true;status.textContent='Enregistrement des couleurs…';
    try{await window.Nykuto.set(APPEARANCE_KEY,colors());status.textContent='Couleurs sauvegardées dans ton compte.';}
    catch{status.textContent='Couleurs non sauvegardées. Cet aperçu reste affiché ; réessaie après vérification de la connexion.';}
    finally{inputs.disabled=false;}
  });
  document.getElementById('perfResetColors').addEventListener('click',()=>{fill(DEFAULT_COLORS);status.textContent='Couleurs par défaut en aperçu · clique sur Enregistrer pour les garder.';});
}catch{status.textContent='Connecte-toi pour personnaliser tes couleurs.';}
