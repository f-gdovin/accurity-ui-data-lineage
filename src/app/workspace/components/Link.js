import React from 'react';

class Link extends React.Component {

    render() {
        return (
            <line
                x1={this.props.source.x}
                y1={this.props.source.y}
                x2={this.props.target.x}
                y2={this.props.target.y}
                style={{
                    "stroke": "#999",
                    "strokeOpacity": ".6",
                    "strokeWidth": Math.sqrt(this.props.value)
                }}/>
        );
    }
}
Link.propTypes = {
    source: React.PropTypes.number.isRequired,
    target: React.PropTypes.number.isRequired,
    value: React.PropTypes.number.isRequired,
    id: React.PropTypes.string.isRequired
};
export default Link;
