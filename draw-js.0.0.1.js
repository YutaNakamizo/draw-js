const drawJs = class {
  static createArea(element) {return new DrawArea(element);}
  static svgNS() {return "http://www.w3.org/2000/svg";}

  static calcControlPoint(p0,p1,p2) {
    const A = (p1.x-p0.x) * p2.y;
    const B = (p2.x-p0.x) * p1.y;
    const C = (p2.x-p1.x) * p0.y;
    //const x = p1.x * (A-B+C) / (A-B-C);
    //const y = ((x-p0.x)*p1.y + (x-p1.x)*p0.y) / (p1.x-p0.x);
    console.log(`
      p0: ${p0.x}, ${p0.y}
      p1: ${p1.x}, ${p1.y}
      p2: ${p2.x}, ${p2.y}
    `);

    const x
      = ((p1.x/(p2.x-p1.x)*(p2.y-p1.y))-(p0.x/(p1.x-p0.x)*(p1.y-p0.y))-p1.y+p0.y) / ((p2.y-p1.y)/(p2.x-p1.x)-(p1.y-p0.y)/(p1.x-p0.x));
    const rtnX = Number.isNaN(x) ? p1.x:x;

    const y
      = ((p1.y-p0.y)/(p1.x-p0.x))*(x-p0.x)+p0.y;
    const rtnY = Number.isNaN(y) ? p1.y:y;

    const rtn = {x:rtnX, y:rtnY, dx:rtnX-p0.x, dy:rtnY-p0.y};
    console.log(rtn);
    return rtn;
  }
};


/* CLASS `DrawArea` */
const DrawArea = class {
  constructor(parent) {
    /* Prepare Paren Element */
    if(!parent) {
      parent = document.createElement("div");
      parent.style.width = "800px";
      parent.style.height = "600px";
      parent.style.backgroundColor = "#eeeeee";
      document.body.appendChild(parent);
    }
    /* Prepare SVG Element */
    const parent_style = window.getComputedStyle(parent);
    const container = document.createElementNS(drawJs.svgNS(),"svg");
    container.setAttribute(
      "width",
      parent_style.width
    );
    container.setAttribute(
      "height",
      parent_style.height
    );
    container.setAttribute(
      "viewBox",
      `0,0,${parent_style.width.slice(0,-2)},${parent_style.height.slice(0,-2)}`
    );
    parent.appendChild(container);

    /* Add EventListener To SVG Container */
    const getPosition = (target,clientX,clientY)=>{
      const target_position = target.getBoundingClientRect();
      return {
        x: clientX - target_position.top + window.pageXOffset,
        y: clientY - target_position.left + window.pageYOffset
      };
    }

    container.addEventListener("touchstart",e=>{
      e.preventDefault();

      //window.prev_time = new Date();
      const position = getPosition(this.container,e.touches[0].clientX,e.touches[0].clientY);
      this.createPoint(position.x, position.y);
      const line = this.createLine().addPoint(position.x, position.y);
      this.currentLine = line;
    });
    container.addEventListener("touchmove",e=>{
      e.preventDefault();

      /*const curr_time = new Date();
      console.log((curr_time.getTime() - window.prev_time.getTime()));
      window.prev_time = curr_time;*/
      const position = getPosition(this.container,e.touches[0].clientX,e.touches[0].clientY);
      this.createPoint(position.x, position.y);
      this.currentLine.addPoint(position.x, position.y);
    });
    container.addEventListener("touchend",e=>{
      e.preventDefault();
      this.currentLine = null;
    });

    /* Set Class Object */
    this.class = "DrawArea";
    this.parent = parent;
    this.container = container;
    this.lines = new Array();
  }

  createPoint(x, y) {
    new Point(this.container, x, y);
    return this;
  }

  createLine() {
    const line = new Line(this.container);
    this.lines.push(line);
    return line;
  }


}

/* CLASS Point */
const Point = class {
  constructor(container, x, y) {
    const circle = document.createElementNS(drawJs.svgNS(), "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 1.5);
    circle.setAttribute("stroke", "transparent");
    circle.setAttribute("fill", "#ff0000");

    container.appendChild(circle);

    this.class = "Point";
    this.positionX = x;
    this.positionY = y;
  }
}


/* CLASS Line */
const Line = class {
  constructor(container, options) {
    this.class = "Line";
    this.container = container;
    this.points = [];
    this.controlPoints = [];
    this.path = [];
    this.options = options;
  }

  addPoint(x,y) {
    if(this.points.length === 0) { // This is just adding a point.
      this.points.push({x:x,y:y});
      return this;
    }

    const prev_point = this.points[this.points.length-1];
    const dx = x - prev_point.x;
    const dy = y - prev_point.y;

    if(this.points.length >= 2) { // modify the control point of previous path
      const prev_path = this.path[this.path.length-1];

      const p0 = this.points[this.points.length-2];
      const p1 = prev_point;
      const p2 = {x:x,y:y}

      const control_point = drawJs.calcControlPoint(p0,p1,p2);
      prev_path.setAttribute(
        'd',
        `M ${p0.x} ${p0.y} q ${control_point.dx} ${control_point.dy} ${p1.x-p0.x} ${p1.y-p0.y}`
      );
      
      const dot = document.createElementNS(drawJs.svgNS(),"circle");
      dot.setAttribute("stroke","#00ff00");
      dot.setAttribute("fill","transparent");
      dot.setAttribute("r","1.5");
      dot.setAttribute("cx",control_point.x);
      dot.setAttribute("cy",control_point.y);
      this.container.appendChild(dot);
    }
    
    // calc new path; NOTE: new_path is a strait line.
    const new_path = document.createElementNS(drawJs.svgNS(),"path");
    new_path.setAttribute(
      'd',
      `M ${prev_point.x} ${prev_point.y} l ${dx} ${dy}`
    );

    // In the future: this.options will be abailable.
    new_path.setAttribute(
      "stroke",
      "#000000"
    );
    new_path.setAttribute(
      "fill",
      "transparent"
    );
    
    this.container.appendChild(new_path);

    this.points.push({x:x,y:y, dx:dx,dy:dx});
    this.path.push(new_path);
    return this;
  }
}
