function Voronoi(config) {
  for (var attrKey in config) {
    this[attrKey] = config[attrKey];
  }

  this.voronoi = d3.geom.voronoi()
    .clipExtent([[0, 0], [this.width, this.height]]);
  this.generateVertices();
  this.draw();
}

Voronoi.prototype.generateVertices = function() {
  var generateNewVertices = function() {
    return d3.range(this.points).map(function() {
      return [Math.random() * this.width, Math.random() * this.height];
    }.bind(this));
  }.bind(this);

  var addVertices = function() {
    this.vertices = this.vertices.concat(generateNewVertices());
  }.bind(this);

  var decreaseVertices = function() {
    this.vertices = this.vertices.slice(0, this.points);
  }.bind(this);

  if (this.vertices && this.pointsFixed) {
    if (this.pointsUp) addVertices();
    else decreaseVertices();
  } else {
    this.vertices = generateNewVertices();
  }
};

Voronoi.prototype.draw = function() {
  function svgPresent() {
    return d3.selectAll('svg')[0].length;
  }

  if (svgPresent() && this.isRerender) {
    this.svg.remove();
    this.generateVertices();
  }

  var redraw = function(isMousePoly) {
    var data;
    if (this.isVoronoi) {
      data = this.voronoi(this.vertices);
    } else {
      // Delaunay
      data = this.voronoi.triangles(this.vertices);
    }

    function polygon(d) { return 'M' + d.join('L') + 'Z'; }

    this.path = this.path.data(data, polygon);
    this.path.exit().remove();

    this.path.enter().append('path')
        .style('fill', function(d, i) {
          if (this.baseAlpha < 0) this.baseAlpha = 0;
          this.rangeControl = (1 - this.baseAlpha) / 10;
          var alpha = this.baseAlpha + (((i + 1) % 10) * this.rangeControl);

          if (alpha > 1) alpha = 1;
          if (alpha < 0) alpha = 0;

          if (isMousePoly && i === 0) {
            return this.hoverColor;
          } else {
            return 'rgba(0, 0, 0,' + alpha + ')';
          }
        }.bind(this))
        .attr('d', polygon);

    this.path.order();
  }.bind(this);

  var _self = this;

  this.svg = d3.select(this.container).append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .on('mousemove', function() {
        _self.vertices[0] = d3.mouse(this);
        redraw(true);
      });

  this.path = this.svg.append('g').selectAll('path');

  this.svg.selectAll('circle')
      .data(this.vertices.slice(1))
      .enter().append('circle')
      .attr('transform', function(d) { return 'translate(' + d + ')'; })
      .attr('r', this.pointRadius)
      .attr('fill', '#ccc')

  redraw();
};


var config1 = {
  container: '#voronoi-01',
  height: 780,
  width: 850,
  points: 30,
  pointRadius: 1,
  isVoronoi: true,
  pointsFixed: true,
  baseAlpha: 0.84,
  hoverColor: 'rgb(255, 255, 0)',
};

var config2 = {
  container: '#voronoi-02',
  height: 780,
  width: 850,
  points: 240,
  pointRadius: 1,
  isVoronoi: true,
  pointsFixed: true,
  baseAlpha: 0.84,
  hoverColor: 'rgb(255, 255, 0)',
};

var config3 = {
  container: '#voronoi-03',
  height: 780,
  width: 780,
  points: 30,
  pointRadius: 1,
  isVoronoi: false,
  pointsFixed: true,
  baseAlpha: 0.84,
  hoverColor: 'rgb(20, 20, 20)',
};

var config4 = {
  container: '#voronoi-04',
  height: 780,
  width: 780,
  points: 140,
  pointRadius: 1,
  isVoronoi: false,
  pointsFixed: true,
  baseAlpha: 0.2,
  hoverColor: 'rgb(20, 20, 20)',
};


new Voronoi(config1);
new Voronoi(config2);
new Voronoi(config3);
new Voronoi(config4);
