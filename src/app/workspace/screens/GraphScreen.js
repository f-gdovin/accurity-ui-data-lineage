import React from "react";
import ForceGraph from "../components/ForceGraph";
import RadialTidyGraph from "../components/RadialTidyGraph";
import CollapsibleTree from "../components/CollapsibleTree";
import FluidGraph from "../components/FluidGraph";
import SankeyGraph from "../components/SankeyGraph";

const radialTidyGraphStaticData = require('json-loader!../data/radialTidy.json');
const sankeyGraphStaticData = require('json-loader!../data/sankey.json');

class GraphScreen extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const width = this.props.width;
        const height = this.props.height;

        let graph;
        switch (this.props.graphType) {
            case "force-graph": {
                graph = (
                    <ForceGraph/>
                );
                break;
            }
            case "radial-tidy-graph": {
                graph = (
                    <RadialTidyGraph graph={radialTidyGraphStaticData}/>
                );
                break;
            }
            case "collapsible-tree": {
                graph = (
                    <CollapsibleTree graph={radialTidyGraphStaticData}/>
                );
                break;
            }
            case "fluid-graph": {
                graph = (
                    <FluidGraph graph={radialTidyGraphStaticData}/>
                );
                break;
            }
            case "sankey-graph": {
                graph = (
                    <SankeyGraph graph={sankeyGraphStaticData}/>
                );
                break;
            }
            default: {
                graph = (
                    <div style={{width: width, height: height}}>
                    </div>
                );
                break;
            }
        }

        return (
            <div className="graph" style={{width: width, height: height, border: '2px solid #323232'}}>
                {graph}
            </div>

        )
    }
}
GraphScreen.propTypes = {
    width: React.PropTypes.string.isRequired,
    height: React.PropTypes.string.isRequired,
    graphType: React.PropTypes.string.isRequired
};

export default GraphScreen;