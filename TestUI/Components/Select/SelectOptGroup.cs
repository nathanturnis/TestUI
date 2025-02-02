using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Newtonsoft.Json;

namespace TestUI.Components.Select
{

    /// <summary>
    /// Group select items within a group.
    /// </summary>
    /// <param name="htmlHelper"></param>
    [JsonObject(MemberSerialization.OptIn)]
    [HtmlTargetElement("nt-select-optgroup", ParentTag = "nt-select")]
    [RestrictChildren("nt-select-item", "hr")]
    public class SelectOptGroup(IHtmlHelper htmlHelper) : NtBaseTag(htmlHelper)
    {

        /// <summary>
        /// The name for the group of items.
        /// </summary>
        public string? Label { get; set; }

        /// <summary>
        /// Disables this group and all the items in it.
        /// </summary>
        public bool Disabled { get; set; }

        /// <exclude />
        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {

            output.TagName = "div";
            output.Attributes.Add("class", $"nt-select-optgroup {(Disabled? "pe-none " : "")}");
            if (Disabled) { 
                output.Attributes.Add("data-disabled", "true");
            }

            var childContent = (await output.GetChildContentAsync()).GetContent();
            var item = $@"<h6 class=""nt-select-optgroup-label ms-3 my-2 fw-bold fst-italic"">{Label}</h6>{childContent}";

            output.Content.SetHtmlContent(item);

        }
    }
}
