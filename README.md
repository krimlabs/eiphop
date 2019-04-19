
# Introducing Eiphop — An electron IPC wrapper [good fit for React apps]

![](https://cdn-images-1.medium.com/max/800/1*exfDNFxBEkNpQ9_VCsmZCg.jpeg)

Eiphop helps you simplify electron inter process communications. It abstracts the multi channel model to an HTTP like interface. It’s a great fit if you use Redux like state management. It can be used otherwise as well. The name is a combination of electron + hip hop.

#### Why another wrapper ?

The builtin  [electron IPC model](https://electronjs.org/docs/api/ipc-main)  is based on channels & callbacks. You fire a request and forget about it. When the response arrives, the callback is called.

![](https://cdn-images-1.medium.com/max/2000/1*9sWYysjGhEDhVEU7GQvVWg.jpeg)

##### The lady in the centre represents renderer process, calling different > main processes on different channels — Base image by freepik.com

I develop apis and frontends all day. Although multiple channel based architecture is more fluid, I’m more inclined to use a single channel. This helps me model renderer ← → main communications like the HTTP protocol calls.

![](https://cdn-images-1.medium.com/max/2000/1*Ob8iNn2FwUUwVOvntygnjw.jpeg)

##### Modelling ELECTRON IPC on a single channel using EIPHOP.

#### How to use Eiphop ?

Eiphop is available as an  [open sourced](https://github.com/krimlabs/eiphop), 0 dependancy,  [2.4 kb](https://bundlephobia.com/result?p=eiphop@1.0.6)  [npm package](https://www.npmjs.com/package/eiphop). It’s fairly easy to use. Think of Eiphop as electron equivalent of  `fetch`. I’ll walk through how to use Eiphop, by creating a simple server.

If you are wondering how I structure electron-react apps, you might want to read : [A gluten free Electron React setup [ft. live reload]](https://medium.com/@shivekkhurana/a-gluten-free-electron-react-setup-ft-live-reload-f6e5bbbd964)

**Step 0: Install Eiphop**

I prefer yarn, but you can use npm.
```
yarn add eiphop
```

**Step 1: Create two action handlers**

Eiphop’s main goal is to make electron development feel like web development, where the main process is the api and the renderer process is the frontend.

We’ll create two files  `actions/ping.js`  and  `actions/hip.js`. Think of actions folder as a collection of your api sub modules. We have two submodules:
```
// actions/ping.js  
const actions = {  
  ping: (req, res) => {  
     const {payload} = req;  
     res.send({msg: 'pong'});  
     // or res.error({msg: 'failed'})

  }  
}

module.exports = actions;
```
The  `req`  parameter is an object that includes the  `payload`  sent by the client. The  `res`  parameter is an object that includes two methods:  `send`  and  `error`. Action methods can be async too.
```
// actions/hip.js

function sleep(ms) {  return new Promise(resolve => setTimeout(resolve, ms));}


const actions = {  
  hip: async (req, res) => {  
     const {payload} = req;  
     await sleep(1000);  
     res.send({msg: 'hop'});

     // or res.error({msg: 'failed'})  
  }  
}

module.exports = actions;
```
**Step 2: Setup api**

Now create a file called  `api.js`, and add the following to it:
```
// api.js  
const electron = require('electron');  
const {setupMainHandler} = require('eiphop');

const hipActions = require('./actions/hip.js');  
const pingActions = require('./actions/ping.js');

setupMainHandler(electron, {...hipActions, ...pingActions}, true);
```
`setupMainHandler`  takes three arguments:

1.  The electron module to use
2.  The actions map to expose (the above example exposes two actions :  `{ping: function(), hip: function()}`)
3.  Enable logging flag (false by default).

Observe that all actions are exposed as a flattened map, so no two actions can have the same name. This is coherent with simplified a rest api. One route can only point to one resource.

**Step 3: Import api in main process**

You need to import the api module in your main.js. This is the file where you create the BrowserWindow.

  ```
...  
const api = require('./api.js'); // <----- Add this line  
...

function createWindow () {  
 ...  
}

app.on('ready', createWindow)  
...
```
**Step 4: Setup renderer process**

In your renderer’s index.js file, setup the listener as follows:
```
import {setupFrontendListener} from 'eiphop';

// listen to ipc responses  
const electron = window.electron; // or require('electron')  
setupFrontendListener(electron);
```
`setupFrontendListener`  takes only an electron module. There is no support for logging on frontend (I realised it’s easier to console log manually in renderer).

Now your channels are ready. All you need to do is trigger actions.

**Step 5: Call actions**

Use the  `emit`  function to call actions defined in the main action map.
```
import {emit} from 'eiphop';

emit('ping', {you: 'can', pass: 'data', to: 'main'})  
  .then(res => console.log(res)) // will log {msg: 'pong'}  
  .catch(err => console.log(err))  
;

emit('hip', {empty: 'payload'})  
  .then(res => console.log(res)) // will log {msg: 'hop'}  
  .catch(err => console.log(err))  
;
```
`emit`  takes two arguments:

1.  The name of the action to call (this was defined is api.js actions map)
2.  The payload to send (this can be anything, an object, string, list etc)

#### Usage with React

This module was built for react and redux applications. Here is a simple React example :

```import React from 'react';
import {setupFrontendListener, emit, pendingRequests} from 'eiphop';

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
            console.log(pendingRequests);
          });
        ;  
      }}>  
        Ping  
      </button>

      <button onClick={() => {  
        emit('hip')  
          .then((res) => {
            this.setState({hipRes: res})
            console.log(pendingRequests);
          })  
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

```

You can similarly use this with Redux (and other solutions).

----------

I’m building an electron app and publishing my notes and findings as I go along. If you’d like to know how I structure electron-react apps, read this :


[**A gluten free Electron React setup**](https://medium.com/@shivekkhurana/a-gluten-free-electron-react-setup-ft-live-reload-f6e5bbbd964)

If you want to know how I structure React apps in general, Fractal is the way to go:

[**Fractal — A react app structure for infinite scale**  
](https://hackernoon.com/fractal-a-react-app-structure-for-infinite-scale-4dab943092af)

----------

Thanks for reading :)

----------
MIT License

Copyright (c) [2019] [Shivek Khurana]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.