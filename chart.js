function chart(d3, techan, csvData, vwidth, vheight) {
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
			
	var fullheight = height + margin.top + margin.bottom;
	var fullwidth = width + margin.left + margin.right;

	var cheight = fullheight / vheight * fullheight;
	var cwidth = fullwidth / vwidth * fullwidth;		

	var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");

    var x = techan.scale.financetime()
            .range([0, width])
            .outerPadding(0);

    var y = d3.scaleLinear()
            .range([height, 0]);

    var close = techan.plot.close()
            .xScale(x)
            .yScale(y);

    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y);

    
    

	
	var accessor = close.accessor();

	var data = csvData.map(function(d) {
		return {
			date: parseDate(d.date),
			open: +d.temp_reg,
			high: +d.temp_reg,
			low: +d.temp_reg,
			close: +d.temp_reg,
			volume: +d.temp_reg
		};
	}).sort(function(a, b) { return d3.ascending(accessor.d(a), accessor.d(b)); });

	

       

    return function(g) {
		var svg = g.append("svg")
		.attr("version", "1.1")
        .attr("xmlns", "http://www.w3.org/2000/svg")
		.attr("width", fullwidth)
        .attr("height", fullheight)
		.attr("viewBox", "0 0 " + fullwidth + " " + fullheight)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		 
		 svg.append("g")
                .attr("class", "close");

        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")");

        svg.append("g")
                .attr("class", "y axis")
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Temperatura Cº");
		 
        x.domain(data.map(close.accessor().d));
        //y.domain(techan.scale.plot.ohlc(data, close.accessor()).domain());
		y.domain([0.00,40.00]);
        svg.selectAll("g.close").datum(data).call(close);
        svg.selectAll("g.x.axis").call(xAxis);
        svg.selectAll("g.y.axis").call(yAxis);
    }
}

// If we're in node
if(typeof module === 'object') {
  // Expose the chart
  module.exports = chart;
}