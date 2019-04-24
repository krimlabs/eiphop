import React from 'react';
import {setupFrontendListener, emit} from 'eiphop';

const electron = window.electron; // or require('electron')  
setupFrontendListener(electron);

class App extends React.Component {  
  constructor(props) {  
    super(props);
    this.state = {pingRes: '', hipRes: ''}
  }

  render() {  
    const {pingRes, hipRes} = this.state;  
    return (<div>
      Ping Res = {JSON.stringify(pingRes)}  
      <br/>  
      Hip Res = {JSON.stringify(hipRes)}  
      <br/>

      <button onClick={() => {  
        emit('ping')  
          .then((res) => {
            this.setState({pingRes: res})
          });
        ;  
      }}>  
        Ping  
      </button>

      <button onClick={() => {  
        emit('hip')  
          .then((res) => {
            this.setState({hipRes: res})
          })
          .catch(err => console.log(err))
        ;  
      }}>  
        Hip  
      </button>  
      <br/>

      (Check console for pending requests)
    </div>);  
  }  
}

export default App;
