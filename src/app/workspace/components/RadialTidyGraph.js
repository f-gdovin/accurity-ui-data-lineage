import React from 'react';
import * as d3 from 'd3';
import * as d from "d";

const horizontalPadding = 50;
const verticalPadding = 100;

let width = window.innerWidth - horizontalPadding;
let height = window.innerHeight - verticalPadding;

const diameter = Math.max(height, width);

class RadialTidyGraph extends React.Component {

    componentDidMount() {
        const graph = this.props.graph;

        width = diameter;
        height = diameter;

        const svg = d3.select(this.refs.mountPoint)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

        const tree = d3.tree()
            .size([360, diameter / 2 - 80])
            .separation(function (a, b) {
                return (a.parent == b.parent ? 1 : 10) / a.depth;
            });

        const root = d3.hierarchy(graph);
        tree(root);

        const link = svg.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", "0.6")
            .attr("stroke-width", "1.5px")
            .attr("d", function(d) {
                return "M" + project(d.x, d.y)
                    + "C" + project(d.x, (d.y + d.parent.y) / 2)
                    + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                    + " " + project(d.parent.x, d.parent.y);
            });

        const node = svg.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function (d) {
                return "node" + (d.children ? " node--internal" : " node--leaf");
            })
            .attr("transform", function (d) {
                return "translate(" + project(d.x, d.y) + ")";
            });

        node.append("circle")
            .attr("r", 2.5);

        node.append("text")
            .attr("dy", ".31em")
            .attr("x", function(d) {
                return d.x < 180 === !d.children ? 6 : -6;
            })
            .style("text-anchor", function(d) {
                return d.x < 180 === !d.children ? "start" : "end";
            })
            .attr("transform", function(d) {
                return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")";
            })
            .text(function(d) {
                return d.data.name;
            });

        function project(x, y) {
            const angle = (x - 90) / 180 * Math.PI, radius = y;
            return [radius * Math.cos(angle), radius * Math.sin(angle)];
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
RadialTidyGraph.propTypes = {
    graph: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        children: React.PropTypes.arrayOf({
            name: React.PropTypes.string.isRequired
        })
    })
};
export default RadialTidyGraph;