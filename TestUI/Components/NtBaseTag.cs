﻿using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Newtonsoft.Json;
using System.ComponentModel;

namespace TestUI.Components
{

    /// <exclude />
    [EditorBrowsable(EditorBrowsableState.Never)]
    public class NtBaseTag : TagHelper
    {
        public readonly IHtmlHelper _html;
        private readonly string _namespace = "testUI.components"; 

        /// <summary>
        /// The ClassName for the generated script.
        /// </summary>
        protected virtual string ClassName { get; set; } = nameof(NtBaseTag);

        /// <summary>
        /// The ID to be applied to the component.
        /// </summary>
        [JsonProperty]
        public virtual string? Id { get; set; }

        /// <summary>
        /// The Unique ID for this componenet generated by the Context.
        /// </summary>
        [HtmlAttributeNotBound]
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
