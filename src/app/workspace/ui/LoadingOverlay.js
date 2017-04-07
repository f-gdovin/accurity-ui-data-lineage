import React from "react";
import Loadable from "react-loading-overlay";

class LoadingOverlay extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div className="loadingOverlay">
            <Loadable
                active={this.props.show}
                spinnerSize={this.props.spinnerSize}
                text={this.props.text}
                color={"rgb(206, 85, 153)"} // glossary color
                background={"#323232"}      // black background
                spinner={true}
                animate={true}
            >
            </Loadable>
        </div>;
    }
}
LoadingOverlay.propTypes = {
    spinnerSize: React.PropTypes.string,
    spinnerColor: React.PropTypes.string,
    text: React.PropTypes.string,
    show: React.PropTypes.bool
};
export default LoadingOverlay;