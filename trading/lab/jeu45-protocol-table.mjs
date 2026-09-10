import {JEU45_POLICY,JEU45_VARIANTS} from './jeu45-policy.mjs';
export const policy45Block=()=>`<!-- POLICY45:START -->\n\`\`\`json\n${JSON.stringify({policy:JEU45_POLICY,variants:JEU45_VARIANTS},null,2)}\n\`\`\`\n<!-- POLICY45:END -->`;
export function verifyPolicy45Protocol(text){if(!text.includes(policy45Block()))throw Error('Game45 protocol differs from execution policy');}
