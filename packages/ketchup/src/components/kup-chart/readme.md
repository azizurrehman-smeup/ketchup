# kup-chart



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute           | Description                                                                                                                                                                           | Type                               | Default            |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------ |
| `asp`             | `asp`               | Sets the chart to a 2D or 3D aspect. 3D only works for Pie graphs.                                                                                                                    | `ChartAspect.D2 \| ChartAspect.D3` | `undefined`        |
| `axis`            | `axis`              | Sets the axis of the chart.                                                                                                                                                           | `string`                           | `undefined`        |
| `colors`          | --                  | Colors of the chart.                                                                                                                                                                  | `string[]`                         | `[]`               |
| `customStyle`     | `custom-style`      | Custom style of the component. For more information: https://ketchup.smeup.com/ketchup-showcase/#/customization.                                                                      | `string`                           | `undefined`        |
| `data`            | --                  | The actual data of the chart.                                                                                                                                                         | `DataTable`                        | `undefined`        |
| `graphTitle`      | `graph-title`       | Title of the graph.                                                                                                                                                                   | `string`                           | `undefined`        |
| `graphTitleColor` | `graph-title-color` | Title of the graph's color.                                                                                                                                                           | `string`                           | `undefined`        |
| `graphTitleSize`  | `graph-title-size`  | Size of title of the graph (in pixels).                                                                                                                                               | `number`                           | `undefined`        |
| `hAxis`           | --                  | Customize the hAxis.                                                                                                                                                                  | `ChartAxis`                        | `undefined`        |
| `legend`          | `legend`            | Sets the position of the legend. Supported values: bottom, labeled, left, none, right, top. Keep in mind that legend types are tied to chart types, some combinations might not work. | `string`                           | `'right'`          |
| `offlineMode`     | --                  | Renders charts without the Google API and using jQuery Sparkline.                                                                                                                     | `ChartOfflineMode`                 | `undefined`        |
| `series`          | --                  | The data series to be displayed. They must be of the same type.                                                                                                                       | `ChartSerie[]`                     | `undefined`        |
| `showMarks`       | `show-marks`        | Displays the numerical values.                                                                                                                                                        | `boolean`                          | `false`            |
| `sizeX`           | `size-x`            | The width of the chart, defaults to 100%. Accepts any valid CSS format (px, %, vw, etc.).                                                                                             | `string`                           | `'100%'`           |
| `sizeY`           | `size-y`            | The height of the chart, defaults to 100%. Accepts any valid CSS format (px, %, vh, etc.).                                                                                            | `string`                           | `'100%'`           |
| `stacked`         | `stacked`           | Displays the data columns of an object on top of each other.                                                                                                                          | `boolean`                          | `false`            |
| `types`           | --                  | The type of the chart. Supported formats: Area, Bubble, Cal, Candlestick, Combo, Geo, Hbar, Line, Ohlc, Pie, Sankey, Scatter, Unk, Vbar.                                              | `ChartType[]`                      | `[ChartType.Hbar]` |
| `vAxis`           | --                  | Customize the vAxis.                                                                                                                                                                  | `ChartAxis`                        | `undefined`        |
| `version`         | `version`           | Google chart version to load                                                                                                                                                          | `string`                           | `'45.2'`           |


## Events

| Event             | Description                             | Type                             |
| ----------------- | --------------------------------------- | -------------------------------- |
| `kupChartClicked` | Triggered when a chart serie is clicked | `CustomEvent<ChartClickedEvent>` |


## Methods

### `refreshCustomStyle(customStyleTheme: string) => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [kup-box](../kup-box)
 - [kup-card](../kup-card)
 - [kup-data-table](../kup-data-table)
 - [kup-tree](../kup-tree)

### Graph
```mermaid
graph TD;
  kup-box --> kup-chart
  kup-card --> kup-chart
  kup-data-table --> kup-chart
  kup-tree --> kup-chart
  style kup-chart fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
