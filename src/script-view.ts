import {
  getFileContents
} from 'polymer-build/lib/streams';
import * as acornBase from 'acorn';
import * as walk from 'acorn/dist/walk';
import * as escodegen from 'escodegen';
import * as File from 'vinyl';

const injectAcornImportMeta = require('acorn-import-meta/inject');

const acorn = injectAcornImportMeta(acornBase);

const {
  parse: parseJs
} = acorn;
const serializeJs = escodegen.generate;

const $verbatim = Symbol('verbatim');

export class ScriptView {
  static get $verbatim() {
    return $verbatim;
  }

  static fromSourceString(sourceString: string): ScriptView {
    return new ScriptView(parseJs(sourceString, {
      sourceType: 'module',
      ecmaVersion: 9,
      allowImportExportEverywhere: true,
      plugins: {
        importMeta: true
      }
    }));
  }

  static async fromFile(file: File): Promise<ScriptView> {
    return this.fromSourceString(await getFileContents(file));
  }

  public importDeclarations: any[] = [];
  public importMetaScriptElementExpressions: any[] = [];
  public importMetaUrlExpressions: any[] = [];

  constructor(public script: any) {
    walk.simple(this.script, {
      ImportDeclaration: (node: any) => {
        this.importDeclarations.push(node);
      },

      MemberExpression: (node: any) => {
        if (node.object.type === 'MetaProperty') {
          switch (node.property.name) {
            case 'scriptElement':
              this.importMetaScriptElementExpressions.push(node);
              break;
            case 'url':
              this.importMetaUrlExpressions.push(node);
              break;
          }
        }
      }
    });
  }

  toString() {
    return serializeJs(this.script, <any>{
      verbatim: $verbatim
    });
  }
};

