import React from "react";
import * as d3 from "d3";
import d3Tip from "d3-tip";
import JSONConfigurer from "../data/JSONConfigurer";
import DataLoader from "../utils/DataActions";
import DataStore from "../utils/DataStore";

const horizontalPadding = 50;
const verticalPadding = 100;
const interNodePadding = 2;

let width = window.innerWidth - horizontalPadding;
let height = window.innerHeight - verticalPadding;

// Toggle whether the highlighting is on
let toggle = 0;

class ForceGraph extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            graph: {
                nodes: DataStore.getState().modelData.nodes,
                links: []
            },
            graphDrawn: true
        };
    }

    componentDidMount() {
        this.draw();
    }

    draw() {
        const graph = this.state.graph;

        // Highlighting of adjacent nodes
        let linkedByIndex = {};
        for (let i = 0; i < graph.nodes.length; i++) {
            linkedByIndex[i + "," + i] = 1;
        }
        graph.links.forEach((d) => linkedByIndex[Number(d.source) + "," + Number(d.target)] = 1);

        function neighboring(a, b) {
            return linkedByIndex[a.index + "," + b.index];
        }

        function connectedNodes() {
            let d;
            if (toggle === 0) {
                //Reduce the opacity of all but the neighbouring nodes
                d = d3.select(this).node().__data__;
                node.style("opacity", (o) => neighboring(d, o) || neighboring(o, d) ? 1 : 0.1);
                link.style("opacity", (o) => d.index === o.source.index || d.index === o.target.index ? 0.6 : 0.1);
                toggle = 1;
            } else {
                resetSearch(0);
                toggle = 0;
            }
        }

        // Collision detection & avoidance
        function collide(alpha) {
            const quadtree = d3.quadtree(graph.nodes);
            return (d) => {
                const rb = 2 * d.size + interNodePadding,
                    nx1 = d.x - rb,
                    nx2 = d.x + rb,
                    ny1 = d.y - rb,
                    ny2 = d.y + rb;
                quadtree.visit((quad, x1, y1, x2, y2) => {
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
                const matchedNodes = nodes.filter((node, i) => node.name.toUpperCase().includes(selectedVal.toUpperCase()));
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
            .html((d) => d.name + "");
        svg.call(tip);

        // Links
        // Update the links
        let link = svg.selectAll(".link")
            .data(graph.links, (d) => "#{d.source}_#{d.target}");

        link.enter().append('svg:line')
            .attr('class', 'link')
            .attr("stroke", "#6f6d6d")
            .attr("stroke-opacity", "0.6")
            .attr("stroke-width", "3px");
        // .attr("stroke-width", (d) => Math.sqrt(d.value));

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
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on('dblclick', connectedNodes)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);


        // Append a circle
        nodeEnter.append("svg:circle")
            .attr("r", 10)
            .style("stroke", "gray")
            .style("fill", "white");

        // Append an icon
        nodeEnter.append("text")
            .attr("class", "nodetext")
            .attr("x", (d) => d.cx)
            .attr("y", (d) => d.cy)
            .attr("font-family", "accurity")
            .attr("font-size", "20px")
            .attr("fill", "#130C0E")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text((d) => JSONConfigurer.getObjectByItsType(d._type).icon);

        // Exit any old nodes
        node.exit().remove();

        link = svg.selectAll(".link");
        node = svg.selectAll(".node");

        // Adjust these to change the strength of gravitational pull, center of the gravity, link lengths and strengths
        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().distance(0).strength(0.1).id((d) => d._uuid))
            .force("charge", d3.forceManyBody().strength(-75))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        // Update function, let D3 handle this instead of React
        function ticked() {
            link
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);

            node
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
                .attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
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

    // Get nodes from store, compute links to them and draw it
    redraw() {
        this.setState({graphDrawn: false});
        const newData = DataStore.getModelData();
        const links = JSONConfigurer.generateLinks(newData.nodes, newData.selectedItems);
        console.log("Links loaded");
        this.setState({
            graph: {
                nodes: newData.nodes,
                links: links
            }
        }, () => {
            //Clear the canvas and redraw
            d3.selectAll('div > svg').remove();
            this.draw();
            this.setState({graphDrawn: true});
        });


    }

    // Let React do the first render
    render() {
        const style = {
            width: '100%',
            height: '100%',
            border: '1px solid #323232',
        };

        return (
            <div>
                <div className="dataLoader">
                    <DataLoader isModelData={true}/>
                    <button disabled={!this.state.graphDrawn} style={{float: 'left'}} className="redraw-graph" onClick={() => {
                        this.redraw()
                    }}>Redraw
                    </button>
                </div>

                <div className="zoomer">
                    <button style={{float: 'left'}} className="reset-zoom" onClick={() => {
                        this.resetZoom()
                    }}>Reset zoom
                    </button>
                </div>

                <div className="nodeSearcher">
                    {/*<NodeSearcher nodes={this.state.graph.nodes}/>*/}
                </div>
                <div className="mountPoint" style={style} ref="mountPoint"/>
            </div>);
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