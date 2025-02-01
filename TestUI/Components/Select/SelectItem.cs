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
    public class SelectItem(IHtmlHelper htmlHelper) : NtBaseTag(htmlHelper)
    {
        /// <summary>
        /// The value for the item.
        /// </summary>
        [JsonProperty]
        public object? Value { get; set; }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {

            output.TagName = "div";
            var childContent = (await output.GetChildContentAsync()).GetContent();
            output.Attributes.SetAttribute("class", "dropdown-item py-1 d-flex justify-content-between nt-select-dropdown-item");
            output.Attributes.SetAttribute("data-value", Value ?? childContent);

            var item = $@"
                <span class=""nt-autocomplete-dropdown-item-text"">{childContent}</span>
                <span class=""float-end check-icon"" style=""display: none;""><i class=""bi bi-check-lg""></i></span>
                   ";

            output.Content.SetHtmlContent(item);

        }

    }
}
