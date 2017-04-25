import React from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import d3Tip from "d3-tip";
import JSONConfigurer from "../utils/JSONConfigurer";
import SettingsSetter from "../utils/SettingsSetter";
import DataLoader from "../utils/DataLoader";
import DataStore from "../utils/DataStore";
import LoadingOverlay from "../ui/LoadingOverlay";

// Toggle whether the highlighting is on
let toggle = 0;

class ForceGraph extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            graph: {
                nodes: DataStore.getState().modelData.nodes,
                links: [],
                neighboursMatrix: [,]
            },
            graphDrawn: true,
            showSettings: false
        };
    }

    componentDidMount() {
        this.redraw();
    }

    draw() {
        // Zooming
        function zoomFunction() {
            let transform = d3.zoomTransform(this);
            svg.attr("transform", transform);
        }

        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", zoomFunction);

        const graph = this.state.graph;
        const width = this.props.width;
        const height = this.props.height;

        // Graph itself
        const svg = d3.select(this.refs.mountPoint)
        // Enable zooming (by default mouse wheel and double-click), then disable double-click for zooming
            .append("div")
            .call(zoom).on("dblclick.zoom", null)
            .append("svg:svg")
            //responsive SVG needs these 2 attributes and no width and height attr
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + width + " " + height)
            //class to make it responsive

            .attr("pointer-events", "all")
            .append('svg:g')
            .attr('fill', 'white');

        // Tooltips
        const tip = d3Tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            // uncomment this for tooltips
            // .html((d) => d.name + "");
            .html((d) => "");
        svg.call(tip);

        // Links
        // Update the links
        let link = svg.selectAll(".link")
            .data(graph.links, (d) => "#{d.source}_#{d.target}");

        link.enter().append('svg:line')
            .attr('class', 'link')
            .attr("stroke", "#7a7a7a")
            .attr("stroke-opacity", ".8")
            .attr("stroke-width", "3px");

        // Exit any old paths
        link.exit().remove();

        // Nodes
        // Update the nodes
        let node = svg.selectAll(".node")
            .data(graph.nodes, (d) => d._uuid);

        // Enter any new nodes
        const nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", (d) => this.dragstarted(simulation, d))
                .on("drag", (d) => this.dragged(d))
                .on("end", (d) => this.dragended(simulation, d)))
            .on('dblclick', this.connectedNodes(node, link))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);


        // Append a diamond to Reference Attributes
        nodeEnter.append("path")
            .attr("class", "nodeSymbol")
            .attr("x", (d) => d.cx)
            .attr("y", (d) => d.cy)
            .style("opacity", (d) => {
                if (d._type === "attribute" && d.attributeDefinition.entity._uuid) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .style("stroke", "#363636")
            .style("fill", "#05C1AD")
            .attr("d", d3.symbol()
                .size(1500)
                .type(d3.symbolDiamond));

        // Append an ellipse to Attributes
        nodeEnter.append("ellipse")
            .attr("rx", 45)
            .attr("ry", 25)
            .style("stroke", "#363636")
            .style("fill", "#05C1AD")
            .style("opacity", (d) => {
                if (d._type === "attribute" && !d.attributeDefinition.entity._uuid) {
                    return 1;
                } else {
                    return 0;
                }
            });

        // Append a rectangle to Entities
        nodeEnter.append("rect")
            .attr("width", 90)
            .attr("height", 50)
            .attr("x", -90/2)
            .attr("y", -50/2)
            .style("stroke", "#363636")
            .style("fill", "#9ACE52")
            .style("opacity", (d) => {
                if (d._type === "entity") {
                    return 1;
                } else {
                    return 0;
                }
            });

        /*// Append an icon
        nodeEnter.append("text")
            .attr("class", "nodeIcon")
            .attr("x", (d) => d.cx)
            .attr("y", (d) => d.cy)
            .attr("font-family", "accurity")
            .attr("font-size", "20px")
            .attr("fill", "#FBFBFB")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text((d) => JSONConfigurer.getObjectByItsType(d._type).icon);*/

        // Append a label
        nodeEnter.append("text")
            .attr("class", "nodeLabel")
            .attr("x", (d) => d.cx)
            .attr("y", (d) => d.cy)
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("font-family", "roboto-light")
            .attr("font-size", "8px")
            .attr("fill", "#363636")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text((d) => {
                if (d._type === "attribute") {
                    let indexOfDot = d.name.lastIndexOf('.');
                    if (indexOfDot < 0) {
                        return d.name;
                    } else {
                        return d.name.substring(indexOfDot + 1);
                    }
                } else {
                    return d.name;
                }});

        // Exit any old nodes
        node.exit().remove();

        link = svg.selectAll(".link");
        node = svg.selectAll(".node");

        // Adjust these to change the strength of gravitational pull, center of the gravity, link lengths and strengths
        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().distance(12.5).strength(0.05).id((d) => d._uuid))
            .force("charge", d3.forceManyBody().strength(-150))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        // Update function, let D3 handle this instead of React
        function ticked() {
            let q = d3.quadtree(graph.nodes),
                i = 0,
                n = graph.nodes.length;

            while (++i < n) q.visit(collide(graph.nodes[i]));

            link
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);

            node
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
                .attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
        }

        function collide(node) {
            const r = 120,
                nx1 = node.x - r,
                nx2 = node.x + r,
                ny1 = node.y - r,
                ny2 = node.y + r;
            return function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== node)) {
                    let x = node.x - quad.point.x,
                        y = node.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = 120;
                    if (l < r) {
                        l = (l - r) / l * .5;
                        node.x -= x *= l;
                        node.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            };
        }
    }

    // Get nodes from store, compute links to them and draw it
    redraw() {
        this.setState({graphDrawn: false});
        const newData = DataStore.getModelData();
        const links = JSONConfigurer.generateLinks(newData.nodes, newData.selectedItems);
        
        // TODO: save links in store as well?

        // Compute matrix of neighbours
        const neighboursMatrix = [,];
        for (let i = 0; i < newData.nodes.length; i++) {
            neighboursMatrix[i + "," + i] = 1;
        }

        msg.success("Links loaded");
        this.setState({
            graph: {
                nodes: newData.nodes,
                links: links,
                neighboursMatrix: neighboursMatrix
            }
        }, () => {
            //Clear the canvas and redraw
            d3.selectAll('.mountPoint > div').remove();
            this.draw();
            this.setState({graphDrawn: true});
        });
    }

    neighboring(a, b) {
        return this.state.neighboursMatrix[a.index + "," + b.index];
    }

    // Dragging stuff
    dragstarted(simulation, d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    dragended(simulation, d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    connectedNodes(node, link) {
        let d;
        if (toggle === 0) {
            //Reduce the opacity of all but the neighbouring nodes
            d = d3.select(this).node().__data__;
            node.style("opacity", (o) => this.neighboring(d, o) || this.neighboring(o, d) ? 1 : 0.1);
            link.style("opacity", (o) => d.index === o.source.index || d.index === o.target.index ? 0.6 : 0.1);
            toggle = 1;
        } else {
            this.resetSearch(d3, 0);
            toggle = 0;
        }
    }

    // Take value on input field and show nodes whose name contains such substring (case insensitive)
    searchNode(svg) {
        const input = document.getElementById('searchInput');
        const selectedVal = input ? input.value : "none";
        const nodes = svg.selectAll(".node");
        if (selectedVal === "none") {
            nodes.style("stroke", "white").style("stroke-width", "1");
        } else {
            nodes.style("opacity", "0.1");

            //make only the matching nodes visible
            const matchedNodes = nodes.filter((node, i) => node.name.toUpperCase().includes(selectedVal.toUpperCase()));
            matchedNodes.style("opacity", "1");

            const links = svg.selectAll(".link");
            links.style("opacity", "0.1");
        }
    }

    // Change opacity of everything back to default after X milliseconds
    resetSearch(d3, duration = 0) {
        d3.selectAll(".node").transition()
            .duration(duration)
            .style("opacity", 1);
        d3.selectAll(".link").transition()
            .duration(duration)
            .style("opacity", 0.6);
    }

    // Let React do the first render
    render() {
        return (
            <div>
                {/*loading overlay*/}
                <LoadingOverlay spinnerSize={"320px"} text={"Computing the links and drawing graph, please wait..."}
                                show={!this.state.graphDrawn}/>

                {/*left side*/}
                <DataLoader isModelData={true}/>

                {/*middle*/}
                <div className="redrawer">
                    <button disabled={!this.state.graphDrawn} style={{float: 'left'}} className="btn btn-greenlight"
                            onClick={() => {
                                this.redraw()
                            }}>Redraw
                    </button>
                </div>

                {/*right side*/}
                <SettingsSetter/>
                <div className="mountPoint" ref="mountPoint"/>
            </div>);
    }
}
ForceGraph.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
};
export default ForceGraph;