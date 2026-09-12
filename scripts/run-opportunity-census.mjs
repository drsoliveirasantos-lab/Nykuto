#!/usr/bin/env node
import fs from 'node:fs';
import {
  buildOpportunityCensus,
  compareCensusToSequential
} from '../trading/lab/opportunity-census.mjs';

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
const comparison = sequentialPath
  ? compareCensusToSequential(census, readJson(sequentialPath))
  : null;

process.stdout.write(JSON.stringify({ stats: census.stats, comparison }, null, 2) + '\n');
