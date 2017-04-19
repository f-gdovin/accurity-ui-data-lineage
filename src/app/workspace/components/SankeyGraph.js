import React from 'react';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';

const margin = {top: 10, right: 40, bottom: 40, left: 10};
let width = window.innerWidth - margin.left - margin.right;
let height = window.innerHeight - margin.top - margin.bottom;

class SankeyGraph extends React.Component {

    componentDidMount() {
        const graph = this.props.graph;
        const units = "Widgets";

        const formatNumber = d3.format(",.0f"),    // zero decimal places
            format = (d) => formatNumber(d) + " " + units,
            color = d3.scaleOrdinal(d3.schemeCategory20);

        function resetZoom() {
            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        }

        //"Reset zoom" button
        d3.select(".reset-zoom")
            .on("click", resetZoom);

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

        // append the svg canvas to the page
        const svg = d3.select(this.refs.mountPoint)
            .call(zoom).on("dblclick.zoom", null)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const sankey = d3Sankey.sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .size([width, height]);

        const path = sankey.link();

        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(32);

        const link = svg.append("g").selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke-width", (d) => Math.max(1, d.dy))
            .sort((a, b) => b.dy - a.dy);

        link.append("title")
            .text((d) => d.source.name + " → " + d.target.name + "\n" + format(d.value));

        const node = svg.append("g").selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", (d) => "translate(" + d.x + "," + d.y + ")")
            .on("click", highlightLinks)
            .call(d3.drag()
                .subject((d) => d)
                .on("start", () => this.parentNode.appendChild(this))
                .on("drag", dragmove));

        node.append("rect")
            .attr("height", (d) => d.dy)
            .attr("width", sankey.nodeWidth())
            .style("fill", (d) => d.color = color(d.name.replace(/ .*/, "")))
            .style("stroke", (d) => d3.rgb(d.color).darker(2))
            .append("title")
            .text((d) => d.name + "\n" + format(d.value));

        node.append("text")
            .attr("x", -6)
            .attr("y", (d) => d.dy / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text((d) => d.name)
            .filter((d) => d.x < width / 2)
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        function dragmove(d) {
            d3.select(this).attr("transform",
                "translate(" + (
                    d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
                ) + "," + (
                    d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
                ) + ")");
            sankey.relayout();
            link.attr("d", path);
        }

        function highlightLinks(node, i) {

            let remainingNodes=[],
                nextNodes=[];

            let stroke_opacity = 0;
            if (d3.select(this).attr("data-clicked") === "1") {
                d3.select(this).attr("data-clicked","0");
                stroke_opacity = 0.2;
            } else {
                d3.select(this).attr("data-clicked","1");
                stroke_opacity = 0.8;
            }

            const traverse = [{
                linkType: "sourceLinks",
                nodeType: "target"
            }, {
                linkType: "targetLinks",
                nodeType: "source"
            }];

            traverse.forEach(function(step){
                node[step.linkType].forEach(function(link) {
                    remainingNodes.push(link[step.nodeType]);
                    highlightLink(link.id, stroke_opacity);
                });

                while (remainingNodes.length) {
                    nextNodes = [];
                    remainingNodes.forEach(function(node) {
                        node[step.linkType].forEach(function(link) {
                            nextNodes.push(link[step.nodeType]);
                            highlightLink(link.id, stroke_opacity);
                        });
                    });
                    remainingNodes = nextNodes;
                }
            });
        }

        function highlightLink(id, opacity) {
            d3.select("#link-"+id).style("stroke-opacity", opacity);
        }
    }

    //let React do the first render
    render() {
        return <div className="mountPoint" ref="mountPoint" />;
    }
}
SankeyGraph.propTypes = {
    graph: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        children: React.PropTypes.arrayOf({
            name: React.PropTypes.string.isRequired
        })
    })
};
export default SankeyGraph;