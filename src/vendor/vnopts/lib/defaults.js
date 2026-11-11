import { apiDescriptor } from './descriptors/api.js';
import { commonDeprecatedHandler } from './handlers/deprecated/common.js';
import { commonInvalidHandler } from './handlers/invalid/index.js';
import { levenUnknownHandler } from './handlers/unknown/leven.js';
export const defaultDescriptor = apiDescriptor;
export const defaultUnknownHandler = levenUnknownHandler;
export const defaultInvalidHandler = commonInvalidHandler;
export const defaultDeprecatedHandler = commonDeprecatedHandler;
