import {Static, TSchema} from '@sinclair/typebox';
import {FastifyInstance, FastifyReply, FastifyRequest, HTTPMethods, RouteGenericInterface} from 'fastify';

export type IRouteSpec<T extends IRouteSchema> = IAuthRouteSpec<T> | INoAuthRouteSpec<T>;

/**
 * Route spec for authenticated requests. Most requests should use this.
 */
export interface IAuthRouteSpec<T extends IRouteSchema> {
  auth: true;
  method: HTTPMethods;
  url: string;
  docs: ISwaggerConfig;
  schema: T;
  handle: (props: IRouteHandle<T>) => Promise<Static<NonNullable<T['response']>> | undefined>;
}

/**
 * Route spec for unauthenticated requests.
 */
export interface INoAuthRouteSpec<T extends IRouteSchema> {
  auth: false;
  method: HTTPMethods;
  url: string;
  docs: ISwaggerConfig;
  schema: T;
  handle: (props: IRouteHandle<T>) => Promise<Static<NonNullable<T['response']>> | undefined>;
}

export interface IRouteHandle<T extends IRouteSchema> {
  instance: FastifyInstance;
  req: FastifyRequest<ITypedRequest<T>>;
  reply: FastifyReply;
}

export interface IRouteSchema {
  body?: TSchema;
  query?: TSchema;
  params?: TSchema;
  response?: TSchema;
}
/**
 * Static<T> cannot take `undefined` since `undefined` does not extend `TSchema`. But `never` does, so this is a quick and
 * dirty way to conditionally set optional schemas for each of the request fields. For example, T["body"] will either be a
 * TSchema subtype or `undefined`. `NonNullable<T["field"]>` will return the TSchema subtype, or `never` if T["body"] is
 * undefined.
 */
export interface ITypedRequest<T extends IRouteSchema> extends RouteGenericInterface {
  Body: Static<NonNullable<T['body']>>;
  Querystring: Static<NonNullable<T['query']>>;
  Params: Static<NonNullable<T['params']>>;
  Reply: Static<NonNullable<T['response']>>;
}

interface ISwaggerConfig {
  tag: string; // Used to categorize routes in the docs UI. Also used for client generation.
  operationId: string; // Used as the function name for the generated client.
  description: string;
}
