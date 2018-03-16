/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

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


