import {Type} from '@sinclair/typebox';
import {Schema} from './util';

export const UnauthenticatedSchema = Schema('UnauthenticatedSchema401', {detail: Type.String()});

export default {UnauthenticatedSchema};
