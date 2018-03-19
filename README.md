# 📺 HD HTML


Let's face it: if you publish stuff on the web, you probably noticed that
it is getting harder and harder to use HTML to do it. HTML Imports failed to
gain a lot of traction among browser implementors. JavaScript modules are, well,
JavaScript; you can use cool tools like
[`lit-html`](https://github.com/polymerlabs/lit-html) within JavaScript, but
traditional markup just isn't on the menu.

HTML has been around for a long time. I mean, sure, just a few decades. But,
that's like a million software years. It is a testament to HTML's versatility
that we still use it for so many things today. The next generation of web
content will need to take advantage of a new generation of HTML capabilities.
HD HTML is a collection of tools and libraries to help web authors write their
apps and content the way they were meant to be written: in highly declarative
HTML. HD HTML unlocks of the capabilities of future HTML standards today.

## HTML Modules

There is a nascent standard proposal called
[HTML Modules](https://github.com/w3c/webcomponents/issues/645) that could
bring actual HTML into a JavaScript module graph near you. This would unlock
crafting modules from HTML, and even loading other HTML-based modules from HTML
documents or JavaScript modules. Importantly, HTML Modules have a lot more
interest from browser implementors than HTML Imports ever did.

HTML Modules aren't standardized yet, but we have a good sense of what they
might look like once they are standard and implemented by browsers.

## Future HTML Today

HD HTML intends to support workflows that incorporate future HTML standards like
HTML Modules. Today, this project includes transforms for incorporating HTML
Modules into build pipelines, and also middleware for using HTML Modules
seamlessly inside of a dev server.

The standards that this project builds upon are still at a very early stage,
so these tools should be considered to be in a similar state. We will adapt and
improve these libraries to track the related standards as they continue to
solidify.

## Installing

```sh
npm install hd-html
```

## Usage examples

You can find some concrete usage examples in the
[`test/`](https://github.com/PolymerLabs/hd-html/tree/master/test) directory
of this project. The examples include:

 - [An Express dev server](https://github.com/PolymerLabs/hd-html/blob/master/test/serve-express.js)
 - [A Koa dev server](https://github.com/PolymerLabs/hd-html/blob/master/test/serve-koa.js)
 - [A vinyl-fs (Gulp) static build pipeline](https://github.com/PolymerLabs/hd-html/blob/master/test/build.js)

Additionally, you can find a live example of the Koa middleware in action on
[Glitch](https://glitch.com/edit/#!/html-modules).

## Contributing

Currently we are only considering features or bugfixes related to the evolving
HTML Modules standard. There is no strict spec text for this standard yet, so
feature requests may be redirected to
[w3c/webcomponents](https://github.com/w3c/webcomponents) if they seem
sufficiently novel.

