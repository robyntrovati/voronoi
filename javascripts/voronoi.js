function Voronoi(config) {
  for (var attrKey in config) {
    this[attrKey] = config[attrKey];
  }

    console.log(d3);

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

  var redraw = function() {
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
          return 'rgba(0,0,0,' + alpha + ')';
        }.bind(this))
        .attr('d', polygon);

    this.path.order();
  }.bind(this);

  var _self = this;

  this.svg = d3.select('#voronoi').append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .on('mousemove', function() {
        _self.vertices[0] = d3.mouse(this);
        redraw();
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


var config = {
  height: 800,
  width: 800,
  points: 20,
  pointRadius: 1.5,
  isVoronoi: false,
  pointsFixed: true,
  baseAlpha: 0.84,
};

new Voronoi(config);
