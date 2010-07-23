(function($) {
    $.f5 = function(options) {
        var settings = $.extend({

            css: 'auto',                                // List of CSS files to monitor:
                                                        //   - 'auto'                       - monitor all <link>ed CSS files
                                                        //   - ['css/s1.css', 'css/s2.css'] - monitor s1 and s2
                                                        //   - [] or false                  - don't monitor any CSS

            html: true,                                 // Reload on HTML file changes.

            timeout: 750,                               // Refresh rate in milliseconds.

            start: true,                                // Start refreshing loop on load.

            toggle: { tag: 'body', event: 'dblclick' }  // Toggle updates' monitoring by this action.
                                                        // Set toggle: false to disable.
        }, options)

        var _fetch_css = function (call_after, css_idx) {
            if (css_idx < _css.length) {
                var css = _css[css_idx];
                var xhr = $.ajax({url: css.url, cache: false, type: 'GET', success: function(content) {
                    var cur_updated = xhr.getResponseHeader('Last-Modified')
                    if (css.updated != cur_updated && css.updated != -1) {
                        // IE hack: for some reason IE refuses to update text inside a <style> tag,
                        //          so just reload the whole page
                        if ($.browser.msie) {
                            window.location.reload()
                            return;
                        }
                        else {
                            // set different title for every css, so they can be updated individually
                            var title = 'Css' + css_idx
                            // try to disable it's original version that could be included via <link>
                            $("link[href*=" + css.url + "]").each(function(){ this.disabled = true })
                            // insert updated css into a new <style> tag
                            $("style[title=" + title + "]").remove();
                            $("<style title='" + title + "' type='text/css'>").text(content).appendTo($('head'));
                        }
                    }
                    css.updated = cur_updated
                    _fetch_css(call_after, css_idx + 1)
                }});

            }
            else {
                call_after()
            }
        }

        var _fetch_html = function (call_after) {
            if (_html) {
                var xhr = $.ajax({url: _html.url, cache: false, type: 'GET', success: function() {
                    var cur_updated = xhr.getResponseHeader('Last-Modified');
                    if (_html.updated != cur_updated && _html.updated != -1) {
                        window.location.reload()
                        return;
                    }
                    _html.updated = cur_updated
                    _fetch_css(call_after, 0)
                }});
            }
            else  {
                _fetch_css(call_after, 0)
            }
        }

        var _start = function() {
            _running = false
            if (_paused)
                return;
            _running = true
            setTimeout(function () { _fetch_html(_start) }, settings.timeout);
        }

        var _toggle = function () {
            _paused = !_paused
            if (!_running)
                _start()
        }

        var _paused = !settings.start, 
            _running = false,
            _need_reload = false;
            _html = settings.html ? { url: '', updated: -1 } : false, 
            _css = []

        if (settings.css === 'auto') {
            $("link[rel=stylesheet]").each(function(){ _css[_css.length] = { url: this.href, updated: -1 } })
        }
        else {
            for (var i in settings.css)
                _css[_css.length] = { url: settings.css[i], updated: -1 }
        }

        if (settings.toggle)
            $(settings.toggle.tag).bind(settings.toggle.event, function(){ _toggle() })

        _start()
        
        return $;
    }

})(jQuery);

