        // Chart dimensions
        const width = 600, height = 290, radius = Math.min(width, height) / 2;

        // Create the main SVG container
        const svgpie = d3.select("#pieChart")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        // Groups for slices, labels, and lines
        svgpie.append("g").attr("class", "slices");
        svgpie.append("g").attr("class", "labels");
        svgpie.append("g").attr("class", "lines");

        // Pie and arc generators
        const pie = d3.pie()
            .sort(null)
            .value(d => d.value);

        const arc = d3.arc()
            .outerRadius(radius * 0.8)
            .innerRadius(radius * 0.4);

        const outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);

        // Color scale
        const color = d3.scaleOrdinal()
            .domain(["Allowed", "Blocked"])
            .range(["#A7C957", "#C1121F"]);

        // Fetch data
        function fetchData() {
            const dummyData = { allowed: Math.random() * 100, blocked: Math.random() * 100 };
            const formattedData = [
                { label: "Allowed", value: dummyData.allowed },
                { label: "Blocked", value: dummyData.blocked }
            ];
            updateChart(formattedData);
        }

        // Update chart
        function updateChart(data) {
            // Pie slices
            const slice = svgpie.select(".slices").selectAll("path.slice")
                .data(pie(data));

            slice.enter()
                .append("path")
                .attr("class", "slice")
                .style("fill", d => color(d.data.label))
                .merge(slice)
                .transition().duration(1000)
                .attrTween("d", function (d) {
                    const interpolate = d3.interpolate(this._current || d, d);
                    this._current = interpolate(1);
                    return t => arc(interpolate(t));
                });

            slice.exit().remove();

            // Labels
            const text = svgpie.select(".labels").selectAll("text")
                .data(pie(data));

            text.enter()
                .append("text")
                .attr("dy", ".35em")
                .merge(text)
                .text(d => d.data.label)
                .transition().duration(1000)
                .attrTween("transform", function (d) {
                    const interpolate = d3.interpolate(this._current || d, d);
                    this._current = interpolate(1);
                    return t => {
                        const d2 = interpolate(t);
                        const pos = outerArc.centroid(d2);
                        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                        return `translate(${pos})`;
                    };
                })
                .styleTween("text-anchor", function (d) {
                    const interpolate = d3.interpolate(this._current || d, d);
                    this._current = interpolate(1);
                    return t => midAngle(interpolate(t)) < Math.PI ? "start" : "end";
                });

            text.exit().remove();

            // Polylines
            const polyline = svgpie.select(".lines").selectAll("polyline")
                .data(pie(data));

            polyline.enter()
                .append("polyline")
                .merge(polyline)
                .transition().duration(1000)
                .attrTween("points", function (d) {
                    const interpolate = d3.interpolate(this._current || d, d);
                    this._current = interpolate(1);
                    return t => {
                        const d2 = interpolate(t);
                        const pos = outerArc.centroid(d2);
                        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                        return [arc.centroid(d2), outerArc.centroid(d2), pos];
                    };
                });

            polyline.exit().remove();
        }

        // Mid-angle helper
        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }

        // Refresh button
        d3.select("#refreshData").on("click", fetchData);

        // Initial load
        fetchData();