import React from "react";
import ReactDOM from "react-dom";
import axios from "axios-es6";
import Dropdown from "react-dropdown-multiselect";
import ForceGraph from "../components/ForceGraph";
import RadialTidyGraph from "../components/RadialTidyGraph";
import CollapsibleTree from "../components/CollapsibleTree";
import FluidGraph from "../components/FluidGraph";
import SankeyGraph from "../components/SankeyGraph";
import NodeSearcher from "../components/NodeSearcher";
import JSONConfigurer from "../data/JSONConfigurer";

const forceGraphStaticData = require('json!../data/force.json');
const radialTidyGraphStaticData = require('json!../data/radialTidy.json');
const sankeyGraphStaticData = require('json!../data/sankey.json');

const axiosGetter = axios.create(JSONConfigurer.createMetaInformation());

let selectedObjectTypes = [];
let loadDataButton;

let realData = [];
let readDataLoaded = false;

class GraphScreen extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        loadDataButton = ReactDOM.findDOMNode(this.refs.loadDataButton);
    }

    loadRealData() {
        loadDataButton.disabled = true;
        readDataLoaded = false;
        let nodes = [];
        let links = [];
        let promiseArray = JSONConfigurer.generateRequest(selectedObjectTypes).map(url => axiosGetter.get(url));
        axios.all(promiseArray)
            .then(function(results) {
                for (let i = 0; i < results.length; i++) {
                    let result = results[i];
                    if (result && result.data) {
                        nodes = nodes.concat(result.data.rows);
                    }

                }
                links = JSONConfigurer.generateLinks(nodes);
                console.log("Received " + JSON.stringify(nodes, null, 2));
                console.log("Computed links " + JSON.stringify(links, null, 2));
                realData = {
                    "nodes": nodes,
                    "links": links
                };
                readDataLoaded = true;
                loadDataButton.disabled = false;
            })
            .catch(error => console.log(error));
    }

    onObjectTypeSelect(options) {
        selectedObjectTypes = options.map(option => option.value);
    }

    render() {
        const width = this.props.width;
        const height = this.props.height;

        let graph;
        switch (this.props.graphType) {
            case "force-graph": {
                const data = readDataLoaded ? realData : forceGraphStaticData;
                graph = (
                    <div style={{width: width, height: height, border: '2px solid #323232',}}>
                        <button style={{float: 'left'}} className="reset-zoom">Reset zoom</button>
                        <NodeSearcher nodes={data.nodes}/>
                        <ForceGraph graph={data}/>
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
                <Dropdown options={JSONConfigurer.generateOptions()} onChange={this.onObjectTypeSelect.bind(this)} placeholder="Select an option" />
                <button ref={"loadDataButton"} style={{float: 'left'}} onClick={() => {this.loadRealData()}}>Load data</button>
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