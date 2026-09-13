import { serveDataset } from './jeu04.js';

export const DATASET_KEY = 'jeu06/market-comparison-v1.json';
export const onRequest = context => serveDataset(context, DATASET_KEY, 'application/json; charset=utf-8');
