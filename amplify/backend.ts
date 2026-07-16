import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';

/**
 * Partner Bot backend.
 * Auth is defined now so the Cognito sign-in module later in the course
 * has a User Pool to attach to. No data model yet.
 * @see https://docs.amplify.aws/react/build-a-backend/
 */
defineBackend({
  auth,
});
