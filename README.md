*🚨 **PROJECT STATUS: EXPERIMENTAL** 🚨This product is in the Experimentation phase. Someone on the team thinks it’s an idea worth exploring, but it may not go any further than this. Use at your own risk.*


# 🍢 HTML Modules Toolkit

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
HTML Modules Toolkit is a collection of tools and libraries to help web authors
write their apps and content the way they were meant to be written: in highly
declarative HTML. HTML Modules Toolkit unlocks the potential of future HTML
standards for the projects of today.

## HTML Modules

There is a nascent standard proposal called
[HTML Modules](https://github.com/w3c/webcomponents/issues/645) that could
bring actual HTML into a JavaScript module graph near you. This would unlock
crafting modules from HTML, and even loading other HTML-based modules from HTML
documents or JavaScript modules. Importantly, HTML Modules have a lot more
interest from browser implementors than HTML Imports ever did.

HTML Modules aren't standardized yet, but we have a good sense of what they
might look like once they are standard and implemented by browsers.

## Future HTML today

HTML Modules Toolkit intends to support workflows that incorporate future HTML
standards like HTML Modules. Today, this project includes transforms for
incorporating HTML Modules into build pipelines, and also middleware for using
HTML Modules seamlessly inside of a dev server.

The standards that this project builds upon are still at a very early stage,
so these tools should be considered to be in a similar state. We will adapt and
improve these libraries to track the related standards as they continue to
solidify.

## Installing

```sh
npm install @polymer/html-modules-toolkit
```

## What is included

This project includes low-level, versatile string-to-string transforms that can
analyze a file in place, and produce the appropriate ES Module-compatible
output.

You can import these low-level transforms into your Node.js build pipeline or
dev server of choice:

```javascript
import {htmlModuleToJsModuleMap} from
    '@polymer/html-modules-toolkit/lib/html-module-transform';
import {transformSpecifiersInHtmlString,transformSpecifiersInJsString} from
    '@polymer/html-modules-toolkit/lib/html-module-specifier-transform';
```

This project also includes higher-level wrappers of the transform for different
practical use cases. The available wrappers include:

 - **Webpack plugin:**
   ```javascript
   import {HtmlModulesPlugin} from
       '@polymer/html-modules-toolkit/lib/html-module-transform/webpack-plugin';
   ```
 - **Gulp-compatible vinyl-fs transforms:** 
   ```javascript
   import {HtmlModuleTransform,HtmlModuleSpecifiersTransform} from
       '@polymer/html-modules-toolkit/lib/vinyl-transform';
   ```
 - **Express middleware:** 
   ```javascript
   import {htmlModulesMiddleware} from
       '@polymer/html-modules-toolkit/lib/express-middleware';
   ```
 - **Koa middleware:**
   ```javascript
   import {htmlModulesMiddleware} from
       '@polymer/html-modules-toolkit/lib/koa-middleware';
   ```

### Specifier transforms

If you look closely at the above import statements, you will notice that in some
cases there are separate transforms offered for converting specifiers. This
transform is offered separately because it is not always needed. For example, in
a dev server the server can control the `Content-Type` of the file being sent,
and can send `text/javascript` even if the file has a `.html` file extension.

## Usage examples

You can find some concrete usage examples in the
[`examples/`](https://github.com/PolymerLabs/html-modules-toolkit/tree/master/examples) directory
of this project. The examples include:

 - [An Express dev server](https://github.com/PolymerLabs/html-modules-toolkit/blob/master/examples/express)
 - [A Koa dev server](https://github.com/PolymerLabs/html-modules-toolkit/blob/master/examples/koa)
 - [A Gulp (vinyl-fs) build pipeline](https://github.com/PolymerLabs/html-modules-toolkit/blob/master/examples/gulp)
 - [A Webpack build pipeline](https://github.com/PolymerLabs/html-modules-toolkit/blob/master/examples/webpack)

Additionally, you can find a live example of the Koa middleware in action on
[Glitch](https://glitch.com/edit/#!/html-modules).

## Contributing

Currently we are only considering features or bugfixes related to the evolving
HTML Modules standard. There is no strict spec text for this standard yet, so
feature requests may be redirected to
[w3c/webcomponents](https://github.com/w3c/webcomponents) if they seem
sufficiently novel.

