import React from 'react';
import ReactDOM from 'react-dom';
import GraphScreen from './workspace/screens/GraphScreen';

class Main extends React.Component {

    constructor(props, context) {
        super(props, context);
    }

    componentWillMount () {
        this.setState({
            graphType: null
        });
    }

    setGraphType(type) {
        this.setState({
            graphType: type
        });
    }

    disableFirstButton() {
        ReactDOM.findDOMNode(this.refs.forceGraph).disabled =       true;
        ReactDOM.findDOMNode(this.refs.radialTidyGraph).disabled =  false;
        ReactDOM.findDOMNode(this.refs.collapsibleTree).disabled =  false;
        ReactDOM.findDOMNode(this.refs.fluidGraph).disabled =       false;
    }

    disableSecondButton() {
        ReactDOM.findDOMNode(this.refs.forceGraph).disabled =       false;
        ReactDOM.findDOMNode(this.refs.radialTidyGraph).disabled =  true;
        ReactDOM.findDOMNode(this.refs.collapsibleTree).disabled =  false;
        ReactDOM.findDOMNode(this.refs.fluidGraph).disabled =       false;
    }

    disableThirdButton() {
        ReactDOM.findDOMNode(this.refs.forceGraph).disabled =       false;
        ReactDOM.findDOMNode(this.refs.radialTidyGraph).disabled =  false;
        ReactDOM.findDOMNode(this.refs.collapsibleTree).disabled =  true;
        ReactDOM.findDOMNode(this.refs.fluidGraph).disabled =       false;
    }

    disableFourthButton() {
        ReactDOM.findDOMNode(this.refs.forceGraph).disabled =       false;
        ReactDOM.findDOMNode(this.refs.radialTidyGraph).disabled =  false;
        ReactDOM.findDOMNode(this.refs.collapsibleTree).disabled =  false;
        ReactDOM.findDOMNode(this.refs.fluidGraph).disabled =       true;
    }

    render() {
        return (
            <div>
                <button ref={"forceGraph"}
                        style={{float: 'left'}}
                        onClick={(event) => {this.setGraphType("force-graph"); this.disableFirstButton()}}>Force graph</button>
                <button ref={"radialTidyGraph"}
                        style={{float: 'left'}}
                        onClick={(event) => {this.setGraphType("radial-tidy-graph"); this.disableSecondButton()}}>Radial tidy graph</button>
                <button ref={"collapsibleTree"}
                        style={{float: 'left'}}
                        onClick={(event) => {this.setGraphType("collapsible-tree"); this.disableThirdButton()}}>Collapsible tree</button>
                <button ref={"fluidGraph"}
                        style={{float: 'left'}}
                        onClick={(event) => {this.setGraphType("fluid-graph"); this.disableFourthButton()}}>Fluid graph</button>


                <div className="separator" style={{clear: "both"}}/>

                <GraphScreen width='100%' height='{calc(100% - 50px)}' graphType={this.state.graphType}/>
            </div>
        );
    }
}
export default Main;
