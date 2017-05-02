import React from 'react';
import ReactDOM from 'react-dom';
import GraphScreen from './workspace/components/screens/GraphScreen';

let forceGraphButton,
    sankeyGraphButton;

class Main extends React.Component {

    constructor(props, context) {
        super(props, context);
    }

    componentWillMount () {
        this.setState({
            graphType: null
        });
    }

    componentDidMount() {
        forceGraphButton       = ReactDOM.findDOMNode(this.refs.forceGraph);
        sankeyGraphButton      = ReactDOM.findDOMNode(this.refs.sankeyGraph);
    }

    setGraphType(type) {
        this.setState({
            graphType: type
        });
    }

    disableButton(button) {
        forceGraphButton.disabled       = false;
        sankeyGraphButton.disabled      = false;

        button.disabled = true;
    }

    render() {
        return (
            <div>
                <div className="mainMenu">
                    <button ref={"forceGraph"}
                            style={{float: 'left'}}
                            onClick={() => {this.setGraphType("force-graph"); this.disableButton(forceGraphButton)}}>Force graph</button>
                    <button ref={"sankeyGraph"}
                            style={{float: 'left'}}
                            onClick={() => {this.setGraphType("sankey-graph"); this.disableButton(sankeyGraphButton)}}>Sankey graph</button>
                </div>
                <div className="separator" style={{clear: "both"}}/>
                <GraphScreen graphType={this.state.graphType}/>
            </div>
        );
    }
}
export default Main;
