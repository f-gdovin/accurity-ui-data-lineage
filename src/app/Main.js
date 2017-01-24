import React from 'react';
import GraphScreen from './workspace/screens/GraphScreen';

class Main extends React.Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
          <GraphScreen width={800} height={600} />
    );
  }
}
export default Main;
