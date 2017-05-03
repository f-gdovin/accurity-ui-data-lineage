import React from 'react';
import AlertContainer from "react-alert-es6";
import LoadingOverlay from "./LoadingOverlay";

class Extras extends React.Component {

    constructor(props) {
        super(props);
        this.alertOptions = {
            offset: 14,
            position: 'bottom left',
            theme: 'dark',
            time: 5000,
            transition: 'scale'
        };
    }

    render() {
        return (
            <div className="extras">
                <LoadingOverlay ref={(a) => global.load = a} spinnerSize={"320px"} text={""}
                                show={false}/>
                <AlertContainer ref={(a) => global.msg = a} {...this.alertOptions} />
            </div>
        )
    }
}
export default Extras;
