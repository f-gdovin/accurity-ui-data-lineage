import React from "react";
import ForceGraph from "../components/ForceGraph";
import RadialTidyGraph from "../components/RadialTidyGraph";
import CollapsibleTree from "../components/CollapsibleTree";
import FluidGraph from "../components/FluidGraph";
import SankeyGraph from "../components/SankeyGraph";

const radialTidyGraphStaticData = require('json!../data/radialTidy.json');
const sankeyGraphStaticData = require('json!../data/sankey.json');

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
                    <div style={{width: width, height: height, border: '2px solid #323232',}}>
                        <ForceGraph/>
                    </div>
                );
                break;
            }
            case "radial-tidy-graph": {
                graph = (
                    <div style={{width: width, height: height, border: '2px solid #323232',}}>
                        <RadialTidyGraph graph={radialTidyGraphStaticData}/>
                    </div>
                );
                break;
            }
            case "collapsible-tree": {
                graph = (
                    <div style={{width: width, height: height, border: '2px solid #323232',}}>
                        <CollapsibleTree graph={radialTidyGraphStaticData}/>
                    </div>
                );
                break;
            }
            case "fluid-graph": {
                graph = (
                    <div style={{width: width, height: height, border: '2px solid #323232',}}>
                        <label><input type="radio" name="mode" className="radial-tree"/>Radial Tree</label>
                        <label><input type="radio" name="mode" className="radial-cluster"/>Radial Cluster</label>
                        <label><input type="radio" name="mode" className="tree"/>Tree</label>
                        <label><input type="radio" name="mode" className="cluster"
                                      defaultChecked="true"/>Cluster</label>
                        <FluidGraph graph={radialTidyGraphStaticData}/>
                    </div>
                );
                break;
            }
            case "sankey-graph": {
                graph = (
                    <div style={{width: width, height: height, border: '2px solid #323232',}}>
                        <button style={{float: 'left'}} className="reset-zoom">Reset zoom</button>
                        <SankeyGraph graph={sankeyGraphStaticData}/>
                    </div>
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
            <div>
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