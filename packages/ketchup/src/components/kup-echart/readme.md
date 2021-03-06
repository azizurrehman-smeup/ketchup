# kup-echarts



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description                                                                                                                                                            | Type          | Default     |
| ------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------- |
| `axis`        | `axis`         | Sets the axis of the chart.                                                                                                                                            | `string`      | `''`        |
| `chartTitle`  | --             | Title of the graph.                                                                                                                                                    | `EchartTitle` | `undefined` |
| `customStyle` | `custom-style` | Custom style of the component. For more information: https://ketchup.smeup.com/ketchup-showcase/#/customization.                                                       | `string`      | `undefined` |
| `data`        | --             | The actual data of the chart.                                                                                                                                          | `object`      | `{}`        |
| `legend`      | `legend`       | Sets the position of the legend. Supported values: bottom, left, right, top. Keep in mind that legend types are tied to chart types, some combinations might not work. | `string`      | `undefined` |
| `mapType`     | `map-type`     | choose which map you want to view. europe, africa, asia, oceania, america, world. you can also switch to json data to form a custom map                                | `any`         | `undefined` |
| `series`      | --             | The data series to be displayed. They must be of the same type.                                                                                                        | `string[]`    | `undefined` |
| `types`       | --             | The type of the chart. Supported formats: Line, Pie, Map, Scatter                                                                                                      | `String[]`    | `['Line']`  |


## Events

| Event              | Description | Type               |
| ------------------ | ----------- | ------------------ |
| `kupEchartClicked` |             | `CustomEvent<any>` |


## Methods

### `refreshCustomStyle(customStyleTheme: string) => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
