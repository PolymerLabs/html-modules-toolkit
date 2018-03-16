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

import { Request, Response, RequestHandler } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as File from 'vinyl';
import * as vfs from 'vinyl-fs';

import { htmlModuleTransform } from '../html-module-transform.js';

export const htmlModulesMiddleware = (root: string = './'): RequestHandler => {
  const shouldHandleRequest = (filePath: string): boolean => {
    if (virtualFileCache.has(filePath)) {
      return true;
    }

    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        return false;
      }
    } catch (e) {}

    return /\.html$/.test(filePath) && !/index\.html$/.test(filePath);
  };

  const virtualFileCache = new Map();

  return (request: Request, response: Response, next: () => void) => {
    const filePath = path.join(path.resolve(root), request.path);
    console.log(filePath);

    if (!shouldHandleRequest(filePath)) {
      return next();
    }

    response.set('Content-Type', 'text/javascript');

    if (virtualFileCache.has(filePath)) {
      return response.send(virtualFileCache.get(filePath));
    }

    vfs.src([filePath])
        .pipe(htmlModuleTransform((_file: File) => true))
        .on('data', (file: File) => {
          const originalFilename = path.basename(filePath);
          const newFilename = path.basename(file.path);
          const contents = file.contents.toString();

          console.log(newFilename, originalFilename);
          if (newFilename === `${originalFilename}.js`) {
            console.log('Virtual file cache storing', filePath);
            virtualFileCache.set(filePath, contents);
          } else {
            console.log('Virtual file cache storing', file.path);
            virtualFileCache.set(file.path, contents);
          }
        })
        .on('end', () => {
          if (virtualFileCache.has(filePath)) {
            response.send(virtualFileCache.get(filePath));
          } else {
            next();
          }
        });
  };
}

