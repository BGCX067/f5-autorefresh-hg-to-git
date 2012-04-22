/**
 * f5-autorefresh
 *
 * (c) copyright 2010-2012, tengidesign.com / Pawel Turlejski
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 */
;(function($) {
    $.f5 = function(options) {
        var settings = $.extend({

            css: 'all',                                 // List of CSS files to monitor:
                                                        //   - 'auto'                       - monitor all <link>ed CSS files
                                                        //   - ['css/s1.css', 'css/s2.css'] - monitor s1 and s2
                                                        //   - [] or false                  - don't monitor any CSS

            html: true,                                 // Reload on HTML file changes.

            timeout: 750,                               // Refresh rate in milliseconds.

            autostart: true,                            // Start refreshing loop on load.

            toggle: {tag: 'body', event: 'dblclick'}    // Toggle updates' monitoring by this action.
                                                        // Set toggle: false to disable.
        }, options)
        
        var _fetch_css = function (call_after, css_idx) {
            if (css_idx < _css.length) {
                var css = _css[css_idx];
                var xhr = $.ajax({url: css.url, cache: false, type: 'GET', success: function(content) {
                    var cur_updated = xhr.getResponseHeader('Last-Modified')
                    if (css.updated != cur_updated && css.updated != -1) {
                        window.location.reload()
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

        var _run = function() {
            _running = false
            if (_paused)
                return;
            _running = true
            setTimeout(function () {_fetch_html(_run)}, settings.timeout);
        }

        var _toggle = function () {
            _paused = !_paused
            if (!_running)
                _run()
        }

        var _paused = !settings.autostart, 
            _running = false,
            _html = settings.html ? {url: '', updated: -1} : false, 
            _css = []

        if (settings.css === 'all') {
            $("link[rel=stylesheet]").each(function(){ 
                // for some reason Chrome adds that weird css with href="data:text/css"...
                if (this.href.indexOf('data:') > -1) {
                    return
                }
                _css[_css.length] = {url: this.href, updated: -1};
            })
        }
        else {
            for (var i in settings.css)
                _css[_css.length] = {url: settings.css[i], updated: -1}
        }

        if (settings.toggle)
            $(settings.toggle.tag).bind(settings.toggle.event, function(){_toggle()})

        _run()
        
        return $;
    }

})(jQuery);

