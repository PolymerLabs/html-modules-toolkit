import * as through from 'through2';
import { Transform } from 'stream';

export type AsyncStreamFunction =
    (stream: Transform, chunk: any, encoding?: string) => Promise<void>;

export type StreamOptions = { objectMode?: boolean };

export const asyncThrough =
    (fn: AsyncStreamFunction, options: StreamOptions = {}) =>
        through(Object.assign({ objectMode: true }, options),
            async function(chunk, encoding, callback) {
              await fn(this, chunk, encoding);
              callback();
            });

export type DestructureFunction<T> = (structured: T, encoding?: string) => Promise<T[]>

export const destructureStream =
    <T>(fn: DestructureFunction<T>, options?: StreamOptions) => asyncThrough(
        async (stream: Transform, chunk: T, encoding?): Promise<void> => {
          const destructured = await fn(chunk, encoding);
          for (const chunk of destructured) {
            stream.push(chunk);
          }
        }, options);

export type TransformFunction<T, U = T> =
    (source: T, encoding?: string) => Promise<U>;

export const transformStream =
    <T, U = T>(fn: TransformFunction<T, U>, options?: StreamOptions) =>
        asyncThrough(async (stream: Transform, chunk: T, encoding?)
            : Promise<void> => {
          stream.push(await fn(chunk, encoding));
        }, options);


