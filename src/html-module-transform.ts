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

import * as dom from 'dom5';
import * as nodePath from 'path';
import {Transform} from 'stream';
import * as File from 'vinyl';
import template from '@babel/template';

import {DocumentView} from './document-view.js';
import {ScriptView} from './script-view.js';
import {destructureStream} from './stream.js';

const {ast} = template;

export type HtmlModuleFileTest = (file: File) => Boolean;

export const defaultHtmlModuleTest: HtmlModuleFileTest = (file: File) =>
    /\.html$/.test(file.path) && !/index\.html$/.test(file.path);

export const htmlModuleTransform =
    (htmlModuleTest: HtmlModuleFileTest = defaultHtmlModuleTest): Transform =>
        destructureStream<File>(
            async(file: File): Promise<File[]> => htmlModuleTest(file) ?
                await htmlModuleFileToJsModuleFiles(file) :
                [file]);

export const htmlModuleFileToJsModuleFiles =
    async(file: File): Promise<File[]> => {
  const documentView = await DocumentView.fromFile(file);
  const {inlineModuleScripts, externalModuleScripts} = documentView;
  const externalizedModuleScriptSpecifiers: string[] = [];
  const newFiles: File[] = [file];
  const documentModuleSpecifier =
      `./${nodePath.basename(file.path)}$document-module.js`;

  for (const script of inlineModuleScripts) {
    const index = externalizedModuleScriptSpecifiers.length;
    const specifier =
        `./${nodePath.basename(file.path)}$inline-module-${index}.js`;

    const scriptView = ScriptView.fromSourceString(dom.getTextContent(script));

    const {importMetaMemberExpressions} = scriptView;

    const importMetaScriptElementSelector =
        `'script[data-inline-module-script="${index}"]'`;
    dom.setAttribute(script, 'data-inline-module-script', `${index}`);

    for (const memberExpression of importMetaMemberExpressions) {
      const {node} = memberExpression;
      const {property} = node;

      if (property.type === 'Identifier') {
        memberExpression.replaceWith(ast`($documentModule.querySelector(${
            importMetaScriptElementSelector}))`);
      }
    }

    const source = `import $documentModule from '${documentModuleSpecifier}';
${scriptView.toString()}`;

    newFiles.push(new File({
      path: nodePath.join(nodePath.dirname(file.path), specifier),
      contents: Buffer.from(source),
      cwd: file.cwd,
      base: file.base
    }));
    externalizedModuleScriptSpecifiers.push(specifier);
  }

  const documentModuleFile = new File({
    path: nodePath.join(nodePath.dirname(file.path), documentModuleSpecifier),
    contents: Buffer.from(`
const template = document.createElement('template');
const doc = document.implementation.createHTMLDocument();

template.innerHTML = \`${
        documentView.toString().replace(/(^|[^\\]*)\`/g, '$1\\`')}\`;

doc.body.appendChild(template.content);

export default doc;`),
    cwd: file.cwd,
    base: file.base
  });

  newFiles.push(documentModuleFile);

  const scriptUrls =
      externalModuleScripts.map(script => dom.getAttribute(script, 'src'))
          .concat(externalizedModuleScriptSpecifiers);

  file.path = `${file.path}.js`;
  file.contents = Buffer.from(`
import doc from '${documentModuleSpecifier}';
${
      scriptUrls
          .map((url, index) => `import * as module${index} from '${url}';`)
          .join('\n')}

const modules = [${
      scriptUrls.map((_url, index) => `module${index}`).join(', ')}];

const scripts = doc.querySelectorAll('script[type="module"]');

for (let i = 0; i < modules.length; ++i) {
  scripts[i].module = modules[i];
}

export default doc;`);

  return newFiles;
};
