const template = document.createElement('template');
const doc = document.implementation.createHTMLDocument();
template.innerHTML = `<html><head><script type="module" src="./common-js-lib.js"></script>
<script type="module" data-inline-module-script="0">
  import commonDocument from './common-html-lib.html';

  export class XHelloHtml extends HTMLElement {
    constructor() {
      super();

      const content = commonDocument.querySelector('#header').content.cloneNode();
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(content);
    }
  };

  customElements.define('x-hello-html', XHelloHtml);
</script>
</head><body></body></html>`;
doc.body.appendChild(template.content);
export default doc;