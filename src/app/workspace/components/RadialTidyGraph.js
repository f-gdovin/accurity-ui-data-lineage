import React from 'react';
import * as d3 from 'd3';
import * as d from "d";

const horizontalPadding = 50;
const verticalPadding = 100;
const duration = 500;

let svg, tree, root;

let width = window.innerWidth - horizontalPadding;
let height = window.innerHeight - verticalPadding;
let index = 0;

const diameter = Math.max(height, width);

class RadialTidyGraph extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.collapse = this.collapse.bind(this);
        this.click = this.click.bind(this);
        this.redraw = this.redraw.bind(this);
    }

    componentDidMount() {
        const graph = this.props.graph;

        width = diameter;
        height = diameter;

        svg = d3.select(this.refs.mountPoint)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

        tree = d3.tree()
            .size([360, diameter / 2 - 80])
            .separation(function (a, b) {
                return (a.parent == b.parent ? 1 : 10) / a.depth;
            });

        root = d3.hierarchy(graph);
        tree(root);

        root.each(function (d) {
            d.name = d.data.name;   //transferring name to a name variable
            d.id = index;           //Assigning numerical Ids
            index++;
        });

        root.x0 = height / 2;
        root.y0 = 0;

        this.redraw(root);
    }

    redraw(source) {

        const nodes = tree(root).descendants();
        const links = tree(root).descendants().slice(1);

        const link = svg.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", function (d) {
                return diagonal(d);
            });

        const node = svg.selectAll(".node")
            .data(nodes)
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
            .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
            .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
            .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
            .text(function(d) { return d.name });

        function project(x, y) {
            const angle = (x - 90) / 180 * Math.PI, radius = y;
            return [radius * Math.cos(angle), radius * Math.sin(angle)];
        }

        function diagonal(d) {
            return "M" + project(d.x, d.y)
                + "C" + project(d.x, (d.y + d.parent.y) / 2)
                + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                + " " + project(d.parent.x, d.parent.y);
        }
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

// Collapse nodes
    collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(this.collapse);
            d.children = null;
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