import { serveDataset } from './jeu04.js';
export const DATASET_KEY = 'jeu07/mnq-retest-july2026-v1.json';
export const onRequest = context => serveDataset(context, DATASET_KEY, 'application/json; charset=utf-8');
