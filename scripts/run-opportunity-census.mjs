#!/usr/bin/env node
import fs from 'node:fs';
import {
  buildOpportunityCensus,
  compareCensusToSequential
} from '../trading/lab/opportunity-census.mjs';
import { applyAdaptiveRiskSizing } from '../trading/lab/adaptive-risk.mjs';

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

const [eventsPath, sequentialPath] = process.argv.slice(2);
if (!eventsPath) {
  console.error('Usage: node scripts/run-opportunity-census.mjs <events.json> [sequential-plans.json]');
  process.exit(2);
}

const events = readJson(eventsPath);
const census = buildOpportunityCensus(events, { dedupeBars: 1, timeframeMinutes: 5 });
const adaptiveRisk = applyAdaptiveRiskSizing(census, { maxRiskUsd: 500 });
const enrichedCensus = { ...census, opportunities: adaptiveRisk.opportunities };
const comparison = sequentialPath
  ? compareCensusToSequential(enrichedCensus, readJson(sequentialPath))
  : null;

process.stdout.write(JSON.stringify({
  stats: census.stats,
  adaptiveRisk: adaptiveRisk.stats,
  comparison
}, null, 2) + '\n');
