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

import {Request, RequestHandler, Response} from 'express';
import * as File from 'vinyl';

import {SyntheticFileMap} from '../file.js';
import {defaultHtmlModuleTest, HtmlModuleTest, htmlModuleTransform} from './vinyl-transform.js';

const isJsMimeTypeRe = /.*\.js/;

export const htmlModulesMiddleware =
    (root: string = './',
     moduleTest: HtmlModuleTest = defaultHtmlModuleTest): RequestHandler => {
      const syntheticFileMap =
          new SyntheticFileMap(root, () => htmlModuleTransform(moduleTest));

      return async (request: Request, response: Response, next: () => void) => {
        const {path} = request;
        const hasFile = await syntheticFileMap.hasFile(path);

        if (!hasFile) {
          return next();
        }

        let file: File;

        try {
          file = await syntheticFileMap.readFile(path);
        } catch (e) {
          console.error(e);
          return next();
        }

        if (isJsMimeTypeRe.test(file.path)) {
          response.set('Content-Type', 'text/javascript');
          response.set('Cache-Control', 'no-store');
        }

        response.send(file.contents.toString());
      };
    };
