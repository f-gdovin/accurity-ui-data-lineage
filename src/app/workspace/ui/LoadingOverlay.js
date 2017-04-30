import React from "react";
import Loadable from "react-loading-overlay";

class LoadingOverlay extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isActive: props.show,
            text: props.text
        };
    }

    setActive(isActive: boolean) {
        this.setState({isActive: isActive});
    }

    setText(text: string) {
        this.setState({text: text});
    }

    setBoth(isActive: boolean, text: string) {
        this.setState({
            isActive: isActive,
            text: text
        });
    }

    render() {
        return <div className="loadingOverlay">
            <Loadable
                active={this.state.isActive}
                spinnerSize={this.props.spinnerSize}
                text={this.state.text}
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