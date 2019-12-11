class JsonViewer extends JsonInterperter
{
    jsonString: KnockoutObservable<string>;
    jsonHtml: KnockoutComputed<string>;

    constructor(options?: IJsonInterpeterOptions)
    {
        super();

        const defaults: IJsonInterpeterOptions = {
            collapsed: false,
            rootCollapsable: true,
            withQuotes: false,
            withLinks: true
        };

        options = { ...options, ...defaults };

        this.jsonString = ko.observable();
        this.jsonHtml = ko.pureComputed(() =>
        {
            const json = this.jsonString();
            if (json)
            {
                try
                {
                    const obj = eval('(' + json + ')');
                    return this.renderHtml(obj, options);
                } catch (e)
                {
                    return this.renderHtml(json, options);
                }
            }

            return null;
        });
        ko.applyBindings(this, document.getElementById("app"));
    }
}