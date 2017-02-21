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

        root.each(function (d) {
            d.name = d.data.name; //transferring name to a name variable
            d.id = index; //Assigning numerical Ids
            index++;
        });

        root.x0 = height / 2;
        root.y0 = 0;

        // Collapse after the second level
        // root.children.forEach(this.collapse);

        this.redraw(root);
    }

    redraw(source) {

        const nodes = tree(root).descendants();
        const links = nodes.slice(1);

        nodes.forEach(function(d) { d.y = d.depth * 180; });

        const nodeSvg = svg.selectAll(".node")
            .data(nodes,function(d) { return d.id});

        //nodeSvg.exit().remove();

        const nodeEnter = nodeSvg.enter()
            .append("g")
            .attr("class", function(d) {
                return "node" + (d.children ? " node--internal" : " node--leaf");
            })
            .attr("transform", function (d) {
                return "translate(" + project(d.x, d.y) + ")";
            })
            .on("click", this.click)
            .on("mouseover", function (d) {
                return "minu";
            });

        nodeEnter.append("circle")
            .attr("r", 5)
            .style("fill", color);

        nodeEnter.append("text")
            .attr("dy", ".31em")
            .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
            .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
            .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
            .text(function(d) {
                return d.data.name;
            });

        // Transition nodes to their new position.
        const nodeUpdate = nodeSvg.merge(nodeEnter).transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + project(d.x, d.y) + ")";
            });

        nodeSvg.select("circle")
            .style("fill", color);

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        const nodeExit = nodeSvg.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 5);

        nodeExit.select("text")
            .style("fill-opacity", 5);

        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        const linkSvg = svg.selectAll(".link")
            .data(links, function(link) {
                return link.id + '->' + link.parent.id;
            });

        // Transition links to their new position.
        linkSvg.transition()
            .duration(duration);

        // Enter any new links at the parent's previous position.
        const linkEnter = linkSvg.enter().insert('path', 'g')
            .attr("class", "link")
            .attr("d", function(d) {
                return "M" + project(d.x, d.y)
                    + "C" + project(d.x, (d.y + d.parent.y) / 2)
                    + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                    + " " + project(d.parent.x, d.parent.y);
            });

        // Transition links to their new position.
        linkSvg.merge(linkEnter).transition()
            .duration(duration)
            .attr("d", connector);


        // Transition exiting nodes to the parent's new position.
        linkSvg.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                return "M" + project(d.x, d.y)
                    + "C" + project(d.x, (d.y + d.parent.y) / 2)
                    + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                    + " " + project(d.parent.x, d.parent.y);
            })
            .remove();

        function project(x, y) {
            const angle = (x - 90) / 180 * Math.PI, radius = y;
            return [radius * Math.cos(angle), radius * Math.sin(angle)];
        }

        function connector(d) {
            return "M" + project(d.x, d.y)
                + "C" + project(d.x, (d.y + d.parent.y) / 2)
                + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                + " " + project(d.parent.x, d.parent.y);
        }

        function color(d) {
            return   d._children ? "#3182bd"     // collapsed package
                    : d.children ? "#c6dbef"     // expanded package
                    : "#fd8d3c";                 // leaf node
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

    // Collapse the node and all it's children
    collapse(d) {
        if(d && d.children) {
            d._children = d.children;
            d._children.forEach(this.collapse);
            d.children = null
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