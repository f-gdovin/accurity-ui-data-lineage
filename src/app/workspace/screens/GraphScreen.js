import React from "react";
import PropTypes from "prop-types";
import AlertContainer from "react-alert-es6";
import ForceGraph from "../components/ForceGraph";
import SankeyGraph from "../components/SankeyGraph";
import DataStore from "../utils/DataStore";
import LoadingOverlay from "../ui/LoadingOverlay";
import SettingsSetter from "../utils/SettingsSetter";

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
        const loadingState = DataStore.getLoadingState();

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
                <LoadingOverlay ref={(a) => global.load = a} spinnerSize={"320px"} text={loadingState.loadingText}
                                show={loadingState.isLoading}/>
                <AlertContainer ref={(a) => global.msg = a} {...this.alertOptions} />

                <SettingsSetter/>
                {graph}
            </div>

        )
    }
}
GraphScreen.propTypes = {
    graphType: PropTypes.string
};

export default GraphScreen;