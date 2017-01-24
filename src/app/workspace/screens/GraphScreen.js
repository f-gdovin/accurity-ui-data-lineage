import React from "react";
import Graph from "../components/Graph";

const DataGenerator = require('../data/DataGenerator');

const defaultProps = { width: 800, height: 600 };

class GraphScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
    }

    render() {
        var data = DataGenerator.randomData(this.state.data.nodes, this.props.width, this.props.height);
        return (
            <div>
                <Graph data={data} width={this.props.width} height={this.props.height} />
            </div>
        );
    }
}
GraphScreen.propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
};

export default GraphScreen;