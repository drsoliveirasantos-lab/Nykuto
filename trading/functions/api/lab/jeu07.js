import { serveDataset } from './jeu04.js';

export const DATASET_KEY = 'jeu07/mnq-confirmation-v1.json';
export const onRequest = context => serveDataset(context, DATASET_KEY, 'application/json; charset=utf-8');
