import { JEU46_POLICY, JEU46_VARIANTS } from './jeu46-policy.mjs';
export const policy46Block = () => `<!-- POLICY46:START -->\n\`\`\`json\n${JSON.stringify({ policy: JEU46_POLICY, variants: JEU46_VARIANTS }, null, 2)}\n\`\`\`\n<!-- POLICY46:END -->`;
export function verifyPolicy46Protocol(text) {
  if (!text.includes(policy46Block())) throw Error('Game46 protocol differs from execution policy');
}
