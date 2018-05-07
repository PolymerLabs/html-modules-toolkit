const template = document.createElement('template');
const doc = document.implementation.createHTMLDocument();
template.innerHTML = `<html><head><script type="module" src="./x-hello-js.js"></script>
</head><body></body></html>`;
doc.body.appendChild(template.content);
export default doc;