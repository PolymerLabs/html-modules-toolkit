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

import { parse as parseHtml, serialize as serializeDocument } from 'parse5';
import * as dom from 'dom5';
import * as File from 'vinyl';
import { ASTNode } from 'parse5';

import { getFileContents } from './file.js';

const p = dom.predicates;

const scripts = p.hasTagName('script');
const external = p.hasAttr('src');
const inline = p.NOT(external);
const standard = p.OR(p.hasAttrValue('type', 'text/javascript'),
    p.NOT(p.hasAttr('type')));
const moduleScript = p.hasAttrValue('type', 'module');
const worker = p.hasAttrValue('type', 'worker');

export class DocumentView {
  static fromSourceString(source: string): DocumentView {
    return new DocumentView(parseHtml(source));
  }

  static async fromFile(file: File): Promise<DocumentView> {
    return this.fromSourceString(await getFileContents(file));
  }

  constructor(public document: ASTNode) {}

  get inlineScripts() {
    return dom.queryAll(this.document, p.AND(scripts, inline));
  }

  get externalScripts() {
    return dom.queryAll(this.document, p.AND(scripts, external));
  }

  get inlineModuleScripts() {
    return dom.queryAll(this.document, p.AND(scripts, moduleScript, inline));
  }

  get externalModuleScripts() {
    return dom.queryAll(this.document, p.AND(scripts, moduleScript, external));
  }

  get inlineWorkerScripts() {
    return dom.queryAll(this.document, p.AND(scripts, worker, inline));
  }

  get externalWorkerScripts() {
    return dom.queryAll(this.document, p.AND(scripts, worker, external));
  }

  get inlineStandardScripts() {
    return dom.queryAll(this.document, p.AND(scripts, standard, inline));
  }

  get externalStandardScripts() {
    return dom.queryAll(this.document, p.AND(scripts, standard, external));
  }

  toString() {
    return serializeDocument(this.document);
  }
};

