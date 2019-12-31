
![](https://github.com/krimlabs/eiphop/raw/master/graphics/eiphop-logo.jpg)

**Eiphop abstracts electron's multi-channel IPC model to an HTTP like interface**. It was built in the process of building [httpslocalhost.com](httpslocalhost.com), a mac app that lets you run TLS/SSL services locally.


### Installation
The current stable version is `1.0.12`.

```
yarn add eiphop
```

### Getting started
We tend to think of Eiphop as Redux, except the actions are implemented in the `main` process and invoked from the `renderer`. 

#### Define actions
Imagine you have the following actions in your `main` process: 
```
const pingActions = {  
  ping: (req, res) => {  
     const {payload} = req;  
     res.send({msg: 'pong'});  
  }  
}

const hipActions = {
  hip: async (req, res) => {  
     const {payload} = req;
     res.notify('Sleeping for 800ms, BRB');
     // sleep for 800ms
     await  new  Promise(done  =>  setTimeout(done, 800)); 
     res.send({msg: 'hop'});

     // or res.error({msg: 'failed'})  
  } 
}
```
#### Setup main handler
Actions from different domain objects need to be combined to one global map and passed to eiphop's `setupMainHandler` function. 
```
// somewhere inside main.js

import {setupMainHandler} from 'eiphop';
import electron from 'electron';

setupMainHandler(electron, {...hipActions, ...pingActions}, true);
```
`setupMainHandler`  takes three arguments:

1.  The electron module to use
2.  The actions map to expose (the above example exposes two actions :  `{ping: function(), hip: function()}`)
3.  Enable logging flag (false by default).

#### Setup Renderer Listener
In your renderer’s index.js file, setup the listener as follows:
```
import {setupFrontendListener} from 'eiphop';

// listen to ipc responses  
const electron = window.electron; // or require('electron')  
setupFrontendListener(electron);
```
`setupFrontendListener`  takes only an electron module. There is no support for logging on frontend (we realised it’s easier to console log manually in renderer).

Now your channels are ready. All you need to do is trigger actions.

#### Emit actions and expect response
Use the  `emit`  function to call actions defined in the `main` action map.
```
import {emit} from 'eiphop';

emit('ping', {you: 'can', pass: 'data', to: 'main'}, (msg) => {console.log(msg)})  
  .then(res => console.log(res)) // will log {msg: 'pong'}  
  .catch(err => console.log(err))  
;

emit('hip', {empty: 'payload'}, (msg) => {console.log(msg)})  
  .then(res => console.log(res)) // will log {msg: 'hop'}  
  .catch(err => console.log(err))  
;
```
`emit`  takes up to three arguments:

1.  The name of the action to call (this was defined is actions map in  `main`)
2.  The payload to send (this can be an object, string, list etc)
3.  [Optional] A callback function called by the main process to notify the render process with a message.

### Using Notifiers
For example, sometimes there is a long running operation on the main process and you may want to provide the render process with an update as to it's progress.

You can use notifiers to send a message to the emiter on the render process by using `res.notify` without resolving the promise.

```javascript
// Render process
import {emit} from 'eiphop';

emit('download', {/* fileIds, etc */}, (msg) => {console.log(msg)})  
  .then(res => console.log(res)) // will contain the downloaded file  
  .catch(err => console.log(err))  
;

// Main process
const pingActions = {  
  ping: (req, res) => {  
     const {payload} = req;

     payload.filesToDownload.forEach((fileId) => {
       // Tell the render process what is happening so it can inform the user
       res.notify(`Downloading file ${fileId}`);
       downloadFile(payload.fileId);
     });
     
     res.send({msg: 'pong'});  
  }  
}
```

### Usage with React
Check the `example` folder.

### Why another wrapper ? / How to structure real life apps ?
Check this [blog post](https://medium.com/@shivekkhurana/introducing-eiphop-an-electron-ipc-wrapper-good-fit-for-react-apps-50de6826a47e).

### Contributors 

Thanks and Gratitude :)

- [ANIS DA SILVA CAMPOS](https://github.com/anis-campos) - Built async error handling PR #8, updated build tools PR #9
- [Hadeeb Farhan](https://github.com/hadeeb) - Introduced Typescript definitions PR #3

### License
MIT License

Copyright (c) [2019] [Shivek Khurana]

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
