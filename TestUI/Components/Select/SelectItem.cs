using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace TestUI.Components.Select
{

    /// <summary>
    /// A list item inside a select.
    /// </summary>
    /// <param name="htmlHelper"></param>
    [JsonObject(MemberSerialization.OptIn)]
    [HtmlTargetElement("nt-select-item")]
    public class SelectItem(IHtmlHelper htmlHelper) : NtBaseTag(htmlHelper)
    {

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {

            output.TagName = "div";
            output.Attributes.SetAttribute("class", "dropdown-item py-1 d-flex justify-content-between nt-select-dropdown-item");

            var item = $@"
                <span class=""nt-autocomplete-dropdown-item-text"">{(await output.GetChildContentAsync()).GetContent()}</span>
                <span class=""float-end check-icon"" style=""display: none;""><i class=""bi bi-check-lg""></i></span>
                   ";

            

            output.Content.SetHtmlContent(item);

        }

    }
}
