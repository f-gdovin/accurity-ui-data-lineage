import React from 'react';
import ReactDOM from 'react-dom';
import GraphScreen from './workspace/screens/GraphScreen';

let forceGraphButton,
    radialTidyGraphButton,
    collapsibleTreeButton,
    fluidGraphButton,
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
        radialTidyGraphButton  = ReactDOM.findDOMNode(this.refs.radialTidyGraph);
        collapsibleTreeButton  = ReactDOM.findDOMNode(this.refs.collapsibleTree);
        fluidGraphButton       = ReactDOM.findDOMNode(this.refs.fluidGraph);
        sankeyGraphButton      = ReactDOM.findDOMNode(this.refs.sankeyGraph);
    }

    setGraphType(type) {
        this.setState({
            graphType: type
        });
    }

    disableButton(button) {
        forceGraphButton.disabled       = false;
        radialTidyGraphButton.disabled  = false;
        collapsibleTreeButton.disabled  = false;
        fluidGraphButton.disabled       = false;
        sankeyGraphButton.disabled      = false;

        button.disabled = true;
    }

    render() {
        return (
            <div>
                <button ref={"forceGraph"}
                        style={{float: 'left'}}
                        onClick={() => {this.setGraphType("force-graph"); this.disableButton(forceGraphButton)}}>Force graph</button>
                <button ref={"radialTidyGraph"}
                        style={{float: 'left'}}
                        onClick={() => {this.setGraphType("radial-tidy-graph"); this.disableButton(radialTidyGraphButton)}}>Radial tidy graph</button>
                <button ref={"collapsibleTree"}
                        style={{float: 'left'}}
                        onClick={() => {this.setGraphType("collapsible-tree"); this.disableButton(collapsibleTreeButton)}}>Collapsible tree</button>
                <button ref={"fluidGraph"}
                        style={{float: 'left'}}
                        onClick={() => {this.setGraphType("fluid-graph"); this.disableButton(fluidGraphButton)}}>Fluid graph</button>
                <button ref={"sankeyGraph"}
                        style={{float: 'left'}}
                        onClick={() => {this.setGraphType("sankey-graph"); this.disableButton(sankeyGraphButton)}}>Sankey graph</button>


                <div className="separator" style={{clear: "both"}}/>

                <GraphScreen width='100%' height='{calc(100% - 50px)}' graphType={this.state.graphType}/>
            </div>
        );
    }
}
export default Main;
