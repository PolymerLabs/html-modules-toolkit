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

import * as File from 'vinyl';

/**
 * Returns the string contents of a Vinyl File object, waiting for
 * all chunks if the File is a stream.
 *
 * NOTE(cdata): We ripped this out of
 * https://github.com/Polymer/polymer-build/blob/master/src/streams.ts as
 * it is the only thing we really need out of that project.
 */
export async function getFileContents(file: File): Promise<string> {
  if (file.isBuffer()) {
    return file.contents.toString('utf-8');
  } else if (file.isStream()) {
    const stream = file.contents;
    stream.setEncoding('utf-8');
    const contents: string[] = [];
    stream.on('data', (chunk: string) => contents.push(chunk));

    return new Promise<string>((resolve, reject) => {
      stream.on('end', () => resolve(contents.join('')));
      stream.on('error', reject);
    });
  }
  throw new Error(
      `Unable to get contents of file ${file.path}. ` +
      `It has neither a buffer nor a stream.`);
};

