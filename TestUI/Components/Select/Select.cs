using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Newtonsoft.Json;
using TestUI.UI;

namespace TestUI.Components.Select
{

    /// <summary>
    /// A component for selecting an item from a list.
    /// </summary>
    /// <param name="htmlHelper"></param>
    [JsonObject(MemberSerialization.OptIn)]
    [HtmlTargetElement("nt-select")]
    [RestrictChildren("nt-select-item", "hr", "nt-select-optgroup")]
    public class Select(IHtmlHelper htmlHelper) : NtBaseTag(htmlHelper)
    {
        /// <exclude />
        protected override string ClassName => nameof(Select);

        /// <exclude />
        [HtmlAttributeNotBound]
        public IHtmlContent? ChildContent { get; set; }

        /// <summary>
        /// Disabled the select.
        /// </summary>
        public bool Disabled { get; set; }

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
        /// The maxium size of the rendered dropdown in pixels.
        /// Default 400
        /// </summary>
        public int DropdownSize { get; set; } = 400;


        /// <exclude />
        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {

            ((IViewContextAware)_html).Contextualize(ViewContext);
            output.TagName = "div";
            output.Attributes.TryGetAttribute("class", out var classes);
            output.Attributes.SetAttribute("class", $"dropdown nt-select-dropdown {classes?.Value}");
            output.Attributes.SetAttribute("id", $"NtSelect_{Id}");

            UniqueId = context.UniqueId;

            ChildContent = await output.GetChildContentAsync();

            var content = await _html.PartialAsync("~/Views/Shared/_SelectPartial.cshtml", this);

            output.Content.SetHtmlContent(content);
            await base.ProcessAsync(context, output);

        }
    }
}
