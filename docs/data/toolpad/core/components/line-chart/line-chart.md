---
productId: toolpad-core
title: Line Chart
components: LineChart
---

# Line Chart

<p class="description">Line Chart component for Toolpad Core applications.</p>

Toolpad Core extends X Charts with data provider support. Toolpad Core charts automatically load data and adopt defaults for labels and formatting.

## Basic example

Add a data provider to a chart and its data is automatically loaded in the chart.

{{"demo": "BasicLineChart.js"}}

Error and loading states are automatically handled. Errors from the data provider are shown in an overlay:

{{"demo": "ErrorLineChart.js", "hideToolbar": true}}

## Customization

The chart automatically adopts configuration from the data provider. When you pick a `dataKey` for an axis or a series, the chart automatically infers default values for series and axis options. The Toolpad Core components accept all properties that the X components offer. SO to customize the chart further, you can override these defaults and add extra options as you need.

{{"demo": "CustomizedLineChart.js"}}
