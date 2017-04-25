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

class CollapsibleTree extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.collapse = this.collapse.bind(this);
        this.click = this.click.bind(this);
        this.redraw = this.redraw.bind(this);
    }

    componentDidMount() {
        // Zooming
        function zoomFunction() {
            let transform = d3.zoomTransform(this);
            svg.attr("transform", transform);
        }

        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", zoomFunction);

        const graph = this.props.graph;

        svg = d3.select(this.refs.mountPoint)
            .append("div")
            .call(zoom).on("dblclick.zoom", null)
            .append("svg:svg")
            //responsive SVG needs these 2 attributes and no width and height attr
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + width + " " + height)
            .append("g");

        tree = d3.tree()
            .size([height, width]);

        root = d3.hierarchy(graph);
        root.x0 = height / 2;
        root.y0 = 0;

        root.each((d) => {
            d.name = d.data.name;
            d.id = index;
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
        nodes.forEach((d) => d.y = d.depth * 180);

        // ****************** Nodes section ***************************

        // Update the nodes...
        const node = svg.selectAll('g.node')
            .data(nodes, (d) => d.id);

        // Enter any new modes at the parent's previous position.
        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", () => "translate(" + source.y0 + "," + source.x0 + ")")
            .on('click', this.click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style("fill", (d) => d._children ? "lightsteelblue" : "#fff");

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", (d) => d.children || d._children ? -13 : 13)
            .style("font-size", "9px")
            .attr("font-family", "roboto-light")
            .attr("text-anchor", (d) => d.children || d._children ? "end" : "start")
            .text((d) => d.name);

        // UPDATE
        const nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", (d) => "translate(" + d.y + "," + d.x + ")");

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 10)
            .style("stroke", "steelblue")
            .style("fill", (d) => d._children ? "lightsteelblue" : "#fff")
            .attr('cursor', 'pointer');


        // Remove any exiting nodes
        const nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", (d) => "translate(" + source.y + "," + source.x + ")")
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // ****************** links section ***************************

        // Update the links...
        const link = svg.selectAll('path.link')
            .data(links, (d) => d.id);

        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', () => {
                const o = {x: source.x0, y: source.y0};
                return diagonal(o, o)
            });

        // UPDATE
        const linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', (d) => diagonal(d, d.parent));

        // Remove any exiting links
        const linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', () => {
                const o = {x: source.x, y: source.y};
                return diagonal(o, o)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {
            return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;
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
        return <div className="mountPoint" ref="mountPoint" />;
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