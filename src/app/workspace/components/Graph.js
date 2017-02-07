import React from 'react';
import * as d3 from 'd3';
import * as d from "d";

const padding = 50;
const interNodePadding = 2;
let width = window.innerWidth - padding;
let height = window.innerHeight - padding;

//Toggle stores whether the highlighting is on
let toggle = 0;

class Graph extends React.Component {

    componentDidMount() {
        const graph = this.props.graph;

        const color = d3.scaleOrdinal(d3.schemeCategory20);

        //highlighting of adjacent nodes
        let linkedByIndex = {};
        for (let i = 0; i < graph.nodes.length; i++) {
            linkedByIndex[i + "," + i] = 1;
        }
        graph.links.forEach(function (d) {
            linkedByIndex[Number(d.source) + "," + Number(d.target)] = 1;
        });

        function neighboring(a, b) {
            return linkedByIndex[a.index + "," + b.index];
        }
        function connectedNodes() {
            let d;
            if (toggle == 0) {
                //Reduce the opacity of all but the neighbouring nodes
                d = d3.select(this).node().__data__;
                node.style("opacity", function (o) {
                    return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
                });
                link.style("stroke-opacity", function (o) {
                    return d.index == o.source.index | d.index == o.target.index ? 0.6 : 0.1;
                });
                //Reduce the op
                toggle = 1;
            } else {
                //Put them back to opacity=1
                node.style("opacity", 1);
                link.style("stroke-opacity", 0.6);
                toggle = 0;
            }
        }

        //collision detection & avoidance
        function collide(alpha) {
            const quadtree = d3.quadtree(graph.nodes);
            return function(d) {
                const rb = 2 * d.size + interNodePadding,
                    nx1 = d.x - rb,
                    nx2 = d.x + rb,
                    ny1 = d.y - rb,
                    ny2 = d.y + rb;
                quadtree.visit(function(quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                        let x = d.x - quad.point.x,
                            y = d.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y);
                        if (l < rb) {
                            l = (l - rb) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                });
            };
        }

        function searchNode() {
            //find the node
            const selectedVal = document.getElementById('searchInput').value;
            const nodes = svg.selectAll(".node");
            if (selectedVal == "none") {
                nodes.style("stroke", "white").style("stroke-width", "1");
            } else {
                const selected = nodes.filter(function (node, i) {
                    return node.name != selectedVal;
                });
                selected.style("opacity", "0");
                const links = svg.selectAll(".link");
                links.style("opacity", "0");
                d3.selectAll(".node, .link").transition()
                    .duration(5000)
                    .style("opacity", 1);
            }
        }

        //"Reset zoom" button
        d3.select(".find-node")
            .on("click", searchNode);

        //zooming
        function zoomFunction() {
            let transform = d3.zoomTransform(this);
            svg.attr("transform", transform);
        }

        const zoom = d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([0.5, 5])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", zoomFunction);

        //graph itself
        const svg = d3.select(this.refs.mountPoint)
            .append("svg:svg")
            .attr("width", width)
            .attr("height", height)
            .attr("pointer-events", "all")
            .append('svg:g')
            .attr("width", width)
            .attr("height", height)
            .attr("class", "graph")
            .attr('fill', 'white')
            .call(zoom);

        //adjust these to change the strength of gravitational pull, center of the gravity, link lengths and strengths
        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().distance(0).strength(0.1).id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-75))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .nodes(graph.nodes)
            .on("tick", ticked);

        //links
        const link = svg.selectAll(".link")
            .append('g')
            .data(graph.links)
            .enter().append('line')
            .attr('class', 'link')
            .attr("stroke", "#999")
            .attr("stroke-opacity", "0.6")
            .attr("stroke-width", function (d) {
                return Math.sqrt(d.value);
            });

        //nodes
        const node = svg.selectAll(".node")
            .append('g')
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
                .on("end", dragended))
            .on('dblclick', connectedNodes);

        //labels
        const text = svg.selectAll(".label")
            .append('g')
            .data(graph.nodes)
            .enter().append("text")
            .attr('class', 'label')
            .attr("stroke", "#999")
            .attr("stroke-opacity", "0.6")
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

        //enable zooming (by default mouse wheel and double-click), then disable double-click for zooming
        svg.call(zoom).on("dblclick.zoom", null);

        //"Reset zoom" button
        d3.select(".reset-zoom")
            .on("click", resetZoom);

        function resetZoom() {
            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        }

        //update function, let D3 handle this instead of React
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
            node.each(collide(0.5)); //Added
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
    }

    //let React do the first render
    render() {
        const style = {
            width: '100%',
            height: '100%',
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
    })
};
export default Graph;