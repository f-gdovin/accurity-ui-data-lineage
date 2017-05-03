import React from "react";
import {Redirect} from 'react-router-dom'
import ForceGraph from "../graphs/ForceGraph";
import DataStore from "../../utils/DataStore";

const horizontalPadding = 50;
const verticalPadding = 120;

let w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight,
    graphWidth = x - horizontalPadding,
    graphHeight = y - verticalPadding;

class BusinessModelGraphPage extends React.Component {

    render() {
        const isLogged = DataStore.isUserLogged();
        if (!isLogged) {
            msg.error('You are not connected to any Glossary. Please connect and try again.');

            return (
                <Redirect to="/"/>
            )
        }
        return (
            <div className="graph-div shadow">
                <ForceGraph width={graphWidth} height={graphHeight}/>
            </div>);
    }
}

export default BusinessModelGraphPage;