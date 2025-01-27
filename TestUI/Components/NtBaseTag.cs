using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Newtonsoft.Json;

namespace TestUI.Components
{

    /// <exclude />
    public class NtBaseTag : TagHelper
    {
        public readonly IHtmlHelper _html;
        private readonly string _namespace = "testUI.components"; 

        protected virtual string ClassName { get; set; } = nameof(NtBaseTag);

        [JsonProperty]
        public virtual string? Id { get; set; }

        public virtual string? UniqueId { get; set; }

        [HtmlAttributeNotBound]
        [ViewContext]
        public ViewContext ViewContext { get; set; } = null!;

        public NtBaseTag(IHtmlHelper html)
        {
            _html = html;
        }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            RegisterScripts(output);
        }

        private void RegisterScripts(TagHelperOutput output)
        {         
            var str = $"<script type=\"module\">$(function() {{new {_namespace}.{GetScriptString()};}});</script>";
            output.Content.AppendHtml(str);
        }

        private string GetScriptString()
        {            
            return $"{ClassName}({JsonConvert.SerializeObject(this)})";
        }
    }
}
