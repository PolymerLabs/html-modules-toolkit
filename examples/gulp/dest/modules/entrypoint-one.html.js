import doc from './entrypoint-one.html$document-module.js';
import * as module0 from './x-hello-js.js';
const modules = [module0];
const scripts = doc.querySelectorAll('script[type="module"]');

for (let i = 0; i < modules.length; ++i) {
  scripts[i].module = modules[i];
}

export default doc;