import doc from './common-html-lib.html$document-module.js';
const modules = [];
const scripts = doc.querySelectorAll('script[type="module"]');

for (let i = 0; i < modules.length; ++i) {
  scripts[i].module = modules[i];
}

export default doc;