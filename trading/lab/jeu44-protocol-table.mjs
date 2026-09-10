import {JEU44_POLICY,JEU44_VARIANTS} from './jeu44-policy.mjs';
export const policy44Block=()=>`<!-- POLICY44:START -->\n\`\`\`json\n${JSON.stringify({policy:JEU44_POLICY,variants:JEU44_VARIANTS},null,2)}\n\`\`\`\n<!-- POLICY44:END -->`;
export function verifyPolicy44Protocol(text){if(!text.includes(policy44Block()))throw Error('Game44 protocol differs from execution policy');}
