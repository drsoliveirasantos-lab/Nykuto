import * as accounts from '../../../account/account-service.mjs';
import { createVisionHandler } from '../../../assist/vision.mjs';
export const onRequest = createVisionHandler(accounts);
