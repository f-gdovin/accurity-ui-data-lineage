import React from "react";
import ReactDOM from "react-dom";
import axios from "axios-es6";
import ForceGraph from "../components/ForceGraph";
import RadialTidyGraph from "../components/RadialTidyGraph";
import CollapsibleTree from "../components/CollapsibleTree";
import FluidGraph from "../components/FluidGraph";
import SankeyGraph from "../components/SankeyGraph";
import NodeSearcher from "../components/NodeSearcher";

const objectRelationships = require('json!../config.json');

const forceGraphStaticData = require('json!../data/force.json');
const radialTidyGraphStaticData = require('json!../data/radialTidy.json');
const sankeyGraphStaticData = require('json!../data/sankey.json');

const axiosGetter = axios.create({
    baseURL: 'http://localhost:8086/v1/',
    timeout: 4000,
    headers: {'Authorization': 'Basic c3VwZXJhZG1pbjoxMjM0'} //superadmin 1234
});

let loadDataButton;

const requestParams = {
    startFrom: 0,
    maxResults: 12,
    filters: [],
    sort: {
        property: "name",
        type: "ASCENDING"
    }
};

let realData = [];
let readDataLoaded = false;

class GraphScreen extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        loadDataButton = ReactDOM.findDOMNode(this.refs.loadDataButton);
    }

    generateRequest(objectType: String): Function {
        return new Function('objectType', "axiosGetter.get(\'objectType\');")();
    }

    loadRealData() {
        loadDataButton.disabled = true;
        readDataLoaded = false;
        let nodes = [];
        let links = [];
        axios.all([this.generateRequest("subject-areas"),
            axiosGetter.get('entities/')
        ])
            .then(axios.spread((subjectAreas, entities) => {
                nodes = nodes.concat(subjectAreas.data.rows, entities.data.rows);
                links = this.createLinks(nodes);
                // console.log("Received " + JSON.stringify(nodes, null, 2));
                // console.log("Computed links " + JSON.stringify(links, null, 2));
                realData = {
                    "nodes": nodes,
                    "links": links
                };
                readDataLoaded = true;
                loadDataButton.disabled = false;
            }))
            .catch(error => console.log(error));
    }

    createLinks(nodes: []): [] {
        const subjectAreaNodes = nodes.filter(x => x._type === "subjectArea");
        const entityNodes = nodes.filter(x => x._type === "entity");
        const SA_ENT_Links = [];
        let index = 0;

        for (let i = 0; i < entityNodes.length; i++) {
            let entity = entityNodes[i];
            let usedSubjectArea = subjectAreaNodes.find(x => x._uuid === entity.subjectArea._uuid);

            if (usedSubjectArea && usedSubjectArea._uuid) {
                SA_ENT_Links.push({"id": index, "source": usedSubjectArea._uuid, "target": entity._uuid, "value": 1});
                index++;
            }
        }

        return SA_ENT_Links;
    }

    render() {
        const width = this.props.width;
        const height = this.props.height;

        let graph;
        switch (this.props.graphType) {
            case "force-graph": {
                graph = (
                    <div style={{width: width, height: height, border: '2px solid #323232',}}>
                        <button style={{float: 'left'}} className="reset-zoom">Reset zoom</button>
                        <NodeSearcher nodes={forceGraphStaticData.nodes}/>
                        <ForceGraph graph={readDataLoaded ? realData : forceGraphStaticData}/>
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