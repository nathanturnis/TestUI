using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Newtonsoft.Json;

using TestUI.UI;

namespace TestUI.Components.AutoComplete
{

    /// <summary>
    /// An AutoComplete component for searching and selecting items.
    /// Built and styled using Bootstrap.
    /// </summary>
    /// <param name="htmlHelper"></param>
    [JsonObject(MemberSerialization.OptIn)]
    [HtmlTargetElement("nt-autocomplete", TagStructure = TagStructure.WithoutEndTag)]
    public class AutoComplete(IHtmlHelper htmlHelper) : NtBaseTag(htmlHelper)
    {

        /// <exclude />
        protected override string ClassName => nameof(AutoComplete);


        /// <summary>
        /// A list of items to bind this autocomplete to.
        /// Required when no SearchUrl is applied.
        /// </summary>
        [JsonProperty]
        public object? Items { get; set; }

        /// <summary>
        /// The property each item will use as its display text.
        /// </summary>
        [JsonProperty]
        public string? DisplayProperty { get; set; }

        /// <summary>
        /// The property for which each item's value is set to. This is the value sent upon form submission.
        /// </summary>
        [JsonProperty]
        public string? ValueProperty { get; set; }

        /// <summary>
        /// The inital value given to the AutoComplete. Depending on the given Items, it can be a primitive or an object.
        /// </summary>
        [JsonProperty]
        public object? Value { get; set; }

        /// <summary>
        /// The placeholder to display when nothing is selected or inputted.
        /// </summary>
        public string? Placeholder { get; set; }

        /// <summary>
        /// The label for the input.
        /// </summary>
        public string? Label { get; set; }

        /// <summary>
        /// If true, use Bootstrap's floating labels. A label and placeholder is required.
        /// Default false.
        /// </summary>
        public bool FloatingLabel { get; set; }

        /// <summary>
        /// Disable the input and dropdown toggles.
        /// </summary>
        public bool Disabled { get; set; }

        /// <summary>
        /// Make this AutoComplete required in forms.
        /// </summary>
        public bool Required { get; set; }

        /// <summary>
        /// Icon to show in front of input. Only accepts Bootstrap's Icon Web Font class name.
        /// For example: bi bi-microsoft
        /// </summary>
        public string? StartIcon { get; set; }

        /// <summary>
        /// The size of the rendered input.
        /// </summary>
        public ComponentSize Size { get; set; } = ComponentSize.Medium;

        /// <summary>
        /// The URL to fetch data upon input.
        /// </summary>
        [JsonProperty]
        public string? SearchUrl { get; set; }

        /// <summary>
        /// If true, when the component is initialized a call is made to SearchUrl with an empty value.
        /// Default false.
        /// </summary>
        [JsonProperty]
        public bool FetchServerOnLoad { get; set; }

        /// <summary>
        /// The amount of time in milliseconds from when input is received to when the search is made.
        /// 150ms default.
        /// </summary>
        [JsonProperty]
        public int SearchDelay { get; set; } = 150;

        /// <summary>
        /// Virtualizes the list so only visible items are rendered to improve performance on large datasets.
        /// Default false.
        /// </summary>
        [JsonProperty]
        public bool Virtualize { get; set; }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            if (Id == null)
                throw new ArgumentNullException(nameof(Id), "Id is a required property.");
            if (Items == null && string.IsNullOrWhiteSpace(SearchUrl))
                throw new ArgumentNullException(nameof(Items), "Items is a required property.");

            if (!string.IsNullOrWhiteSpace(SearchUrl) && Items != null)
                Items = null;

            if (Items != null)
            {
                if (Items is not System.Collections.IEnumerable)
                    throw new ArgumentException(paramName: nameof(Items), message: "Items must be an implementation of System.Collections.IEnumerable");

                var isBasicType = Items.GetType().GetGenericArguments().Single().IsPrimitive || Items.GetType().GetGenericArguments().Single() == typeof(string);

                if (!isBasicType)
                {
                    if (string.IsNullOrWhiteSpace(ValueProperty))
                        throw new ArgumentNullException(nameof(ValueProperty), "Must provide a value property.");

                    if (string.IsNullOrWhiteSpace(DisplayProperty))
                        DisplayProperty = ValueProperty;

                    var listType = Items.GetType().GetGenericArguments().Single();

                    if (listType.GetProperty(ValueProperty) == null)
                        throw new ArgumentException(paramName: nameof(ValueProperty), message: $"Could find property of name {ValueProperty} in type {listType}");

                    else if (listType.GetProperty(DisplayProperty) == null)
                        throw new ArgumentException(paramName: nameof(DisplayProperty), message: $"Could find property of name {DisplayProperty} in type {listType}");
                }
            }

            if(FetchServerOnLoad && string.IsNullOrWhiteSpace(SearchUrl))
                FetchServerOnLoad = false;
            

            ((IViewContextAware)_html).Contextualize(ViewContext);
            output.TagName = "div";
            output.Attributes.TryGetAttribute("class", out var classes);
            output.Attributes.SetAttribute("class", $"dropdown nt-autocomplete-dropdown {classes?.Value}");
            output.Attributes.SetAttribute("id", $"AutoComplete_{Id}");
            output.TagMode = TagMode.StartTagAndEndTag;

            UniqueId = context.UniqueId;

            var content = await _html.PartialAsync("~/Views/Shared/_AutocompletePartial.cshtml", this);

            output.Content.SetHtmlContent(content);
            await base.ProcessAsync(context, output);
        }
    }
}
