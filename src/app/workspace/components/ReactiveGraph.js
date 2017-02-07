import React from 'react';
import * as d3 from 'd3';

//NOT USED YET, BUT PROBABLY BETTER IF WE DECIDE TO STICK STRICTLY WITH REACT
color = d3.scaleOrdinal(d3.schemeCategory20);

export const Node = React.createClass({
    render: function () {
        return (
            <circle
                r={5}
                cx={this.props.x}
                cy={this.props.y}
                style={{
                    "fill": color(this.props.group),
                    "stroke": "#fff",
                    "strokeWidth": "1.5px"
                }}/>
        )
    }
});

export const Link = React.createClass({


});

export const Graph = React.createClass({

    getInitialState: function () {
        let width = 900;
        let height = 900;
        let simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) {
                return d.id;
            }))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2))
            .nodes(data.nodes)
            .on("tick", ticked);

        return {
            width: width,
            height: height,
            simulation: simulation,
            nodes: null,
            links: null
        }
    },

    componentDidMount: function () {
        const self = this;
        // refactor entire graph into sub component - force layout shouldn't be
        // manipulating props, though this works
        this.state.simulation
            .nodes(this.props.data.nodes)
            .links(this.props.data.links)
            .start();
        this.state.simulation.on("tick", ticked);

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
                });
        }
    },
    drawLinks: function () {
        const links = this.props.data.links.map(function (link, index) {
            return (<Link datum={link} key={index}/>)
        });
        return (<g>
            {links}
        </g>)
    },
    drawNodes: function () {
        return this.props.data.nodes.map(function (node, index) {
            return (<Node
                    key={index}
                    x={node.x}
                    y={node.y}
                    group={node.group}/>
            )
        });
    },
    render: function () {
        return (
            <div>
                <div style={{"marginLeft": "20px", "fontFamily": "Helvetica"}}>

                </div>
                <svg
                    style={{"border": "2px solid black", "margin": "20px"}}
                    width={this.state.width}
                    height={this.state.height}>
                    {this.drawLinks()}
                    {this.drawNodes()}
                </svg>
            </div>
        )
    }
});