import React, { Component } from 'react';
import SortableTree, { removeNodeAtPath, changeNodeAtPath, defaultGetNodeKey } from 'react-sortable-tree';
import fetch from 'cross-fetch';
import './App.css';

class Server {
  constructor(url) {
    this.url = url;
  }
  get apiUrl () {
    return `${this.url}/api/node/`;
  }

  getTree(id) {
    let url = this.apiUrl + (id || '');
    return fetch(url)
      .then(resp => resp.json());
  }

  removeNode(id) {
    return fetch(this.apiUrl + id, {method: 'DELETE'});
  }
  addNode(parentId, title) {
    let url = this.apiUrl + (parentId || '');
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify({title}),
      headers: {'Content-Type': 'application/json'}
    }).then(()=> this.getTree(parentId));
  }
  moveNode(id, position, otherId) {
    let url = this.apiUrl + id;
    return fetch(url, {
      method: 'MOVE',
      body: JSON.stringify({position, sibling: otherId}),
      headers: {'Content-Type': 'application/json'}
    }).then(resp => resp.json());

  }
}
// const server = new Server('http://kapua.local:8000');
const server = new Server('');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {treeData: []};
  }
  getNodeKey = ({node}) => node.id;
  // getNodeKey = defaultGetNodeKey;

  defineInsertPostion(tree, path) {
    let myId = path.pop();
    let parent = path.reduce(
      (next, id) => (next.children||next).find(({id: leafId}) => id === leafId),
      tree
    );
    let children = parent.children || parent;

    if (children.length === 1) {
      return ['first-child', parent.id];
    }
    let myIdx = children.findIndex(node => node.id === myId);
    return myIdx ? ['right', children[myIdx - 1].id] : ['left', children[myIdx + 1].id];

  }
  handleTreeChange = (treeData) => {
    this.setState({treeData});
  }
  handleNodeMove = (data) => {
    const isIndexSame = data.treeIndex === data.prevTreeIndex;
    const isPathSame = String(data.path) === String(data.prevPath);
    if (isIndexSame && isPathSame) {
      return;
    }
    let commonPath = [];
    for (let i = 0; i < data.prevPath.length-1; i++) {
      let step = data.prevPath[i];
      if (step !== data.nextPath[i]) {
	break;
      }
      commonPath.push(step);
    }

    let [pos, otherId] = this.defineInsertPostion(data.treeData, data.nextPath);
    let operation = server.moveNode(data.node.id, pos, otherId);

    if (commonPath.length) {
      operation = operation.then(node => changeNodeAtPath({
	path: commonPath, treeData: this.state.treeData,
	getNodeKey: this.getNodeKey,
	newNode: {...node, expanded: true}
      }));
    }

    operation.then((this.handleTreeChange));
  }

  handleNodeRemove = ({path, node: {id}}) => {
    server.removeNode(id).then(() => removeNodeAtPath({
      path: path, treeData: this.state.treeData,
      getNodeKey: this.getNodeKey,
    })).then(this.handleTreeChange);
  }

  handleNodeInsert = ({path, node: {id}}) => {
    let title = prompt('TestField:');
    if (!title) {
      return;
    }
    let operation = server.addNode(id, title);
    if (id) {
      operation = operation.then(node => changeNodeAtPath({
	path: path, treeData: this.state.treeData,
	getNodeKey: this.getNodeKey,
	newNode: {...node, expanded: true}
      }));
    }
    operation.then((this.handleTreeChange));
  }

  componentDidMount() {
    server.getTree().then(data => this.setState({treeData: data}));
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome</h1>
        </header>
	<div className="App-tree-holder">
	  <button className="App-button" onClick={() => this.handleNodeInsert({path: [], node: {}})}>
	    Add top level node
	  </button>
	  <SortableTree
	    treeData={this.state.treeData}
	    onChange={this.handleTreeChange}
	    onMoveNode={this.handleNodeMove}
	    getNodeKey={this.getNodeKey}
	    generateNodeProps={
	      data =>
		({buttons: [<button onClick={() => this.handleNodeInsert(data)}>&crarr;</button>,
			    <button onClick={() => this.handleNodeRemove(data)}>&times;</button>]})}
	    />
	</div>
      </div>
    );
  }
}

export default App;
