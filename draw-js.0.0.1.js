const drawJs = class {
  static createArea(element) {return new DrawArea(element);}
  static svgNS() {return "http://www.w3.org/2000/svg";}
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
      console.log(`x: ${position.x}\ny: ${position.y}`);
      this.createPoint(position.x, position.y);
      const line = this.createLine(position.x, position.y);
      this.currentLine = line;
    });
    container.addEventListener("touchmove",e=>{
      e.preventDefault();

      /*const curr_time = new Date();
      console.log((curr_time.getTime() - window.prev_time.getTime()));
      window.prev_time = curr_time;*/
      const position = getPosition(this.container,e.touches[0].clientX,e.touches[0].clientY);
      console.log(`x: ${position.x}\ny: ${position.y}`);
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

  createLine(x, y) {
    const line = new Line(this.container, x, y);
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

    console.log(`x: ${x}\ny: ${y}`);
    container.appendChild(circle);

    this.class = "Point";
    this.positionX = x;
    this.positionY = y;
  }
}


/* CLASS Line */
const Line = class {
  constructor(container, x, y, options) {
    const path = document.createElementNS(drawJs.svgNS(),"path");
    path.setAttribute(
      "d",
      `M${x} ${y}`
    );
    // In the Future: Set Options (like Styles).
    path.setAttribute(
      "stroke",
      "#000000"
    );
    path.setAttribute(
      "fill",
      "transparent"
    );

    container.appendChild(path);

    this.class = "Line";
    this.points = [{x:x,y:y}];
    this.deltaPoints = [{dx:0,dy:0}];
    this.path = path;
  }

  addPoint(x,y) {
    const prev_point = this.points[this.points.length-1];
    const dx = x - prev_point.x;
    const dy = y - prev_point.y;
    this.points.push({x:x, y:y});
    this.deltaPoints.push({dx:dx, dy:dy});

    const prev_path_d = this.path.getAttribute("d");
    switch(this.points.length) {
      case 2: // Create Simple Line
        this.path.setAttribute(
          "d",
          prev_path_d + ` l ${dx} ${dy}`
        );
        break;
      case 3: // Create First Control-Points
        const p = this.points;
        const dX12 = p[1].x - p[0].x;
        const dY12 = p[1].y - p[0].y;
        const dX23 = p[2].x - p[1].x;
        const dY23 = p[2].y - p[1].y;
        const at = ((dY12/dX12) + (dY23/dX23))/2;
        const an = dX12/dY12;
        const m12 = {x:(p[0].x+p[1].x)/2, y:(p[0].y+p[1].y)/2};
        const control_x = ((m12.y - p[1].y) - (an*m12.x - at*p[1].x)) / (at-an);
        const control_y = an*control_x + m12.y - an*m12.x;
        const delta_control_x = control_x - p[0].x;
        const delta_control_y = control_y - p[0].y;
        this.path.setAttribute(
          "d",
          `M${p[0].x} ${p[0].y} q ${delta_control_x} ${delta_control_y} ${dx} ${dy}`
        );
        this.controlPoint = {x:control_x, y:control_y};
        this.deltaControlPoint = {dx:delta_control_x, dy:delta_control_y};
        break;
      default: // Only Add Point
        this.path.setAttribute(
          "d",
          prev_path_d + ` t ${dx} ${dy}`
        );
        break;
    }
    /*this.path.setAttribute(
      "d",
      prev_path_d + ` l ${dx} ${dy}`
    );*/
    return this;
  }
}
