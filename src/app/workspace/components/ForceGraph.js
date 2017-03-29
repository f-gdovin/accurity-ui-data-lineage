import React from 'react';
import * as d3 from 'd3';
import * as d from "d";
import d3Tip from 'd3-tip';

const horizontalPadding = 50;
const verticalPadding = 100;
const interNodePadding = 2;

let width = window.innerWidth - horizontalPadding;
let height = window.innerHeight - verticalPadding;

// Toggle stores whether the highlighting is on
let toggle = 0;

class ForceGraph extends React.Component {

    componentDidMount() {
        const graph = this.props.graph;

        const color = d3.scaleOrdinal(d3.schemeCategory20);

        // Highlighting of adjacent nodes
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
            if (toggle === 0) {
                //Reduce the opacity of all but the neighbouring nodes
                d = d3.select(this).node().__data__;
                node.style("opacity", function (o) {
                    return neighboring(d, o) || neighboring(o, d) ? 1 : 0.1;
                });
                link.style("opacity", function (o) {
                    return d.index === o.source.index || d.index === o.target.index ? 0.6 : 0.1;
                });
                toggle = 1;
            } else {
                resetSearch(0);
                toggle = 0;
            }
        }

        // Collision detection & avoidance
        function collide(alpha) {
            const quadtree = d3.quadtree(graph.nodes);
            return function (d) {
                const rb = 2 * d.size + interNodePadding,
                    nx1 = d.x - rb,
                    nx2 = d.x + rb,
                    ny1 = d.y - rb,
                    ny2 = d.y + rb;
                quadtree.visit(function (quad, x1, y1, x2, y2) {
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

        // Take value on input field and show nodes whose name contains such substring (case insensitive)
        function searchNode() {
            const selectedVal = document.getElementById('searchInput').value;
            const nodes = svg.selectAll(".node");
            if (selectedVal === "none") {
                nodes.style("stroke", "white").style("stroke-width", "1");
            } else {
                nodes.style("opacity", "0.1");

                //make only the matching nodes visible
                const matchedNodes = nodes.filter(function (node, i) {
                    return node.name.toUpperCase().includes(selectedVal.toUpperCase());
                });
                matchedNodes.style("opacity", "1");

                const links = svg.selectAll(".link");
                links.style("opacity", "0.1");
            }
        }

        // Change opacity of everything back to default after X milliseconds
        function resetSearch(duration = 0) {
            d3.selectAll(".node").transition()
                .duration(duration)
                .style("opacity", 1);
            d3.selectAll(".link").transition()
                .duration(duration)
                .style("opacity", 0.6);
        }

        function resetZoom() {
            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        }

        // "Reset zoom" button
        d3.select(".reset-zoom")
            .on("click", resetZoom);

        // "Search nodes" button
        d3.select(".search-nodes")
            .on("click", searchNode);

        // "Reset search" button
        d3.select(".reset-search")
            .on("click", resetSearch);

        // Zooming
        function zoomFunction() {
            let transform = d3.zoomTransform(this);
            svg.attr("transform", transform);
        }

        const zoom = d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([0.5, 5])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", zoomFunction);

        // Graph itself
        const svg = d3.select(this.refs.mountPoint)
        // Enable zooming (by default mouse wheel and double-click), then disable double-click for zooming
            .call(zoom).on("dblclick.zoom", null)
            .append("svg:svg")
            .attr("width", width)
            .attr("height", height)
            .attr("pointer-events", "all")
            .append('svg:g')
            .attr("width", width)
            .attr("height", height)
            .attr("class", "graph")
            .attr('fill', 'white');

        // Tooltips
        const tip = d3Tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return d.name + "";
            });
        svg.call(tip);

        // Links
        // Update the links
        let link = svg.selectAll(".link")
            .data(graph.links, function (d) {
                return "#{d.source}_#{d.target}";
            });

        link.enter().append('svg:line')
            .attr('class', 'link')
            .attr("stroke", "#999")
            .attr("stroke-opacity", "0.6")
            .attr("stroke-width", function (d) {
                return Math.sqrt(d.value);
            });

        // Exit any old paths
        link.exit().remove();


        // Nodes
        // Update the nodes
        let node = svg.selectAll(".node")
            .data(graph.nodes, function (d) {
                return d._uuid;
            });

        // Enter any new nodes
        const nodeEnter = node.enter().append("path")
            .attr("class", "node")
            .attr("d", d3.symbol()
                .size(50)
                .type(function(d) {
                    if (d.type === "subjectArea") {
                        return d3.symbolCircle;
                    } else if (d.type === "entity") {
                        return d3.symbolSquare;
                    } else {
                        return d3.symbolDiamond;
                    }
                })
            )
            .style("fill", function (d) {
                let typeColor = -1;
                if (d._type === "subjectArea") {
                    typeColor = 1;
                } else if (d._type === "entity") {
                    typeColor = 2;
                } else {
                    typeColor = 3;
                }
                return color(typeColor);
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on('dblclick', connectedNodes)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);


        /*// Append a circle
        nodeEnter.append("svg:circle")
            .attr("r", 10)
            .style("fill", "#eee");


        // Append an image
        nodeEnter.append("svg:image")
            .attr("xlink:href", "https://github.com/favicon.ico")
            .attr("x", -15)
            .attr("y", -15)
            .attr("height", 30)
            .attr("width", 30);

        nodeEnter.append("text")
            .attr("class", "nodetext")
            .attr("x", 15)
            .attr("y", 15)
            .attr("fill", "#130C0E")
            .text(function(d) { return d.name; });*/

        // Exit any old nodes
        node.exit().remove();

        link = svg.selectAll(".link");
        node = svg.selectAll(".node");

        // Adjust these to change the strength of gravitational pull, center of the gravity, link lengths and strengths
        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().distance(0).strength(0.1).id(function (d) {
                return d._uuid;
            }))
            .force("charge", d3.forceManyBody().strength(-75))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        // Update function, let D3 handle this instead of React
        function ticked() {
            link
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            node
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                })
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
            node.each(collide(0.5));
        }

        // Dragging stuff
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

    // Let React do the first render
    render() {
        const style = {
            width: '100%',
            height: '100%',
            border: '1px solid #323232',
        };

        return <div style={style} ref="mountPoint"/>;
    }
}
ForceGraph.propTypes = {
    graph: React.PropTypes.shape({
        nodes: React.PropTypes.arrayOf({
            name: React.PropTypes.string.isRequired,
            _type: React.PropTypes.string.isRequired,
            _uuid: React.PropTypes.string.isRequired
        }),
        links: React.PropTypes.arrayOf({
            source: React.PropTypes.number.isRequired,
            target: React.PropTypes.number.isRequired,
            value: React.PropTypes.number.isRequired,
            id: React.PropTypes.string.isRequired
        }),
    })
};
export default ForceGraph;