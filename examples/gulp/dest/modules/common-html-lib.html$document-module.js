const template = document.createElement('template');
const doc = document.implementation.createHTMLDocument();
template.innerHTML = `<html><head><template id="header">
  <div>HTML Modules</div>
</template>
</head><body></body></html>`;
doc.body.appendChild(template.content);
export default doc;