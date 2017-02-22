import React from "react";
import ForceGraph from "../components/ForceGraph";
import RadialTidyGraph from "../components/RadialTidyGraph";
import CollapsibleTree from "../components/CollapsibleTree";
import FluidGraph from "../components/FluidGraph";
import NodeSearcher from "../components/NodeSearcher";

const forceGraphStaticData = require('json!../data/force.json');
const radialTidyGraphStaticData = require('json!../data/radialTidy.json');

class GraphScreen extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const width = this.props.width;
        const height = this.props.height;
        switch (this.props.graphType) {
            case "force-graph": {
                return (
                    <div style={{width: width, height: height, border : '2px solid #323232',}}>
                        <button style={{float: 'left'}} className="reset-zoom">Reset zoom</button>
                        <NodeSearcher nodes={forceGraphStaticData.nodes}/>
                        <ForceGraph graph={forceGraphStaticData}/>
                    </div>
                );
            }
            case "radial-tidy-graph": {
                return (
                    <div style={{width: width, height: height, border : '2px solid #323232',}}>
                        <RadialTidyGraph graph={radialTidyGraphStaticData}/>
                    </div>
                );
            }
            case "collapsible-tree": {
                return (
                    <div style={{width: width, height: height, border : '2px solid #323232',}}>
                        <CollapsibleTree graph={radialTidyGraphStaticData}/>
                    </div>
                );
            }
            case "fluid-graph": {
                return (
                    <div style={{width: width, height: height, border : '2px solid #323232',}}>
                        <label><input type="radio" name="mode" className="radial-tree"/>Radial Tree</label>
                        <label><input type="radio" name="mode" className="radial-cluster"/>Radial Cluster</label>
                        <label><input type="radio" name="mode" className="tree"/>Tree</label>
                        <label><input type="radio" name="mode" className="cluster" defaultChecked="true"/>Cluster</label>
                        <FluidGraph graph={radialTidyGraphStaticData}/>
                    </div>
                );
            }
            default: {
                return (
                    <div style={{width: width, height: height}}>
                    </div>
                );
            }
        }
    }
}
GraphScreen.propTypes = {
    width: React.PropTypes.string.isRequired,
    height: React.PropTypes.string.isRequired,
    graphType: React.PropTypes.string.isRequired
};

export default GraphScreen;