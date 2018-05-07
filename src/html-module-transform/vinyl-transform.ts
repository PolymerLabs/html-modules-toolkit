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

import {Transform} from 'stream';
import * as File from 'vinyl';

import {getFileContents} from '../file.js';
import {transformSpecifiersInHtmlString, transformSpecifiersInJsString} from '../html-module-specifier-transform.js';
import {htmlModuleToJsModuleMap} from '../html-module-transform.js';
import {destructureStream, transformStream} from '../stream.js';


export type HtmlModuleTest = (filePath: string) => Boolean;


export const defaultHtmlModuleTest: HtmlModuleTest = (filePath: string) =>
    /\.html$/.test(filePath) && !/index\.html$/.test(filePath);


export const htmlModuleFileToJsModuleFiles =
    async(file: File): Promise<File[]> => {
  const moduleMap =
      await htmlModuleToJsModuleMap(file.path, await getFileContents(file));
  const files: File[] = [];
  for (const [path, contents] of moduleMap.entries()) {
    files.push(new File({
      path,
      contents: Buffer.from(contents),
      cwd: file.cwd,
      base: file.base
    }));
  }
  return files;
};


export const htmlModuleTransform =
    (htmlModuleTest: HtmlModuleTest = defaultHtmlModuleTest): Transform =>
        destructureStream<File>(
            async(file: File): Promise<File[]> => htmlModuleTest(file.path) ?
                await htmlModuleFileToJsModuleFiles(file) :
                [file]);


export const htmlModuleSpecifierTransform = (): Transform =>
    transformStream<File, File>(async(file: File): Promise<File> => {
      if (/.html$/.test(file.path)) {
        return await transformSpecifiersInHtmlFile(file);
      } else if (/.js$/.test(file.path)) {
        return await transformSpecifiersInJsFile(file);
      }

      return file;
    });


export const transformSpecifiersInHtmlFile =
    async(file: File): Promise<File> => {
  const htmlString =
      transformSpecifiersInHtmlString(await getFileContents(file));

  file.contents = Buffer.from(htmlString);

  return file;
};


export const transformSpecifiersInJsFile = async(file: File): Promise<File> => {
  const jsString = transformSpecifiersInJsString(await getFileContents(file));

  file.contents = Buffer.from(jsString);

  return file;
};
