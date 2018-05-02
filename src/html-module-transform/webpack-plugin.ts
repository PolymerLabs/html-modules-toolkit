import * as fs from 'fs';
import {Volume} from 'memfs';
import {dirname, join} from 'path';
import {Union} from 'unionfs';
import {promisify} from 'util';
import {compilation, Compiler} from 'webpack';

import {htmlModuleToJsModuleMap} from '../html-module-transform.js';

const readFile = promisify(fs.readFile);
const ufs = new Union();
const vfs = new Volume();

ufs.use(fs).use(vfs);

const pluginName = 'HTML Modules Transform';

export interface HtmlModulesPluginOptions {
  htmlModuleTest?: (options: WebpackModuleFactoryOptions) => boolean;
}

export interface WebpackModuleFactoryOptions {
  contextInfo: {
    // The absolute path to the source file of the importing module:
    issuer: string
  };
  // The root directory of the compilation (I think.....)
  context: string;
  // The absolute path of the module being imported, possibly prefixed by a
  // webpack loader directive and possibly suffixed with a loader query:
  request: string;
  // Metadata about locations where the module being imported is being
  // imported from:
  dependences: any[];
  // Options that will be forwarded to the Webpack ResolverFactory
  resolveOptions: {fileSystem?: any};
}

export class HtmlModulesPlugin {
  static isHtmlPathRe = /.*\.html$/;
  protected htmlModuleTest: (options: WebpackModuleFactoryOptions) => boolean;

  constructor(options: HtmlModulesPluginOptions = {}) {
    this.htmlModuleTest =
        options.htmlModuleTest != null ? options.htmlModuleTest : () => true;
  }

  shouldTransform(moduleFactoryOptions: WebpackModuleFactoryOptions): boolean {
    return HtmlModulesPlugin.isHtmlPathRe.test(moduleFactoryOptions.request) &&
        this.htmlModuleTest(moduleFactoryOptions);
  }

  getResourcePath(moduleFactoryOptions: WebpackModuleFactoryOptions): string {
    const {context, request, contextInfo} = moduleFactoryOptions;
    const {issuer} = contextInfo;

    const requestWithoutLoader = request.split('!').pop();
    const requestWithoutLoaderOrQuery = requestWithoutLoader.split('?').shift();

    const issuerDirectory = dirname(issuer.replace(context, ''));
    const resourcePathInIssuerDirectory =
        join(issuerDirectory, requestWithoutLoaderOrQuery);

    return join(context, resourcePathInIssuerDirectory);
  }

  apply(compiler: Compiler) {
    // Tap into the compiler as a new compilation is about to begin:
    compiler.hooks.beforeCompile.tap(pluginName, (params: any) => {
      // The "normal" module factory is the one that will be used to resolve
      // the HTML Modules, so we only care about that one:
      const {normalModuleFactory} = params;

      // Tap into the module factory just before it attempts to resolve the
      // module:
      normalModuleFactory.hooks.beforeResolve.tapPromise(
          pluginName,
          async (moduleFactoryOptions: WebpackModuleFactoryOptions) => {
            const {resolveOptions} = moduleFactoryOptions;
            // Check to see if the module that is about to be resolved is an
            // HTML Module. This includes a file extension check and a user-
            // configurable boolean test:
            if (this.shouldTransform(moduleFactoryOptions)) {
              // If the resolveOptions include a user-configured FS (how can
              // they do this? I do not know), then use that FS to find the
              // source module:
              const readResource = resolveOptions.fileSystem ?
                  promisify(resolveOptions.fileSystem.readFile) :
                  readFile;

              // This is kinda basic. Realy what we should be doing is patching
              // into module resolution somehow so that we could theoretically
              // use name specifiers pointing into node_modules. With this
              // approach, we can only support local files referenced as path
              // specifiers:
              const resourcePath = this.getResourcePath(moduleFactoryOptions);

              const htmlContent = (await readResource(resourcePath)).toString();
              // Use the HTML Modules Transform to generate ESM entrypoint and
              // related artifacts:
              const moduleMap =
                  await htmlModuleToJsModuleMap(resourcePath, htmlContent);
              const files: {[index: string]: string} = {};

              for (const [path, content] of moduleMap.entries()) {
                files[path] = content;
              }

              // Kinda hacky, but here we just alias the entrypoint JS Module
              // to the origina HTML Module for when it is referenced from the
              // virtual FS:
              files[resourcePath] = files[`${resourcePath}.js`];

              // Replaces files in virtual FS with newly generated ones
              vfs.fromJSON(files);

              // Set the resolver's filesystem to be the union FS. I don't know
              // why this is necessary in addition to setting the compilation's
              // inputFileSystem. However, without it the generated artifacts
              // referenced by the entrypoint modue cannot be found by Webpack:
              resolveOptions.fileSystem = ufs;
            }

            return moduleFactoryOptions;
          });
    });

    // Tap into the compiler for each compilation that is produced:
    compiler.hooks.compilation.tap(
        pluginName, (compilation: compilation.Compilation) => {
          // Change the compilation's inputFileSystem to be our layered
          // FS that looks in memory first:
          compilation.inputFileSystem = ufs;
        });
  }
}
