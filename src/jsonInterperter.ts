class JsonInterperter
{
    constructor(private collapseClass = "collapsed")
    {    
    }

    public collapse(item: this, event: Event)
    {
        const element = (<HTMLElement>event.target);

        const target = $(element).toggleClass(this.collapseClass).siblings('ul.json-dict, ol.json-array');
        target.toggle();
        if (target.is(':visible'))
        {
            target.siblings('.json-placeholder').remove();
        } else
        {
            const count = target.children('li').length;
            const placeholder = count + (count > 1 ? ' items' : ' item');
            target.after('<a href class="json-placeholder">' + placeholder + '</a>');
        }

    }
    public isCollapsable(arg: Object)
    {
        return arg instanceof Object && Object.keys(arg).length > 0;
    }

    public isUrl(string: string)
    {
        var urlRegexp = /^(https?:\/\/|ftps?:\/\/)?([a-z0-9%-]+\.){1,}([a-z0-9-]+)?(:(\d{1,5}))?(\/([a-z0-9\-._~:/?#[\]@!$&'()*+,;=%]+)?)?$/i;
        return urlRegexp.test(string);
    }

    public renderHtml(json: any, options?: IJsonInterpeterOptions)
    {
        var html = '';

        if (typeof json === 'string')
        {
            // Escape tags and quotes
            json = json
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/'/g, '&apos;')
                .replace(/"/g, '&quot;');

            if (options?.withLinks && this.isUrl(json))
            {
                html += '<a href="' + json + '" class="json-string" target="_blank">' + json + '</a>';
            } else
            {
                // Escape double quotes in the rendered non-URL string.
                json = json.replace(/&quot;/g, '\\&quot;');
                html += '<span class="json-string">"' + json + '"</span>';
            }
        } else if (typeof json === 'number')
        {
            html += '<span class="json-literal">' + json + '</span>';
        } else if (typeof json === 'boolean')
        {
            html += '<span class="json-literal">' + json + '</span>';
        } else if (json === null)
        {
            html += '<span class="json-literal">null</span>';
        } else if (json instanceof Array)
        {
            if (json.length > 0)
            {
                html += '[<ol class="json-array">';

                for (let i = 0; i < json.length; ++i)
                {
                    html += '<li>';
                    // Add toggle button if item is collapsable
                    if (this.isCollapsable(json[i]))
                    {
                        html += '<a href="#" class="json-toggle" data-bind="click: collapse"></a>';
                    }
                    html += this.renderHtml(json[i], options);
                    // Add comma if item is not last
                    if (i < json.length - 1)
                    {
                        html += ',';
                    }
                    html += '</li>';
                }
                html += '</ol>]';
            } else
            {
                html += '[]';
            }
        } else if (typeof json === 'object')
        {
            let keyCount = Object.keys(json).length;
            if (keyCount > 0)
            {
                html += '{<ul class="json-dict">';
                for (let key in json)
                {
                    if (Object.prototype.hasOwnProperty.call(json, key))
                    {
                        html += '<li>';
                        const keyRepr = options?.withQuotes ?
                            '<span class="json-string">"' + key + '"</span>' : key;
                        // Add toggle button if item is collapsable
                        if (this.isCollapsable(json[key]))
                        {
                            html += '<a href="#" class="json-toggle"  data-bind="click: collapse">' + keyRepr + '</a>';
                        } else
                        {
                            html += keyRepr;
                        }
                        html += ': ' + this.renderHtml(json[key], options);
                        // Add comma if item is not last
                        if (--keyCount > 0)
                        {
                            html += ',';
                        }
                        html += '</li>';
                    }
                }
                html += '</ul>}';
            } else
            {
                html += '{}';
            }
        }
 
        return html;
    }
}

ko.bindingHandlers.htmlWithBinding = {
    init: () =>
    {
        return { 'controlsDescendantBindings': true }
    },
    update: (element, valueAccessor, allBindings, viewModel, bindingContext) =>
    {
        element.innerHTML = ko.unwrap(valueAccessor());
        ko.applyBindingsToDescendants(bindingContext, element);
    }
};

interface IJsonInterpeterOptions
{
    collapsed: boolean,
    rootCollapsable: boolean,
    withQuotes: boolean,
    withLinks: boolean
}