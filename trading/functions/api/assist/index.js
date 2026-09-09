import * as accounts from '../../../account/account-service.mjs';
import { createHandler } from '../../../assist/service.mjs';
export const onRequest = createHandler(accounts);
