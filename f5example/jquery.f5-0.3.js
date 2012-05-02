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
        
        var _fetch_item = function (item_index, call_after) {
            if (item_index < _items.length) {
                var css = _items[item_index];
                var xhr = $.ajax({url: css.url, cache: false, type: 'HEAD', success: function(content) {
                    var cur_updated = xhr.getResponseHeader('Last-Modified')
                    if (css.updated != cur_updated && css.updated != -1) {
                        window.location.reload()
                    }
                    css.updated = cur_updated
                    _fetch_item(item_index + 1, call_after)
                }});

            }
            else {
                call_after()
            }
        }

        var _run = function() {
            _running = false
            if (_paused)
                return;
            _running = true
            setTimeout(function () { _fetch_item(0, _run) }, settings.timeout);
        }

        var _toggle = function () {
            _paused = !_paused
            if (!_running)
                _run()
        }

        var _paused = !settings.autostart, 
            _running = false,
            _items = settings.html ? [{url: '', updated: -1}] : []

        if (settings.css === 'all') {
            $("link[rel=stylesheet]").each(function(){ 
                // for some reason Chrome adds that weird css with href="data:text/css"...
                if (this.href.indexOf('data:') > -1) {
                    return
                }
                _items[_items.length] = {url: this.href, updated: -1};
            })
        }
        else {
            for (var i in settings.css)
                _items[_items.length] = {url: settings.css[i], updated: -1}
        }

        if (settings.toggle)
            $(settings.toggle.tag).bind(settings.toggle.event, function(){_toggle()})

        _run()
        
        return $;
    }

})(jQuery);

