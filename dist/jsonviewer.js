var JsonInterperter = /** @class */ (function () {
    function JsonInterperter(collapseClass) {
        if (collapseClass === void 0) { collapseClass = "collapsed"; }
        this.collapseClass = collapseClass;
    }
    JsonInterperter.prototype.collapse = function (item, event) {
        var element = event.target;
        var target = $(element).toggleClass(this.collapseClass).siblings('ul.json-dict, ol.json-array');
        target.toggle();
        if (target.is(':visible')) {
            target.siblings('.json-placeholder').remove();
        }
        else {
            var count = target.children('li').length;
            var placeholder = count + (count > 1 ? ' items' : ' item');
            target.after('<a href class="json-placeholder">' + placeholder + '</a>');
        }
    };
    JsonInterperter.prototype.isCollapsable = function (arg) {
        return arg instanceof Object && Object.keys(arg).length > 0;
    };
    JsonInterperter.prototype.isUrl = function (string) {
        var urlRegexp = /^(https?:\/\/|ftps?:\/\/)?([a-z0-9%-]+\.){1,}([a-z0-9-]+)?(:(\d{1,5}))?(\/([a-z0-9\-._~:/?#[\]@!$&'()*+,;=%]+)?)?$/i;
        return urlRegexp.test(string);
    };
    JsonInterperter.prototype.renderHtml = function (json, options) {
        var _a, _b;
        var html = '';
        if (typeof json === 'string') {
            // Escape tags and quotes
            json = json
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/'/g, '&apos;')
                .replace(/"/g, '&quot;');
            if (((_a = options) === null || _a === void 0 ? void 0 : _a.withLinks) && this.isUrl(json)) {
                html += '<a href="' + json + '" class="json-string" target="_blank">' + json + '</a>';
            }
            else {
                // Escape double quotes in the rendered non-URL string.
                json = json.replace(/&quot;/g, '\\&quot;');
                html += '<span class="json-string">"' + json + '"</span>';
            }
        }
        else if (typeof json === 'number') {
            html += '<span class="json-literal">' + json + '</span>';
        }
        else if (typeof json === 'boolean') {
            html += '<span class="json-literal">' + json + '</span>';
        }
        else if (json === null) {
            html += '<span class="json-literal">null</span>';
        }
        else if (json instanceof Array) {
            if (json.length > 0) {
                html += '[<ol class="json-array">';
                for (var i = 0; i < json.length; ++i) {
                    html += '<li>';
                    // Add toggle button if item is collapsable
                    if (this.isCollapsable(json[i])) {
                        html += '<a href="#" class="json-toggle" data-bind="click: collapse"></a>';
                    }
                    html += this.renderHtml(json[i], options);
                    // Add comma if item is not last
                    if (i < json.length - 1) {
                        html += ',';
                    }
                    html += '</li>';
                }
                html += '</ol>]';
            }
            else {
                html += '[]';
            }
        }
        else if (typeof json === 'object') {
            var keyCount = Object.keys(json).length;
            if (keyCount > 0) {
                html += '{<ul class="json-dict">';
                for (var key in json) {
                    if (Object.prototype.hasOwnProperty.call(json, key)) {
                        html += '<li>';
                        var keyRepr = ((_b = options) === null || _b === void 0 ? void 0 : _b.withQuotes) ?
                            '<span class="json-string">"' + key + '"</span>' : key;
                        // Add toggle button if item is collapsable
                        if (this.isCollapsable(json[key])) {
                            html += '<a href="#" class="json-toggle"  data-bind="click: collapse">' + keyRepr + '</a>';
                        }
                        else {
                            html += keyRepr;
                        }
                        html += ': ' + this.renderHtml(json[key], options);
                        // Add comma if item is not last
                        if (--keyCount > 0) {
                            html += ',';
                        }
                        html += '</li>';
                    }
                }
                html += '</ul>}';
            }
            else {
                html += '{}';
            }
        }
        return html;
    };
    return JsonInterperter;
}());
ko.bindingHandlers.htmlWithBinding = {
    init: function () {
        return { 'controlsDescendantBindings': true };
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        element.innerHTML = ko.unwrap(valueAccessor());
        ko.applyBindingsToDescendants(bindingContext, element);
    }
};
//# sourceMappingURL=jsonInterperter.js.map
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var JsonViewer = /** @class */ (function (_super) {
    __extends(JsonViewer, _super);
    function JsonViewer(options) {
        var _this = _super.call(this) || this;
        var defaults = {
            collapsed: false,
            rootCollapsable: true,
            withQuotes: false,
            withLinks: true
        };
        options = __assign(__assign({}, options), defaults);
        _this.jsonString = ko.observable();
        _this.jsonHtml = ko.pureComputed(function () {
            var json = _this.jsonString();
            if (json) {
                try {
                    var obj = eval('(' + json + ')');
                    return _this.renderHtml(obj, options);
                }
                catch (e) {
                    return _this.renderHtml(json, options);
                }
            }
            return null;
        });
        ko.applyBindings(_this, document.getElementById("app"));
        return _this;
    }
    return JsonViewer;
}(JsonInterperter));
//# sourceMappingURL=jsonviewer.js.map