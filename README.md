Tagly
===

Tagly is a tag input component in which provides lots of features and easiness.

## Table of Contents

<!--ts-->
* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [Options](#options)
* [Methods](#methods)
<!--te-->

## Features
* Supports mixed (tags and text) and tag-only input 
* Allows read-only prop for tags
* Disallows duplicated tags
* Supports tag insertion from external events 
* Even Tagly loses focuses, external tags can be added wherever your caret is
* Supports allowed-tags (whitelist)
* Tags can be editable


### Installation

```
npm install --save tagly
```
### Usage

```javascript
import {Tagly} from 'tagly'

var tagly = new Tagly({
  ...options
})
```
### Options

Option | Type | Default | Description
--- | --- | --- | ---
|[`mixed`](#mixedOption) | `Boolean` | `true` | Input mode whether it is tag and text together or tag-only
|[`duplicate`](#duplicateOption) | `Boolean` | `true` | Boolean value to control whether multiple same tag is allowed or not
|[`defaultValue`](#defaultValueOption) | `Array/String` | `""` | Default Tags/Texts as starting values
|[`allowedTags`](#allowedTagsOption) | `Array` | `[]` | Specifies which tags are allowed on input
|[`readOnly`](#readOnlyOption) | `Boolean` | `true` | Boolean value to enable whether tags can be editable or not
|[`containerClassName`](#containerClassNameOption) | `String` | `undefined` | A container class name where tagly will append to
|[`changeHandler`](#changeHandlerOption) | `Function` | `undefined` | Function called when tag input change which returns parsed input values

<a name="mixedOption"></a>
##### mixed (optional, defaults to `true`)
Input behavior can be changed by "mixed" option. Either it can be used with tag and text together or it could be utilized as tag-only.
Tags are created with curly braces `{string}` in mixed mode. When it is false, tags are added pressing Enter. 

<a name="duplicateOption"></a>
##### duplicate (optional, defaults to `true`)
Duplicate option allows or disallows tags to be created more than one.

<a name="defaultValueOption"></a>
##### defaultValue (optional, defaults to `""`)
Preferred value to be inserted as a starting value.

<a name="allowedTagsOption"></a>
##### allowedTags (optional, defaults to `[]`)
A whitelist in which only specified tag data will be represented as tag. If a tag data does not exist in list, it will be treated as a string.
Tagly does not accept any kind of data structure. It must contain **label** and **value**. 

```javascript
const options = {
  //...options
  allowedTags = [{
    label: "First Tag", value:"first_tag",
    label: "Second Tag", value: "second_tag"
  }]
 }
```

<a name="readOnlyOption"></a>
##### readOnly (optional, defaults to `true`)
Either you can edit tag by double clicking or they just stay as it is.

<a name="containerClassNameOption"></a>
##### containerClassName (optional, defaults to `undefined`)
Tagly will be inserted specified containerClassName.

<a name="changeHandlerOption"></a>
##### changeHandler (optional, defaults to `undefined`)
A change listener which will be fired any change to the input value has occured. It has one string parameter


```javascript
const changeHandler = (newValues) => {
		...do something
}

const options = {
  //...options
  changeHandler
 }
```
### Methods

Name | Parameters | Description
--- | --- | ---
|[`addExternalTag`](#addExternalTagMethod) | `String` tag to add | Injects Text or Tag last saved caret position

<a name="addExternalTagMethod"></a>
##### addExternalTag
Tag will be inserted at last saved caret position. 


```javascript
var tagly = new Tagly({
  ...options
})

tagly.addExternalTag('tagToBeAdded')
```
