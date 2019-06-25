const drawJs = class {
  static createArea(element) {return new DrawArea(element);}
  static svgNS() {return "http://www.w3.org/2000/svg";}

  static calcControlPoint(p_k2, p_k1, p_k) {
    // bector of 2 lines based on p_k1
    const vA = {
      x: p_k2.x - p_k1.x,
      y: p_k2.y - p_k1.y
    };
    const vB = {
      x: p_k.x - p_k1.x,
      y: p_k.y - p_k1.y
    };

    // cos(alpha), sin(alpha), alpha, beta, phi, sin(phi), cos(phi) 
    let cosAlpha = (vA.x*vB.x + vA.y*vB.y) / (Math.sqrt(Math.pow(vA.x,2)+Math.pow(vA.y,2)) * Math.sqrt(Math.pow(vB.x,2)+Math.pow(vB.y,2)));
    if(cosAlpha<-1) cosAlpha = -1;
    else if(1<cosAlpha) cosAlpha = 1;

    const sinAlpha = Math.sqrt(1 - Math.pow(cosAlpha,2));

    //console.log(`cosAlpha: ${cosAlpha}`)
    const alpha = Math.acos(cosAlpha);
    const beta = alpha<(Math.PI/4) ? (Math.sin(2*alpha)) : Math.PI;//((1+Math.sin(alpha-(Math.PI/2)))*Math.PI/2);
    const phi = (beta-alpha) / 2;

    //console.log(`alpha: ${alpha/Math.PI*180}\nbeta: ${beta/Math.PI*180}`)

    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    // l/L
    const l_L = (1 + 3*Math.cos(alpha/2)) / 4;//1-alpha/Math.PI;
    console.log(`l/L: ${l_L}`);

    // c2_k2
    const dx_k2 = p_k2.x - p_k1.x;
    const dy_k2 = p_k2.y - p_k1.y;
    const c2_k2_k1 = {
      x: l_L * (dx_k2*cosPhi + dy_k2*sinPhi) + p_k1.x,
      y: l_L * (- dx_k2*sinPhi + dy_k2*cosPhi) + p_k1.y
    };
    // c1_k1
    const dx_k = p_k.x - p_k1.x;
    const dy_k = p_k.y - p_k1.y;
    const c1_k1_k = {
      x: l_L * (dx_k*cosPhi - dy_k*sinPhi) + p_k1.x,
      y: l_L * (dx_k*sinPhi + dy_k*cosPhi) + p_k1.y
    };

    return [{
      x: c2_k2_k1.x,
      y: c2_k2_k1.y,
      dx: c2_k2_k1.x - p_k2.x,
      dy: c2_k2_k1.y - p_k2.y
    }, {
      x: c1_k1_k.x,
      y: c1_k1_k.y,
      dx: c1_k1_k.x - p_k1.x,
      dy: c1_k1_k.y - p_k1.y
    }];
  }
};


/* CLASS `DrawArea` */
const DrawArea = class {
  constructor(parent) {
    /* Prepare Paren Element */
    if(!parent) {
      parent = document.createElement("div");
      parent.style.width = "90vw";
      parent.style.height = "90vh";
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

    /* Set Class Object */
    this.class = "DrawArea";
    this.parent = parent;
    this.container = container;
    this.lines = [];
  }

  addEventListener(eventName, callback, preventDefault) {
    this.container.addEventListener(eventName, e=>{
      if(preventDefault) e.preventDefault();


      const getPosition = (target,clientX,clientY)=>{
        const target_position = target.getBoundingClientRect();
        return {
          x: clientX - target_position.top + window.pageXOffset,
          y: clientY - target_position.left + window.pageYOffset
        };
      }

      callback(e, getPosition(this.container, e.touches[0].clientX, e.touches[0].clientY));
    });
  }

  createPoint(x, y, options) {
    new Point(this.container, x, y, options);
    return this;
  }

  createLine(options) {
    const line = new Line(this.container, options);
    this.lines.push(line);
    return line;
  }


}

/* CLASS Point */
const Point = class {
  constructor(container, x, y, options) {
    if(!options) options = {};

    const circle = document.createElementNS(drawJs.svgNS(), "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", options.r || 1.5);
    circle.setAttribute("stroke", options.stroke || "transparent");
    circle.setAttribute("fill", options.fill || "#ff0000");

    //console.log(`x: ${x}\ny: ${y}`);
    container.appendChild(circle);

    this.class = "Point";
    this.positionX = x;
    this.positionY = y;
  }
}


/* CLASS Line */
const Line = class {
  static createPathAttribute(o) {
    return `M ${o.points[0].x} ${o.points[0].y} c ${o.controls[0].dx} ${o.controls[0].dy} ${o.controls[1].dx} ${o.controls[1].dy} ${o.points[1].dx} ${o.points[1].dy}`;
  }

  constructor(container, options) {
    this.class = "Line";
    this.points = [];
    this.path = [];
    this.container = container;
    this.options = options;
  }

  addPoint(x,y) {
    if(this.points.length === 0) {
      this.points.push({x:x, y:y, dx:0, dy:0});
      return this;
    }
    else if(this.points.length === 1) {
      const p_0 = this.points[0];
      const dx = x - p_0.x;
      const dy = y - p_0.y;

      const path = document.createElementNS(drawJs.svgNS(),"path");
      path.setAttribute("fill", "transparent");
      path.setAttribute("stroke", "#000000");
      path.setAttribute(
        'd',
        `M ${p_0.x} ${p_0.y }l ${dx} ${dy}`
      );

      this.path.push({
        object: path,
        points: [{
          x: p_0.x,
          y: p_0.y,
          dx: 0,
          dy: 0
        }, {
          x: x,
          y: y,
          dx: dx,
          dy: dy
        }],
        controls: [{
          x: p_0.x,
          y: p_0.y,
          dx: 0,
          dy: 0
        }, {
          x: x,
          y: y,
          dx: dx,
          dy: dy
        }]
      });
      this.points.push({x:x, y:y, dx:dx, dy:dy});
      this.container.appendChild(path);

      return this;
    }
    
    const p_k2 = this.points[this.points.length-2];
    const p_k1 = this.points[this.points.length-1];
    const p_k = {x:x, y:y, dx:x-p_k1.x, dy:y-p_k1.y};

    const controls = drawJs.calcControlPoint(p_k2, p_k1, p_k);

    const l_k2_k1 = this.path[this.path.length-1];
    const l_k1_k = {
      object: document.createElementNS(drawJs.svgNS(),"path"),
      points: [{
        x: p_k1.x,
        y: p_k1.y,
        dx: p_k1.dx,
        dy: p_k1.dy
      }, {
        x: p_k.x,
        y: p_k.y,
        dx: p_k.dx,
        dy: p_k.dy
      }],
      controls: [{
        x: controls[1].x,
        y: controls[1].y,
        dx: controls[1].dx,
        dy: controls[1].dy
      }, {
        x: p_k.x,
        y: p_k.y,
        dx: p_k.dx,
        dy: p_k.dy
      }]
    };
    l_k1_k.object.setAttribute("fill", "transparent");
    l_k1_k.object.setAttribute("stroke", "#000000");

    l_k2_k1.controls[1] = this.path[this.path.length-1].controls[1] = controls[0];
    l_k2_k1.object.setAttribute('d', Line.createPathAttribute(l_k2_k1));
    l_k1_k.object.setAttribute('d', Line.createPathAttribute(l_k1_k));
    
    this.path.push(l_k1_k);
    this.points.push(p_k);
    this.container.appendChild(l_k1_k.object);

    return this;
  }
}
