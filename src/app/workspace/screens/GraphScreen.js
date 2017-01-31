import React from "react";
import Graph from "../components/Graph";

const DataGenerator = require('../data/DataGenerator');
const staticData = require('json!../data/miserables.json');

const defaultProps = { width: 800, height: 600 };

class GraphScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
    }

    render() {
        const data = DataGenerator.randomData(this.state.data.nodes, this.props.width, this.props.height);
        return (
            <div style={{width: '100%', height: '100%'}}>
                <button className="reset-zoom">Reset zoom</button>
                <Graph graph={staticData}/>
            </div>
        );
    }
}
GraphScreen.propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
};

export default GraphScreen;