using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Newtonsoft.Json;

namespace TestUI.Components.Select
{

    /// <summary>
    /// A component for selecting an item from a list.
    /// </summary>
    /// <param name="htmlHelper"></param>
    [JsonObject(MemberSerialization.OptIn)]
    [HtmlTargetElement("nt-select")]
    [RestrictChildren("nt-select-item")]
    public class Select(IHtmlHelper htmlHelper) : NtBaseTag(htmlHelper)
    {
        /// <exclude />
        protected override string ClassName => nameof(Select);

        /// <exclude />
        [HtmlAttributeNotBound]
        public IHtmlContent? ChildContent { get; set; }

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
        /// Make this select required in forms.
        /// </summary>
        public bool Required { get; set; }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {

            ((IViewContextAware)_html).Contextualize(ViewContext);
            output.TagName = "div";

            UniqueId = context.UniqueId;

            ChildContent = await output.GetChildContentAsync();

            var content = await _html.PartialAsync("~/Views/Shared/_SelectPartial.cshtml", this);

            output.Content.SetHtmlContent(content);
            await base.ProcessAsync(context, output);

        }
    }
}
