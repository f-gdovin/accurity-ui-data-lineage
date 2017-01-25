import React from 'react';
import * as d3 from 'd3';
/*import Node from 'Node';
import Link from 'Link';*/

class Graph extends React.Component {

    componentDidMount() {
        const { width, height } = this.props;
        const graph = this.props.graph;

        const color = d3.scaleOrdinal(d3.schemeCategory20);

        // init svg
        const outer = d3.select(this.refs.mountPoint)
            .append("svg:svg")
            .attr("width", width)
            .attr("height", height)
            .attr("pointer-events", "all");

        const svg = outer
            .append('svg:g')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'white');

        //adjust these to change the strength of gravitational pull, center of the gravity, link lengths and strengths
        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().distance(0).strength(0.1).id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-75))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .nodes(graph.nodes)
            .on("tick", ticked);

        const link = svg.append("svg")
            .attr("class", "link")
            .selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke-width", function (d) {
                return Math.sqrt(d.value);
            });

        const node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("path")
            .attr("class", "node")
            .attr("d", d3.symbol()
                .size(function(d) { return 50 + d.size * 30; } )
                .type(function(d) {
                    if (d.type === "circle") {
                        return d3.symbolCircle;
                    } else if (d.type === "square") {
                        return d3.symbolSquare;
                    } else {
                        return d3.symbolDiamond;
                    }
                })
            )
            .style("fill", function(d) { return color(d.group); })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        const text = svg.selectAll("text")
            .data(graph.nodes)
            .enter()
            .append("text");

        const textLabels = text
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y;
            })
            .text(function (d) {
                return d.name
            })
            .attr("font-family", "roboto-medium")
            .attr("font-size", "10px")
            .attr("fill", "black");

        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        function ticked() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            text
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
        }

        //dragging stuff
        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        function mousedown() {
            // allow panning if nothing is selected
            svg.call(d3.zoom().on("zoom"), rescale);
        }

        // rescale g
        function rescale() {
            // let trans = d3.event.translate;
            // let scale = d3.event.scale;
            //
            // svg.attr("transform",
            //     "translate(" + trans + ")"
            //     + " scale(" + scale + ")");
        }
    }

    render() {
        const { width, height } = this.props;
        const style = {
            width,
            height,
            border : '1px solid #323232',
        };

        return <div style={style} ref="mountPoint" />;
    }
}
Graph.propTypes = {
    graph: React.PropTypes.shape({
        nodes: React.PropTypes.arrayOf({
            name: React.PropTypes.string.isRequired,
            size: React.PropTypes.number.isRequired,
            type: React.PropTypes.string.isRequired,
            group: React.PropTypes.number.isRequired,
            id: React.PropTypes.string.isRequired
        }),
        links: React.PropTypes.arrayOf({
            source: React.PropTypes.number.isRequired,
            target: React.PropTypes.number.isRequired,
            value: React.PropTypes.number.isRequired,
            id: React.PropTypes.string.isRequired
        }),
    }),
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
};
export default Graph;