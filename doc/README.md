# Prism

This website uses a [forked version][prism-eval] of [Prism] by [Lea Verou][leaverou] to show source code.

## Download

The repository is not used directly in this project. [Prism] needs to be build before use,
and performs best when some choices are made. A specific build is generated at the
[Prism dowload page][prism-download].

We use

* a _minified_ version
* the core
* the _Coy_ theme
* only the _JavaScript_ language plugin; selection triggers inclusion of the _C-like_ languages plugin
* plugins
    * _Line Highlight_
    * _Line Numbers_
    * _File Highlight_
    * _JSONP Highlight_
    * _Remove initial line feed_

Sadly, _WebPlatform Docs_ doesn't support JavaScript yet. That would be helpful.

Both the `js` and the `css` file need to be downloaded.

## Source

The [Prism] source code is at [GitHub][prism-git] ([clone][clone-prism]), and forked at 
[github][prism-toryt-fork-github] and
[bitbucket][prism-toryt-fork-bitbucket] for safe keeping.


## Usage notes

[Prism] has no "loaded" protection. Add the script at the end of the body.


[Prism]: http://prismjs.com
[Prism-eval]: http://eval-prismjs.toryt.org
[MIT license]: http://www.opensource.org/licenses/mit-license.php/
[clone-prism]: https://github.com/PrismJS/prism.git
[leaverou]: http://lea.verou.me
[prism-git]: https://github.com/PrismJS/prism
[prism-toryt-fork-github]: https://github.com/jandockx/prism-eval
[prism-toryt-fork-bitbucket]:https://bitbucket.org/jandockx/prism-eval
[prism-download]: http://eval-prismjs.toryt.org/download.html?themes=prism-coy&languages=clike+javascript&plugins=line-highlight+line-numbers+file-highlight+jsonp-highlight+remove-initial-line-feed+eval
 
