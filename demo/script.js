document.addEventListener("DOMContentLoaded",()=>{
  const test_area = drawJs.createArea();
  test_area.addEventListener("touchstart",(e,pos)=>{
    window.line = test_area.createLine().addPoint(pos.x,pos.y);
    test_area.createPoint(pos.x,pos.y, {r:3});
  }, true);
  test_area.addEventListener("touchmove", (e,pos)=>{
    test_area.createPoint(pos.x,pos.y, {r:3});
    window.line.addPoint(pos.x, pos.y);
  }, true);


  demoPlot(
    test_area,
    [
      {x:100, y:100},
      {x:120, y:80},
      {x:140, y:20},
      {x:120, y:10},
      {x:100, y:7},
      {x:80, y:5},
      {x:60, y:25},
      {x: 80, y:62},
      {x:100, y:100}
    ]
  );
});


const demoPlot = (area, points)=>{
  const line = area.createLine();
  for(let p of points) {
    area.createPoint(p.x,p.y, {r:3});
    line.addPoint(p.x,p.y);
  }
};
