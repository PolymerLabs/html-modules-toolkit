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
import * as Koa from 'koa';

import { SyntheticFileMap } from '../file.js';
import { htmlModuleTransform } from '../html-module-transform.js';

export const htmlModuleMiddleware = (root: string = './'): Koa.Middleware => {

  const syntheticFileMap = new SyntheticFileMap(root,
      htmlModuleTransform((_file: File) => true));

  return async (ctx: Koa.Context, next: Function) => {
    const { request, response } = ctx;
    const { path } = request;
    const hasFile = await syntheticFileMap.hasFile(path);

    const isHtmlModule = /\.html$/.test(path) && !/index\.html$/.test(path);

    if (!hasFile || !isHtmlModule) {
      return next();
    }

    let file: File;

    try {
      file = await syntheticFileMap.readFile(path);
    } catch (e) {
      return next();
    }

    response.set('Content-Type', 'text/javascript');
    response.set('Cache-Control', 'no-store');
    response.body = file.contents;

    next();
  };
};
