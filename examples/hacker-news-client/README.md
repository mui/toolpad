# Hacker News client

Toolpad application that demonstrates writing an alternative [Hacker News](https://news.ycombinator.com/news) client

[Open in CodeSandbox](https://codesandbox.io/p/sandbox/github/mui/mui-toolpad/tree/master/examples/hackernews-client)

Create a panel that can show the page hierarchy as a tree and allows selecting/reordering page nodes.

Benchmark:
https://getshogun.com/help/en/articles/1821780-using-the-layout-tab-to-view-page-structure

Retool
![Image](https://user-images.githubusercontent.com/92228082/185237516-0f1a5748-7e49-4fbe-854d-4c804778beb6.png)

### Shaping:

Must haves:

- left sidebar, vertical split, bottom panel will be a tree view
- Will try to use MUI lab TreeView component
- All DOM elements of current page
- We indicate the selected element, and allow selecting from this view
- Do we show rows and columns?
  - Let's show them and evaluate
- upon selection, expand the subtree that contains the selection, scroll into view
- To display nested children:
  - if the prop is `children` then we just nest them as the children of the component
  - if the prop is anything else we add an item in between with the name of the prop

e.g.

```
Container:
  Paper:
    Button
    Text
Container:
  List:
    *renderItems*:
       Row:
         Button
         Text
```

Secondary:

- icons: Let's match the icons from the component catalog
- delete elements
- drag to reorder
- double-click to rename
