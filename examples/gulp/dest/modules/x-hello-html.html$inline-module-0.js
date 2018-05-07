import $documentModule from './x-hello-html.html$document-module.js';
import commonDocument from "./common-html-lib.html.js";
export class XHelloHtml extends HTMLElement {
  constructor() {
    super();
    const content = commonDocument.querySelector('#header').content.cloneNode();
    this.attachShadow({
      mode: 'open'
    });
    this.shadowRoot.appendChild(content);
  }

}
;
customElements.define('x-hello-html', XHelloHtml);