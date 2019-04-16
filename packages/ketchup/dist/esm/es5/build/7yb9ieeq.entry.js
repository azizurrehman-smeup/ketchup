import*as tslib_1 from"../polyfills/tslib.js";import{h}from"../mycomponent.core.js";import{b as generateUniqueId}from"./chunk-31f65c6e.js";var KetchupFld=function(){function t(){this.config="",this.showSubmit=!1,this.submitLabel="",this.submitPos="right",this.label="",this.labelPos="left",this.propagate={},this.extensions={},this.radioGeneratedName=generateUniqueId("value"),this.currentValue=null,this.onChangeInstance=this.onChange.bind(this),this.onSubmitInstance=this.onSubmit.bind(this)}return t.prototype.updateInternalState=function(){var t,e=this;t="string"==typeof this.config&&this.config?JSON.parse(this.config):this.config;var n=Object.keys(t),i={};n.forEach(function(n){n in e?e[n]=t[n]:i[n]=t[n]}),this.propagate=i},t.prototype.componentWillLoad=function(){this.updateInternalState()},t.prototype.onChange=function(t){var e=t.detail.value;this.ketchupFldChanged.emit({originalEvent:t,oldValue:this.currentValue,value:e}),this.currentValue=e},t.prototype.onSubmit=function(t){this.ketchupFldSubmit.emit({originalEvent:t,value:this.currentValue})},t.prototype.getCurrentValue=function(){return tslib_1.__awaiter(this,void 0,void 0,function(){return tslib_1.__generator(this,function(t){return[2,this.currentValue]})})},t.prototype.render=function(){var t=[],e=null,n=null;this.label.trim().length&&(e=h("label",{class:"ketchup-fld__label ketchup-fld--"+this.labelPos},this.label)),this.showSubmit&&(n=h("ketchup-button",{class:"ketchup-fld__submit ketchup-fld--"+this.submitPos,label:this.submitLabel,onKetchupButtonClicked:this.onSubmitInstance}));var i="top"===this.labelPos,a="top"===this.submitPos;(i||a)&&t.push(h("div",{class:"ketchup-fld__top-container"},i&&e?e:null,a&&n?n:null)),!i&&e&&t.push(e);var s="",o={};switch(this.type){case"cmb":o.displayedField="value",o.valueField="value",o.onKetchupComboSelected=this.onChangeInstance,s="combo";break;case"rad":o.valueField="obj",o.radioName=this.radioGeneratedName,o.onKetchupRadioChanged=this.onChangeInstance,s="radio";break;case"itx":case"Itx":o.onKetchupTextInputUpdated=this.onChangeInstance,o.onKetchupTextInputSubmit=this.onSubmitInstance,s="text-input"}return t.push(h("ketchup-"+s,Object.assign({class:"ketchup-fld__component",items:this.data},o,this.propagate))),!a&&n&&t.push(n),t},Object.defineProperty(t,"is",{get:function(){return"ketchup-fld"},enumerable:!0,configurable:!0}),Object.defineProperty(t,"encapsulation",{get:function(){return"shadow"},enumerable:!0,configurable:!0}),Object.defineProperty(t,"properties",{get:function(){return{config:{type:String,attr:"config",watchCallbacks:["updateInternalState"]},data:{type:"Any",attr:"data"},extensions:{state:!0},getCurrentValue:{method:!0},label:{state:!0},labelPos:{state:!0},propagate:{state:!0},showSubmit:{state:!0},submitLabel:{state:!0},submitPos:{state:!0},type:{state:!0}}},enumerable:!0,configurable:!0}),Object.defineProperty(t,"events",{get:function(){return[{name:"ketchupFldChanged",method:"ketchupFldChanged",bubbles:!0,cancelable:!1,composed:!0},{name:"ketchupFldSubmit",method:"ketchupFldSubmit",bubbles:!0,cancelable:!1,composed:!0}]},enumerable:!0,configurable:!0}),Object.defineProperty(t,"style",{get:function(){return":host{display:-ms-flexbox;display:flex;-ms-flex-wrap:wrap;flex-wrap:wrap;--fld_comp-margin:var(--kup-fld_component-margin,8px)}.ketchup-fld__top-container{-ms-flex-align:center;align-items:center;display:-ms-flexbox;display:flex;-ms-flex-order:0;order:0;width:100%}.ketchup-fld__label{margin:var(--fld_comp-margin);-ms-flex-order:1;order:1}.ketchup-fld__label.ketchup-fld--right{-ms-flex-order:4;order:4}.ketchup-fld__component{margin:var(--fld_comp-margin);-ms-flex-order:3;order:3}.ketchup-fld__submit{margin:var(--fld_comp-margin);-ms-flex-order:2;order:2}.ketchup-fld__submit.ketchup-fld--right{-ms-flex-order:5;order:5}"},enumerable:!0,configurable:!0}),t}();export{KetchupFld};