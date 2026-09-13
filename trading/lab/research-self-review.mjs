// Deterministic review of a PREDECLARED comparison. Does not invent new rules,
// fit weights, enlarge risk, select unseen data or enable execution.
export function reviewResearchCandidate(cells,{qualityIssues=0}={}){
 if(cells.length!==6||new Set(cells.map(c=>c.month+'/'+c.cost)).size!==6||!Number.isSafeInteger(qualityIssues)||qualityIssues<0)throw Error('Incomplete review');
 for(const month of ['june','july','august'])for(const cost of ['normal','stress'])if(!cells.some(c=>c.month===month&&c.cost===cost))throw Error('Missing review cell');
 if(cells.some(c=>![c.delta,c.drawdown,c.referenceDrawdown,c.net].every(Number.isFinite)))throw Error('Invalid review metrics');
 const checks={netNondecreasing:cells.every(c=>c.delta>=0),drawdownNonincreasing:cells.every(c=>c.drawdown<=c.referenceDrawdown),noAccountBreach:cells.every(c=>c.status!=='breached'),strictNetImprovement:cells.some(c=>c.delta>0),modelOutputsValid:qualityIssues===0};
 const descriptiveGatePassed=Object.values(checks).every(Boolean);
 return {checks,descriptiveGatePassed,decision:descriptiveGatePassed?'research-only-candidate':'not-retained',failedChecks:Object.entries(checks).filter(([,v])=>!v).map(([k])=>k),qualityIssues,selection:null,independent:false,confirmed:false,executionAllowed:false};
}
