import {JEU43_POLICY,JEU43_VARIANTS} from './jeu43-policy.mjs';
export const policy43Block=()=>`<!-- POLICY43:START -->\n\`\`\`json\n${JSON.stringify({policy:JEU43_POLICY,variants:JEU43_VARIANTS},null,2)}\n\`\`\`\n<!-- POLICY43:END -->`;
export function verifyPolicy43Protocol(text){if(!text.includes(policy43Block()))throw Error('Game43 protocol differs from execution policy');}
