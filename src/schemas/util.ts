import {Static, TProperties, TSchema, Type} from '@sinclair/typebox';

export const Schema = <T extends TProperties>(id: string, schema: T) => Type.Object(schema, {$id: id});

export const Nullable = <T extends TSchema>(schema: T) => Type.Unsafe<Static<T> | null>({...schema, nullable: true});

export const StringEnum = <T extends string[]>(values: [...T]) =>
  Type.Unsafe<T[number]>({type: 'string', enum: values});

export const DateTimeSchema = Type.Unsafe<Date | string>({
  type: 'string',
  format: 'date-time',
});
