import React from 'react';

//NOT USED YET, BUT PROBABLY BETTER IF WE DECIDE TO STICK STRICTLY WITH REACT
class Node extends React.Component {

    render() {
        return (
            <circle
                r={5}
                cx={this.props.x}
                cy={this.props.y}
                style={{
                    "fill": color(this.props.group),
                    "stroke": "#fff",
                    "strokeWidth": "1.5px"
                }}/>
        )
    }
}
Node.propTypes = {
    name: React.PropTypes.string.isRequired,
    size: React.PropTypes.number.isRequired,
    type: React.PropTypes.string.isRequired,
    group: React.PropTypes.number.isRequired,
    id: React.PropTypes.string.isRequired
};
export default Node;
