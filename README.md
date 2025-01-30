# Getting Started
1. Install the TurnisUITest Nuget package.<br/>
2. Add the following to your ```_ViewImports.cshtml```
```
@addTagHelper *, TestUI
```
3. Include the required stylesheet and script to your ```_Layout.cshtml``` inside of the ```<head>``` tag
```
<link rel="stylesheet" href="/_content/TurnisUITest/css/testui.css" asp-append-version="true"/> 
<script type="module" src="/_content/TurnisUITest/js/Base.js"></script>
```


# Components
[AutoComplete](#autocomplete)


## AutoComplete
### Usage
```
<nt-autocomplete id="MyFirstAutocomplete"
                 label="Person"
                 placeholder="Select a person"
                 items="Model.People"
                 value-property="Id"
                 display-property="FirstName" />
```
In the above example, we declare the AutoComplete that uses a ```List<People>``` as the data source. We specify the property name in the ```People``` class to use as the selected item's value (```Id```) and the text (```FirstName```) to show in the dropdown list.
> [!NOTE]
> When <code>Items</code> is provided, a <code>value-property</code> must be specified.

### Getting the Selected Value
The selected value will be serialized in a form with the name based on the required ```id``` property.<br/>
You can also grab the value in JavaScript like a normal ```<input />``` tag:
```
let val = $("#MyFirstAutocomplete").val();
```

### Parameters
| Parameter Name  | Type | Default | Description |
| ------------- | ------------- | ------------- | ------------- |
| ```disabled``` | bool | false | Disable the input and dropdown toggles. |
| ```display-property``` | string | null | The property each item will use as its display text. |
| ```fetch-server-on-load``` | bool | false | When the component is initialized, a call is made to ```search-url``` with an empty value. |
| ```floating-label``` | bool | false | Use Bootstrap's floating labels. A label and placeholder is required. |
| ```id```  | string | null | The ID to for the AutoComplete. Used to grab the value. |
| ```items``` | ```IEnumerable``` of string,<br/> int,<br/> object | null | A list of items to bind this AutoComplete to.<br/> Required when no ```search-url``` is defined. |
| ```label``` | string | null | The label for the input. |
| ```placeholder``` | string | null | The placeholder to display when nothing is selected or inputted. |
| ```required``` | bool | false | Make this AutoComplete required in forms. |
| ```search-delay``` | int | 150 | The time in milliseconds from when input is received to when the search is made. |
| ```search-url``` | string | null | The URL (typically a controller action) to fetch data upon input.<br/>A parameter <code>string searchVal</code> is required in the controller method.<br/><sub>Ex: "/Home/SearchPeople"<br/></sub> |
| ```size``` | small,<br/>medium,<br/>large | medium | The size of the rendered input. |
| ```start-icon``` | string | null | Icon to show in front of input. Only accepts Bootstrap's Icon Web Font class name. <br/> For example: bi bi-microsoft |
| ```value``` | string,<br/>int,<br/>object | null | The inital value given to the AutoComplete.<br/> Depending on the given ```items```, it can be a primitive or an object. |
| ```value-property``` | string | null | The property for which each item's value is set to.<br/> This is the value sent upon form submission. |
| ```virtualize``` | bool | false | Virtualizes the list so only visible items are rendered to improve performance on large datasets. |
















