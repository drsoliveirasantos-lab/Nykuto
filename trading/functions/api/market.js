import * as accounts from '../../account/account-service.mjs';
import { createHandler } from '../../live/feed-service.mjs';
export const onRequest = createHandler(accounts);
