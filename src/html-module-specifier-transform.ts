import {
  AsyncTransformStream
} from 'polymer-build/lib/streams';
import * as File from 'vinyl';
import * as dom from 'dom5';
import { DocumentView } from './document-view.js';
import { ScriptView } from './script-view.js';

export class HtmlModuleSpecifierTransform extends AsyncTransformStream<File, File> {
  constructor() {
    super({ objectMode: true });
  }
  async * _transformIter(files: AsyncIterable<File>): AsyncIterable<File> {
    for await (const file of files) {
      if (/.html$/.test(file.path)) {
        await this.transformSpecifiersInHtmlFile(file);
      } else if (/.js$/.test(file.path)) {
        await this.transformSpecifiersInJsFile(file);
      }

      yield file;
    }
  }

  protected async transformSpecifiersInHtmlFile(file: File): Promise<File> {
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

      this.transformSpecifiersInScriptView(scriptView);

      dom.setTextContent(script, scriptView.toString());
    }

    file.contents = Buffer.from(documentView.toString());

    return file;
  }

  protected async transformSpecifiersInJsFile(file: File): Promise<File> {
    const scriptView = await ScriptView.fromFile(file);

    this.transformSpecifiersInScriptView(scriptView);

    file.contents = Buffer.from(scriptView.toString());

    return file;
  }

  protected transformSpecifiersInScriptView(scriptView: ScriptView) {
    const { importDeclarations } = scriptView;

    for (const declaration of importDeclarations) {
      const { source } = declaration;
      if (/.html$/.test(source.value)) {
        source.value = source.value.replace(/\.html$/, '.html.js');
        source.raw = source.raw.replace(/\.html$/, '.html.js');
      }
    }
  }
};
