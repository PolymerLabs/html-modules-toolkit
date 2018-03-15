import * as File from 'vinyl';
import * as dom from 'dom5';

import { transformStream } from './stream.js';
import { DocumentView } from './document-view.js';
import { ScriptView } from './script-view.js';


export const htmlModuleSpecifierTransform =
    () => transformStream<File, File>(async (file: File): Promise<File> => {
      if (/.html$/.test(file.path)) {
        return await transformSpecifiersInHtmlFile(file);
      } else if (/.js$/.test(file.path)) {
        return await transformSpecifiersInJsFile(file);
      }

      return file;
    });


export const transformSpecifiersInHtmlFile =
    async (file: File): Promise<File> => {
      const documentView = await DocumentView.fromFile(file);
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
        const scriptView = ScriptView.fromSourceString(
            dom.getTextContent(script));

        transformSpecifiersInScriptView(scriptView);

        dom.setTextContent(script, scriptView.toString());
      }

      file.contents = Buffer.from(documentView.toString());

      return file;
    };


export const transformSpecifiersInJsFile =
    async (file: File): Promise<File> => {
      const scriptView = await ScriptView.fromFile(file);

      transformSpecifiersInScriptView(scriptView);

      file.contents = Buffer.from(scriptView.toString());

      return file;
    };


export const transformSpecifiersInScriptView = (scriptView: ScriptView) => {
  const { importDeclarations } = scriptView;

  for (const declaration of importDeclarations) {
    const { source } = declaration;
    if (/.html$/.test(source.value)) {
      source.value = source.value.replace(/\.html$/, '.html.js');
      source.raw = source.raw.replace(/\.html$/, '.html.js');
    }
  }
};

