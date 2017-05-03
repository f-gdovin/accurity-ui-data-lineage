import React from "react";
import {Redirect} from 'react-router-dom'
import SankeyGraph from "../graphs/SankeyGraph";
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

class DataLineageGraphPage extends React.Component {

    render() {
        const isLogged = DataStore.isUserLogged();
        if (!isLogged) {
            msg.error('You are not connected to any Glossary. Please connect and try again.');

            return (
                <Redirect to="/"/>
            )
        }
        return (
            <div style={{border: '2px solid #323232'}}>
                <SankeyGraph width={graphWidth} height={graphHeight}/>
            </div>);
    }
}
export default DataLineageGraphPage;