import * as File from 'vinyl';
import * as dom from 'dom5';

import { destructureStream } from './stream.js';
import { DocumentView } from './document-view.js';
import { ScriptView } from './script-view.js';
import * as nodePath from 'path';

export type HtmlModuleTestFunction = (file: File) => Boolean;

export const defaultHtmlModuleTest: HtmlModuleTestFunction = (file: File) =>
    /\.html$/.test(file.path) && !/index\.html$/.test(file.path);

export const htmlModuleTransform =
    (htmlModuleTest: HtmlModuleTestFunction = defaultHtmlModuleTest) =>
        destructureStream<File>(async (file: File): Promise<File[]> =>
            htmlModuleTest(file)
                ? await htmlModuleFileToJsModuleFiles(file)
                : [file]);

export const htmlModuleFileToJsModuleFiles = async (file: File): Promise<File[]> => {
  const documentView = await DocumentView.fromFile(file);
  const {
    inlineModuleScripts,
    externalModuleScripts
  } = documentView;
  const externalizedModuleScriptSpecifiers: string[] = [];
  const newFiles: File[] = [file];
  const documentModuleSpecifier =
      `./${nodePath.basename(file.path)}$document-module.js`;

  for (const script of inlineModuleScripts) {
    const index = externalizedModuleScriptSpecifiers.length;
    const specifier = `./${nodePath.basename(file.path)}$inline-module-${
        index}.js`;

    const scriptView = ScriptView.fromSourceString(dom.getTextContent(script));

    const {
      importMetaScriptElementExpressions
    } = scriptView;

    const importMetaScriptElementVerbatim =
        `$documentModule.querySelector('script[data-inline-module-script="${
            index}"]')`;

    dom.setAttribute(script, 'data-inline-module-script', `${index}`);

    for (const expression of importMetaScriptElementExpressions) {
      expression[ScriptView.$verbatim] = importMetaScriptElementVerbatim;
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

  const scriptUrls = externalModuleScripts
      .map(script => dom.getAttribute(script, 'src'))
      .concat(externalizedModuleScriptSpecifiers);

  file.path = `${file.path}.js`;
  file.contents = Buffer.from(`
import doc from '${documentModuleSpecifier}';
${scriptUrls.map((url, index) => `import * as module${index} from '${url}';`).join('\n')}

const modules = [${scriptUrls.map((_url, index) => `module${index}`).join(', ')}];

const scripts = doc.querySelectorAll('script[type="module"]');

for (let i = 0; i < modules.length; ++i) {
scripts[i].module = modules[i];
}

export default doc;`);

  return newFiles;
};

