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

import * as babelCore from '@babel/core';
import dynamicImportSyntax from '@babel/plugin-syntax-dynamic-import';
import importMetaSyntax from '@babel/plugin-syntax-import-meta';
import {NodePath} from '@babel/traverse';
import {CallExpression, ExportAllDeclaration, ExportNamedDeclaration, ImportDeclaration, MemberExpression, MetaProperty} from 'babel-types';
import * as File from 'vinyl';

import {getFileContents} from './file.js';
import {babelSyntaxPlugins} from './script-view/babel-syntax-plugins.js';

export type HasSpecifier =
    ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration;


export class ScriptView {
  static fromSourceString(sourceString: string): ScriptView {
    return new ScriptView(sourceString);
  }

  static async fromFile(file: File): Promise<ScriptView> {
    return this.fromSourceString(await getFileContents(file));
  }

  public importMetaMemberExpressions: NodePath<MemberExpression>[] = [];
  public importCallExpressions: NodePath<CallExpression>[] = [];
  public specifierNodes: Array<NodePath<HasSpecifier|CallExpression>> = [];

  protected ast: any;

  constructor(public script: string) {
    const {ast} = babelCore.transformSync(script, {
      ast: true,
      plugins: [
        ...babelSyntaxPlugins,
        {
          inherits: dynamicImportSyntax,
          visitor: {
            CallExpression: (path: NodePath<CallExpression>) => {
              const {node} = path;
              const {callee, arguments: args} = node;

              if (callee == null || args == null ||
                  callee.type as string !== 'Import' ||
                  args[0].type !== 'StringLiteral') {
                return;
              }

              this.specifierNodes.push(path);
            },
            'ImportDeclaration|ExportAllDeclaration|ExportNamedDeclaration':
                (path: NodePath<HasSpecifier>) => {
                  if (path.node.source != null) {
                    this.specifierNodes.push(path);
                  }
                }
          }
        },
        {
          inherits: importMetaSyntax,
          visitor: {
            MetaProperty: (path: NodePath<MetaProperty>) => {
              const {node} = path;

              if (node.meta && node.meta.name === 'import' &&
                  node.property.name === 'meta') {
                this.importMetaMemberExpressions.push((path as any).parentPath);
              }
            }
          }
        }
      ]
    });

    this.ast = ast;
  }

  toString() {
    return babelCore
        .transformFromAst(
            this.ast, undefined, {plugins: [...babelSyntaxPlugins]})
        .code;
  }
};
