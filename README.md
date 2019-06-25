# draw-js
Create vector lines from touch event on JavaScript.

## Note:
This script is written on ES6. If you want to use this on browsers which do not support ES6, you have to convert with Babel by yourself.

## Contact

Twitter: [@NakamizoYuta](https://twitter.com/NakamizoYuta)
Email: [yuta.nakamizo@ggtk.app](mailto:yuta.nakamizo@ggtk.app)


## How to use 
### 1. Import `draw-js`.

```html
<script src="https://www.ggtk.dev/draw-js/draw-js.min.js"></script>
```

### 2. Setup drwa-area

Create a draw-area with `drawJs.createArea(<void>)`.  
This returns `DrawArea` object.

```javascript
const init = ()=>{
  const draw_area = drawJs.createArea();
};


document.addEventListener("DOMContentLoaded", init);
```
### 3. Plot a point

You can use `<DrawArea>.createPoint(x, y, options)` method.

`x` and `y` is the position of the point, which is based on the left-top corner of the draw-area.

`options` can include `r`, which means the radius of the point, `stroke`, which means the color of the point's stroke, and `fill`, which means the color of the point.  
Default setting is `r:1.5, stroke:"transparent", fill:"#ff0000"`.

### 4. Draw a line

First, create `Line` object, then add start point.

```javascript
window.line = draw_area.createLine().addPoint(x, y);
```

Next, add a point. Then a fluently line is drawn. You can check how to add points from user's touch event on "5. Add event-listener". 


### 5. Add event-listener

`DrawArea` class have `addEventListener(eventName, callback, preventDefault)` method.
This method passes 2 arguments `Event` and `Position` to callback function.
`Position` includes `x` and `y` proparties which provides the position of the point which user touches.
Note that this position is based on the draw-area. You have to use this position to create lines or points on the area.

When you set `preventDefalut` to `true`, the default operations such as scroll, zoom on the area is ignored.  
I recommend you to set this true if you don't have any special reasons.

```javascript
const init = ()=>{
  const draw_area = drawJs.createArea();

  draw_area.addEventListener("touchstart",(e,pos)=>{
    window.line = test_area.createLine().addPoint(pos.x,pos.y);
    test_area.createPoint(pos.x,pos.y, {r:3});
  }, true);

  draw_area.addEventListener("touchmove", (e,pos)=>{
    test_area.createPoint(pos.x,pos.y, {r:3});
    window.line.addPoint(pos.x, pos.y);
  }, true);
};


document.addEventListener("DOMContentLoaded", init);
```

