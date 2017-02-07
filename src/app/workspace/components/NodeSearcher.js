import React from 'react';
import $ from 'jquery';
import Autocomplete from 'jquery-ui/ui/widgets/autocomplete'

class NodePicker extends React.Component {

    componentWillMount () {
        this.gc = [];
        this.setState({
            node: ''
        })
    }
    componentWillUnmount () {
        this.gc.forEach((widget) => widget.destroy())
    }
    handleChange (event) {
        this.setState({ node: event.currentTarget.value })
    }
    initAutocomplete (event) {
        if ($(event.currentTarget).data('ui-autocomplete')) {
            return
        }

        const nodes = this.props.nodes;

        //searching for nodes
        let optArray = [];
        for (let i = 0; i < nodes.length - 1; i++) {
            optArray.push(nodes[i].name);
        }

        optArray = optArray.sort();

        let autocomplete = new Autocomplete({
            source: optArray,
            change: (event) => this.handleChange(event)
        }, event.currentTarget)
        this.gc.push(autocomplete)
    }

    //let React do the first render
    render() {
        return <div className="widgets">
            <input id='searchInput' type='text' onFocus={this.initAutocomplete.bind(this)} onChange={this.handleChange.bind(this)} />
            <button className="find-node">Search</button>
        </div>;
    }
}
NodePicker.propTypes = {
    nodes: React.PropTypes.arrayOf({
        name: React.PropTypes.string.isRequired,
        size: React.PropTypes.number.isRequired,
        type: React.PropTypes.string.isRequired,
        group: React.PropTypes.number.isRequired,
        id: React.PropTypes.string.isRequired
    })
};
export default NodePicker;