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

import * as fs from 'fs';
import * as nodePath from 'path';
import {Transform} from 'stream';
import {promisify} from 'util';
import * as File from 'vinyl';
import * as vfs from 'vinyl-fs';

const stat = promisify(fs.stat);


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


export class SyntheticFileMap {
  protected fileMap: Map<string, File> = new Map();
  protected watcher: fs.FSWatcher|null = null;

  constructor(
      readonly basePath: string,
      protected makeTransform: () => Transform) {
    this.watchFilesystem();
  }

  watchFilesystem() {
    if (this.watcher != null) {
      return;
    }

    this.watcher = fs.watch(
        this.basePath,
        {recursive: true, persistent: false},
        (eventType: string, filename: string) =>
            this.onFsEvent(eventType, filename));
  }

  stopWatchingFilesystem() {
    if (this.watcher == null) {
      return;
    }

    this.watcher.close();
  }

  async hasFile(path: string): Promise<boolean> {
    const filePath = this.mappedPath(path);

    if (this.fileMap.has(filePath)) {
      return true;
    }

    try {
      const stats = await stat(filePath);

      if (!stats.isDirectory()) {
        return true;
      }
    } catch (e) {
    }

    return false;
  }

  async readFile(path: string): Promise<File> {
    const filePath = this.mappedPath(path);

    if (this.fileMap.has(filePath)) {
      return this.fileMap.get(filePath);
    }

    return await new Promise<File>((resolve, reject) => {
      const originalFilename = nodePath.basename(filePath);

      vfs.src([filePath])
          .pipe(this.makeTransform())
          .on('error',
              (error) => {
                console.error(error);
                reject(error);
              })
          .on('data',
              (file: File) => {
                const newFilename = nodePath.basename(file.path);
                // The new filename of the original module will have `.js`
                // appended if it originally ended in `.html`. Newly generated
                // files can be referenced by their suggested paths.
                const storedName = newFilename === `${originalFilename}.js` ?
                    filePath :
                    file.path;

                // NOTE(cdata): A transform may emit more than one file here, as
                // is the case for HTML Modules => JS Modules
                this.fileMap.set(storedName, file);
              })
          .on('end', () => {
            if (this.fileMap.has(filePath)) {
              resolve(this.fileMap.get(filePath));
            } else {
              reject(new Error('Not found!'));
            }
          });
    });
  }

  private mappedPath(path: string): string {
    return nodePath.resolve(nodePath.join(this.basePath, path));
  }

  private onFsEvent(_eventType: string, path: string): void {
    const filePath = this.mappedPath(path);

    if (this.fileMap.has(filePath)) {
      this.fileMap.delete(filePath);
    }
  }
}
