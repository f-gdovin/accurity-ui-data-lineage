import React from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";
import ObjectTransformer from "../../utils/ObjectTransformer";
import DataSetPicker from "../optionsPickers/DataSetPicker";
import DataGetter from "../../utils/DataGetter";
import DataStore from "../../utils/DataStore";

class SankeyGraph extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            graph: {
                nodes: DataStore.getState().dataLineageData.nodes,
                links: DataStore.getState().dataLineageData.links
            },
            graphDrawn: true,
            showSettings: false
        };
    }

    componentDidMount() {
        this.init();
        this.draw();
    }

    draw() {
        const graph = this.state.graph;
        graph.nodes = [].concat(graph.nodes ? graph.nodes : []);
        graph.links = DataStore.getState().dataLineageData.links;

        const width = this.props.width;
        const height = this.props.height;
        const units = "Mappings";

        const formatNumber = d3.format(",.0f"),    // zero decimal places
            format = (d) => formatNumber(d) + " " + units,
            color = d3.scaleOrdinal(d3.schemeCategory20);

        // Zooming
        function zoomFunction() {
            let transform = d3.zoomTransform(this);
            svg.attr("transform", transform);
        }

        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", zoomFunction);

        // append the svg canvas to the page
        const svg = d3.select(this.refs.mountPoint)
            .append("div")
            .call(zoom).on("dblclick.zoom", null)
            .append("svg:svg")
            //responsive SVG needs these 2 attributes and no width and height attr
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + width + " " + height)

            .attr("pointer-events", "all")
            .append('svg:g')
            .attr('fill', 'white');

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
            .on("click", this.highlightLinks)
            .call(d3.drag()
                .subject(function(d) {
                    return d;
                })
                .on("start", function() {
                    this.parentNode.appendChild(this);
                })
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
            d3.select(this).attr("transform", (d) => "translate(" + (d.x = d3.event.x) + "," + (d.y = d3.event.y) + ")");
            sankey.relayout();
            link.attr("d", path);
        }
    }

    highlightLinks(node) {
        let remainingNodes = [],
            nextNodes = [];

        let stroke_opacity = 0;
        if (d3.select(this).attr("data-clicked") === "1") {
            d3.select(this).attr("data-clicked", "0");
            stroke_opacity = 0.2;
        } else {
            d3.select(this).attr("data-clicked", "1");
            stroke_opacity = 0.8;
        }

        const traverse = [{
            linkType: "sourceLinks",
            nodeType: "target"
        }, {
            linkType: "targetLinks",
            nodeType: "source"
        }];

        traverse.forEach((step) => {
            node[step.linkType].forEach((link) => {
                remainingNodes.push(link[step.nodeType]);
                this.highlightLink(link.id, stroke_opacity);
            });

            while (remainingNodes.length) {
                nextNodes = [];
                remainingNodes.forEach((node) => {
                    node[step.linkType].forEach((link) => {
                        nextNodes.push(link[step.nodeType]);
                        this.highlightLink(link.id, stroke_opacity);
                    });
                });
                remainingNodes = nextNodes;
            }
        });
    }

    highlightLink(id, opacity) {
        d3.select("#link-" + id).style("stroke-opacity", opacity);
    }



    reloadDataSets() {
        const dataSets = DataStore.getAdditionalData().dataSets;
        const dataSetPicker = this.refs.dataSetPicker;

        // TODO: use newly fetched options, but select old ones if possible?
        dataSetPicker.setOptions(ObjectTransformer.wrapAsOptions(dataSets));
        this.setState({graphDrawn: true});
        msg.success("Data Sets loaded");
    }

    updateAndRedraw() {
        const graph = {
            nodes: DataStore.getState().dataLineageData.nodes,
            links: DataStore.getState().dataLineageData.links
        };
        this.setState({graph: graph}, () => {
            //Clear the canvas and redraw
            d3.selectAll('.mountPoint > div').remove();
            this.draw();
        });
    }

    // Get Data Sets
    init() {
        this.setState({graphDrawn: false});
        DataGetter.loadSpecificData({objectType: "dataSet"}, "dataSets", this.reloadDataSets.bind(this));
    }

    //let React do the first render
    render() {
        const dataSets = DataStore.getAdditionalData().dataSets;
        return (
            <div>
                {/*left side*/}
                <div className="reinitialiser">
                    <button disabled={!this.state.graphDrawn} style={{float: 'left'}} className="btn btn-danger"
                            onClick={() => {
                                this.init()
                            }}>Load Data Sets
                    </button>
                </div>
                <DataSetPicker ref="dataSetPicker"
                                   options={ObjectTransformer.wrapAsOptions(dataSets)}/>

                {/*middle*/}
                <div className="redrawer">
                    <button disabled={!this.state.graphDrawn} style={{float: 'left'}} className="btn btn-greenlight"
                            onClick={() => {
                                this.updateAndRedraw()
                            }}>Redraw
                    </button>
                </div>

                <div className="mountPoint" ref="mountPoint"/>
            </div>);
    }
}
SankeyGraph.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
};
export default SankeyGraph;