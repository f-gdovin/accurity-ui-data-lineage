import React from "react";
import AlertContainer from "react-alert-es6";
import ForceGraph from "../components/ForceGraph";
import RadialTidyGraph from "../components/RadialTidyGraph";
import CollapsibleTree from "../components/CollapsibleTree";
import FluidGraph from "../components/FluidGraph";
import SankeyGraph from "../components/SankeyGraph";

const radialTidyGraphStaticData = require('json-loader!../data/radialTidy.json');
const sankeyGraphStaticData = require('json-loader!../data/sankey.json');

const horizontalPadding = 50;
const verticalPadding = 100;

let w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight,
    graphWidth = x - horizontalPadding,
    graphHeight = y - verticalPadding;

class GraphScreen extends React.Component {

    constructor(props) {
        super(props);
        this.alertOptions = {
            offset: 14,
            position: 'bottom left',
            theme: 'dark',
            time: 5000,
            transition: 'scale'
        };
    }

    render() {
        const width = this.props.width;
        const height = this.props.height;

        let graph;
        switch (this.props.graphType) {
            case "force-graph": {
                graph = (
                    <ForceGraph width={graphWidth} height={graphHeight}/>
                );
                break;
            }
            case "radial-tidy-graph": {
                graph = (
                    <RadialTidyGraph width={graphWidth} height={graphHeight} graph={radialTidyGraphStaticData}/>
                );
                break;
            }
            case "collapsible-tree": {
                graph = (
                    <CollapsibleTree width={graphWidth} height={graphHeight} graph={radialTidyGraphStaticData}/>
                );
                break;
            }
            case "fluid-graph": {
                graph = (
                    <FluidGraph width={graphWidth} height={graphHeight} graph={radialTidyGraphStaticData}/>
                );
                break;
            }
            case "sankey-graph": {
                graph = (
                    <SankeyGraph width={graphWidth} height={graphHeight} graph={sankeyGraphStaticData}/>
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
                <AlertContainer ref={(a) => global.msg = a} {...this.alertOptions} />
                {graph}
            </div>

        )
    }
}
GraphScreen.propTypes = {
    graphType: React.PropTypes.string.isRequired
};

export default GraphScreen;