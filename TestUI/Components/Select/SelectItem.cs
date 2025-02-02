using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Newtonsoft.Json;

namespace TestUI.Components.Select
{

    /// <summary>
    /// A list item inside a select.
    /// </summary>
    /// <param name="htmlHelper"></param>
    [JsonObject(MemberSerialization.OptIn)]
    [HtmlTargetElement("nt-select-item", ParentTag = "nt-select")]
    [HtmlTargetElement("nt-select-item", ParentTag = "nt-select-optgroup")]
    public class SelectItem(IHtmlHelper htmlHelper) : NtBaseTag(htmlHelper)
    {
        /// <summary>
        /// The value for the item.
        /// </summary>
        public object? Value { get; set; }

        /// <summary>
        /// If this item should be selected by default.
        /// </summary>
        public bool Selected { get; set; }

        /// <summary>
        /// If this item should be disabled by defualt.
        /// </summary>
        public bool Disabled { get; set; }

        /// <summary>
        /// Hides the item in the list.
        /// </summary>
        public bool Hidden { get; set; }

        /// <exclude />
        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {

            output.TagName = "div";
            var childContent = (await output.GetChildContentAsync()).GetContent();
            output.Attributes.SetAttribute("class", $"dropdown-item py-1 d-flex justify-content-between nt-select-dropdown-item " +
                $"{(Disabled ? "disabled pe-none " : "")}" + $"{(Hidden ? "d-none " : "")}");
            output.Attributes.SetAttribute("data-value", Value);
            output.Attributes.SetAttribute("data-selected", Selected);
            output.Attributes.SetAttribute("tabindex", 0);

            var item = $@"
                <span class=""nt-autocomplete-dropdown-item-text"">{(string.IsNullOrWhiteSpace(childContent) ? Value : childContent)}</span>
                <span class=""float-end check-icon"" style=""display: none;""><i class=""bi bi-check-lg""></i></span>
                   ";

            output.Content.SetHtmlContent(item);

        }

    }
}
