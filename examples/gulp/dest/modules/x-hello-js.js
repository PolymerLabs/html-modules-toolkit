import './common-js-lib.js';
import commonDocument from "./common-html-lib.html.js";
export class XHelloJs extends HTMLElement {
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
customElements.define('x-hello-js', XHelloJs);