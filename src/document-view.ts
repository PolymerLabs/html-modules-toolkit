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
  static async fromFile(file: File): Promise<DocumentView> {
    return new DocumentView(parseHtml(await getFileContents(file)));
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

