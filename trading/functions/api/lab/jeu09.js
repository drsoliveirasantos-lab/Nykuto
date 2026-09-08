import { serveDataset } from './jeu04.js';
export const DATASET_KEY = 'jeu09/mnq-six-months-v2.json';
export const onRequest = context => serveDataset(context, DATASET_KEY, 'application/json; charset=utf-8');
