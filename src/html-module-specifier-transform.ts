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
import * as dom from 'dom5';
import { Transform } from 'stream';

import { getFileContents } from './file.js';
import { transformStream } from './stream.js';
import { DocumentView } from './document-view.js';
import { ScriptView } from './script-view.js';


export const htmlModuleSpecifierTransform = (): Transform =>
    transformStream<File, File>(async (file: File): Promise<File> => {
      if (/.html$/.test(file.path)) {
        return await transformSpecifiersInHtmlFile(file);
      } else if (/.js$/.test(file.path)) {
        return await transformSpecifiersInJsFile(file);
      }

      return file;
    });


export const transformSpecifiersInHtmlFile =
    async (file: File): Promise<File> => {
      const htmlString = transformSpecifiersInHtmlString(
          await getFileContents(file));

      file.contents = Buffer.from(htmlString);

      return file;
    };


export const transformSpecifiersInJsFile =
    async (file: File): Promise<File> => {
      const jsString = transformSpecifiersInJsString(
          await getFileContents(file));

      file.contents = Buffer.from(jsString);

      return file;
    };


export const transformSpecifiersInHtmlString =
    (htmlString: string): string => {
      const documentView = DocumentView.fromSourceString(htmlString);
      const {
        inlineModuleScripts,
        externalModuleScripts
      } = documentView;

      for (const script of externalModuleScripts) {
        const src = dom.getAttribute(script, 'src');
        if (/.html$/.test(src)) {
          dom.setAttribute(script, 'src', `${src}.js`);
        }
      }

      for (const script of inlineModuleScripts) {
        const jsString = transformSpecifiersInJsString(
            dom.getTextContent(script));

        dom.setTextContent(script, jsString);
      }

      return documentView.toString();
    };;


export const transformSpecifiersInJsString = (jsString: string): string => {
  const scriptView = ScriptView.fromSourceString(jsString);
  const { importDeclarations } = scriptView;

  for (const declaration of importDeclarations) {
    const { source } = declaration;
    if (/.html$/.test(source.value)) {
      source.value = source.value.replace(/\.html$/, '.html.js');
      source.raw = source.raw.replace(/\.html$/, '.html.js');
    }
  }

  return scriptView.toString();
};

