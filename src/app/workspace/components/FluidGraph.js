import React from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import * as d from "d";

const duration = 500;
const translateDuration = 200;

const margin = {top: 10, right: 40, bottom: 40, left: 10};
let width = window.innerWidth - margin.left - margin.right;
let height = window.innerHeight - margin.top - margin.bottom;
const diameter = Math.min(height, width);
let index = 0;

let svg, tree, root, nodes, links, link, node, diagonal, radialDiagonal, cluster, radialTree, radialCluster;
let linkStroke = "#8da0cb",
    nodeStroke = "#e41a1c",
    isCircle = false;

const svgTransform = "translate(40,0)";
const svgRadialTransform = "translate(" + (width / 2) + "," + (height / 2) + ")";

class FluidGraph extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.collapse = this.collapse.bind(this);
        this.click = this.click.bind(this);
        this.redraw = this.redraw.bind(this);

        this.layoutChanged = this.layoutChanged.bind(this);
    }

    componentDidMount() {
        const graph = this.props.graph;
        const width = this.props.width;
        const height = this.props.height;

        function zoomFunction() {
            let transform = d3.zoomTransform(this);
            svg.attr("transform", transform);
        }

        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", zoomFunction);

        //diagonals

        // Creates a curved (diagonal) path from parent to the child nodes
        diagonal = (d) => {
            return "M" + d.y + "," + d.x
                + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                + " " + d.parent.y + "," + d.parent.x;
        };

        radialDiagonal = (d) => {
            function project(x, y) {
                const angle = (x - 90) / 180 * Math.PI, radius = y;
                return [radius * Math.cos(angle), radius * Math.sin(angle)];
            }

            return "M" + project(d.x, d.y)
                + "C" + project(d.x, (d.y + d.parent.y) / 2)
                + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                + " " + project(d.parent.x, d.parent.y);
        };

        //different layouts
        cluster = d3.cluster()
            .size([height, width - 160]);

        radialTree = d3.tree()
            .size([360, diameter / 2])
            .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

        radialCluster = d3.cluster()
            .size([360, diameter / 2])
            .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

        svg = d3.select(this.refs.mountPoint)
            .append("div")
            .call(zoom).on("dblclick.zoom", null)
            .append("svg:svg")
            //responsive SVG needs these 2 attributes and no width and height attr
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + width + " " + height)
            .append("g")
            .attr("transform", isCircle ? svgRadialTransform : svgTransform);

        tree = d3.tree()
            .size([height, width]);

        root = d3.hierarchy(graph);
        root.x0 = height / 2;
        root.y0 = 90;

        root.each((d) => {
            d.name = d.data.name;
            d.id = index;
            index++;
        });

        nodes = cluster(root).descendants();
        links = nodes.slice(1);

        link = svg.selectAll(".link")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "link")
            .style("stroke", linkStroke)
            .attr("d", isCircle ? radialDiagonal : diagonal);

        node = svg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", (d) => {
                if (isCircle) {
                    return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                } else {
                    return "translate(" + d.y + "," + d.x + ")";
                }
            });

        node.append("circle")
            .attr("r", 2.5)
            .style("stroke", nodeStroke);

        node.append("text")
            .attr("dx", (d) => d.children ? -8 : 8)
            .attr("dy", 3)
            .style("font-size", "9px")
            .attr("font-family", "roboto-light")
            .style("text-anchor", (d) => d.children ? "end" : "start")
            .text((d) => d.name);

        // Collapse after the second level
        // root.children.forEach(this.collapse);

        //by default, show Cluster
        this.layoutChanged("cluster");
    }

    layoutChanged(graphType) {
        switch (graphType) {
            case "radial-tree": {
                nodes = radialTree(root).descendants();
                links = nodes.slice(1);

                isCircle = true;
                linkStroke = "#fc8d62";
                nodeStroke = "#984ea3";
                break;
            }
            case "radial-cluster": {
                nodes = radialCluster(root).descendants();
                links = nodes.slice(1);
                isCircle = true;
                linkStroke = "#66c2a5";
                nodeStroke = "#4daf4a";
                break;
            }
            case "tree": {
                nodes = tree(root).descendants();
                links = nodes.slice(1);
                isCircle = false;
                linkStroke = "#e78ac3";
                nodeStroke = "#377eb8";
                break;
            }
            case "cluster": {
                nodes = cluster(root).descendants();
                links = nodes.slice(1);
                isCircle = false;
                linkStroke = "#8da0cb";
                nodeStroke = "#e41a1c";
                break;
            }
        }
        this.redraw(root);
    }

    redraw(source) {
        // necessary tweaks after layout changed
        svg.transition().duration(translateDuration)
            .attr("transform", isCircle ? svgRadialTransform : svgTransform);

        link.data(links)
            .transition()
            .duration(translateDuration)
            .style("stroke", linkStroke)
            .attr("d", isCircle ? radialDiagonal : diagonal);

        node.data(nodes)
            .transition()
            .duration(translateDuration)
            .attr("transform", (d) => {
                if (isCircle) {
                    return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                } else {
                    return "translate(" + d.y + "," + d.x + ")";
                }
            });

        node.select("circle")
            .transition()
            .duration(translateDuration)
            .style("stroke", nodeStroke);

        // Normalize for fixed-depth.
        // nodes.forEach(function(d){ d.y = d.depth * 180});

        // Enter any new modes at the parent's previous position.
        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", () => {
                if (isCircle) {
                    return "rotate(" + (source.x0 - 90) + ")translate(" + source.y0 + ")";
                } else {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                }
            })
            .on('click', this.click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6);

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("dy", ".35em")
            .style("font-size", "9px")
            .attr("font-family", "roboto-light")
            .attr("x", (d) => d.children || d._children ? -13 : 13)
            .attr("text-anchor", (d) => d.children || d._children ? "end" : "start")
            .text((d) => d.name);

        // UPDATE
        const nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", (d) => {
                if (isCircle) {
                    return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                } else {
                    return "translate(" + d.y + "," + d.x + ")";
                }
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 2.5)
            .attr('cursor', 'pointer');


        // Remove any exiting nodes
        const nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", () => {
                if (isCircle) {
                    return "rotate(" + (source.x - 90) + ")translate(" + source.y + ")";
                } else {
                    return "translate(" + source.y + "," + source.x + ")";
                }
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // ****************** links section ***************************

        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', () => {
                const o = {x: source.x0, y: source.y0};
                return isCircle ? radialDiagonal(o, o) : diagonal(o, o)
            });

        // UPDATE
        const linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', (d) => isCircle ? radialDiagonal(d, d.parent) : diagonal(d, d.parent))

        // Remove any exiting links
        const linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', () => {
                const o = {x: source.x, y: source.y};
                return isCircle ? radialDiagonal(o, o) : diagonal(o, o)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        this.redraw(d);
    }

    //Collapse nodes
    collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(this.collapse);
            d.children = null;
        }
    }

    //let React do the first render
    render() {
        return (
            <div>
                <div className="layoutPicker">
                    <label><input type="radio" name="mode" onClick={() => {
                        this.layoutChanged("radial-tree")
                    }}/>Radial Tree</label>
                    <label><input type="radio" name="mode" onClick={() => {
                        this.layoutChanged("radial-cluster")
                    }}/>Radial Cluster</label>
                    <label><input type="radio" name="mode" onClick={() => {
                        this.layoutChanged("tree")
                    }}/>Tree</label>
                    <label><input type="radio" name="mode" onClick={() => {
                        this.layoutChanged("cluster")
                    }} defaultChecked="true"/>Cluster</label>
                </div>
                <div className="mountPoint" ref="mountPoint"/>
            </div>
        );
    }
}
FluidGraph.propTypes = {
    graph: PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        children: React.PropTypes.arrayOf({
            name: React.PropTypes.string.isRequired
        })
    }),
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
};
export default FluidGraph;