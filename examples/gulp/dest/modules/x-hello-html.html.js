import doc from './x-hello-html.html$document-module.js';
import * as module0 from './common-js-lib.js';
import * as module1 from './x-hello-html.html$inline-module-0.js';
const modules = [module0, module1];
const scripts = doc.querySelectorAll('script[type="module"]');

for (let i = 0; i < modules.length; ++i) {
  scripts[i].module = modules[i];
}

export default doc;