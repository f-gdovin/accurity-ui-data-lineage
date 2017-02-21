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

class CollapsibleTree extends React.Component {

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
            .size([height, width]);

        root = d3.hierarchy(graph);

        root.each(function (d) {
            d.name = d.data.name; //transferring name to a name variable
            d.id = index; //Assigning numerical Ids
            index++;
        });

        // Collapse after the second level
        root.children.forEach(this.collapse);

        this.redraw(root);
    }

    redraw(source) {

        const nodes = tree(root).descendants();
        const links = nodes.slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = d.depth * 180; });

        // Update the nodes…
        const node = svg.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id
            });

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("click", this.click);

        nodeEnter.append("circle")
            .attr("r", 2.5)
            .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeEnter.append("text")
            .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
            .attr("dy", ".35em")
            .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
            .text(function(d) { return d.name; })
            .style("fill-opacity", 2.5);

        // Transition nodes to their new position.
        const nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        nodeUpdate.select("circle")
            .attr("r", 5)
            .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        const nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 2.5);

        nodeExit.select("text")
            .style("fill-opacity", 2.5);

        // Update the links…
        const link = svg.selectAll("path.link")
            .data(links, function (d) {
                return d.parent.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                const o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                const o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        function project(x, y) {
            const angle = (x - 90) / 180 * Math.PI, radius = y;
            return [radius * Math.cos(angle), radius * Math.sin(angle)];
        }

        function diagonal(d) {
            return "M" + project(d.source.x, d.source.y)
                + "C" + project(d.source.x, (d.source.y + d.target.y) / 2)
                + " " + project(d.target.x, (d.source.y + d.target.y) / 2)
                + " " + project(d.target.x, d.target.y);
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
CollapsibleTree.propTypes = {
    graph: React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        children: React.PropTypes.arrayOf({
            name: React.PropTypes.string.isRequired
        })
    })
};
export default CollapsibleTree;
