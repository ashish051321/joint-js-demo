import { Component } from '@angular/core';

import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import * as joint from "../../node_modules/jointjs/dist/joint.js";
import dagre from 'dagre';
import graphlib from 'graphlib';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'joint-js-demo';

  // verticesTool = new joint.linkTools.Vertices();
  // segmentsTool = new joint.linkTools.Segments();
  // boundaryTool = new joint.linkTools.Boundary();
  // removeTool = new joint.linkTools.Remove()

  // toolsView = new joint.dia.ToolsView({
  //   tools: [this.removeTool]
  // });

  // JointJS paper for graph to be drawn on
  jsPaper: joint.dia.Paper;


  // Current Graph Structure being displayed
  graphStructure: GraphStructure;

  jsGraph: joint.dia.Graph;

  defaultNodes: GraphNode[];

  // node ID -> JointJS Object map
  nodeMap: {};

  constructor() {
    this.jsGraph = new joint.dia.Graph;
    this.defaultNodes = [
      {
        id: 'Rule-1',
        name: 'Rule-1',
        description: '',
        dependents: ['Rule-2', 'Rule-3']
      },

      {
        id: 'Rule-2',
        name: 'Rule-2',
        description: '',
        dependents: ['Rule-4']
      },

      {
        id: 'Rule-3',
        name: 'Rule-3',
        description: '',
        dependents: ['Rule-5', 'Rule-8']
      },

      {
        id: 'Rule-4',
        name: 'Rule-4',
        description: '',
        dependents: ['Rule-6']
      },

      {
        id: 'Rule-5',
        name: 'Rule-5',
        description: '',
        dependents: ['Rule-7']
      },

      {
        id: 'Rule-6',
        name: 'Rule-6',
        description: '',
        dependents: []
      },
      {
        id: 'Rule-7',
        name: 'Rule-7',
        description: '',
        dependents: []
      },
      {
        id: 'Rule-8',
        name: 'Rule-8',
        description: '',
        dependents: []
      }
    ];

  }

  ngOnInit() {
    // this.curvedLinksExample();
    // this.gridLayout();
    // this.directedGraph();
  }

  ngAfterViewInit() {
    this.jsPaper = new joint.dia.Paper({
      el: document.getElementById('paper'),
      model: this.jsGraph,
      width: '100%',
      height: '100%',
      gridSize: 10,
      drawGrid: true,
      background: {
        color: 'rgba(0, 255, 0, 0.3)'
      }
    });

    var verticesTool = new joint.linkTools.Vertices({
      snapRadius: 10
    });
    const effectiveNodes: GraphNode[] = localStorage.getItem('myNodes') ? JSON.parse(localStorage.getItem('myNodes')).nodes as unknown as GraphNode[] : this.defaultNodes;
    console.log(effectiveNodes);
    const struct: GraphStructure = {
      name: 'My Directed Graph',
      description: 'This is a demo of the joint js library',
      system: 'Angular 8+',
      nodes: effectiveNodes
    };




    this.setupNewGraphStructure(struct);
    const jsGraph = this.jsGraph;
    this.jsPaper.on({

      'element:pointerdown': function (elementView, evt) {

        evt.data = elementView.model.position();
      },

      'element:pointerup': function (elementView, evt, x, y) {

        var coordinates = new joint.g.Point(x, y);
        var elementAbove = elementView.model;
        var elementBelow = this.model.findModelsFromPoint(coordinates).find(function (el) {
          return (el.id !== elementAbove.id);
        });
        console.log(elementBelow);

        // If the two elements are connected already, don't
        // connect them again (this is application-specific though).
        if (elementBelow && jsGraph.getNeighbors(elementBelow).indexOf(elementAbove) === -1) {

          // Move the element to the position before dragging.
          elementAbove.position(evt.data.x, evt.data.y);

          // Create a connection between elements.
          var link = new joint.shapes.standard.Link();
          link.source(elementAbove);
          link.target(elementBelow);
          link.addTo(jsGraph);

          // Add remove button to the link.
          var tools = new joint.dia.ToolsView({
            tools: [new joint.linkTools.Remove()]
          });
          link.findView(this).addTools(tools);
        }
      }
    });

  }



  // A new graph stucture has come in
  setupNewGraphStructure(graphStruct: GraphStructure): any {
    this.graphStructure = graphStruct;
    if (graphStruct) {
      this.parseAndDisplayGraph(this.graphStructure);
    } else {
      this.jsGraph.clear();
    }
  }

  parseAndDisplayGraph(structure: GraphStructure) {
    const nodes = structure.nodes;
    this.createGraph(nodes);
    joint.layout.DirectedGraph.layout(this.jsGraph, {
      dagre: dagre,
      graphlib: graphlib,
      nodeSep: 80,
      edgeSep: 80,
      rankDir: 'TB',
      setLinkVertices: true,
      marginX: 5,
      marginY: 5
    });
  }

  createGraph(nodes: GraphNode[]) {
    this.jsGraph.clear();
    this.nodeMap = {};

    // Create the nodes
    let x = 100;
    nodes.forEach(node => {
      // const rect = this.createGraphNode(x, 30, node.name);
      const rect = this.createBox(x, 30, node.name);
      x = x + 250;
      rect.addTo(this.jsGraph);
      this.nodeMap[node.id] = rect;
    });

    // Add the links between them
    nodes.forEach(node => {
      const currentRect = this.nodeMap[node.id];
      node.dependents.forEach(dependentNodeName => {
        const sourceNodeRect = this.nodeMap[dependentNodeName];
        let link;
        if (sourceNodeRect) {
          link = new joint.shapes.standard.Link({
            source: currentRect,
            target: sourceNodeRect,
            smooth: false,
            attrs: {
              line: {
                targetMarker: {
                  d: 'M 4 -4 0 0 4 4'
                }
              }
            },
          });
          link.addTo(this.jsGraph);
          const linkView = link.findView(this.jsPaper);
          const removeTool = new joint.linkTools.Remove()

          const toolsView = new joint.dia.ToolsView({
            tools: [removeTool]
          });
          linkView.addTools(toolsView);
        }
      });
    });
  }
  createBox(x, y, name) {
    return new joint.shapes.basic.Rect({
      position: { x, y },
      size: { width: 100, height: 30 },
      attrs: { rect: { fill: 'blue' }, text: { text: name, fill: 'white' } }
    });

  }

  saveGraph() {
    console.log(this.jsGraph.getElements());
    let draftNodes: GraphNode[] = [];
    console.log(this.jsGraph.getElements());
    let x: any[] = this.jsGraph.getElements();
    x.forEach(item => {
      console.log(item.attributes.attrs.text.text);
      draftNodes.push({
        id: item.attributes.attrs.text.text,
        name: item.attributes.attrs.text.text,
        description: item.attributes.attrs.text.text,
        dependents: []
      });
    });

    x.forEach(item => {
      // console.log(this.jsGraph.getSuccessors(item,{deep:false}));
      // const childrenOfItem = this.jsGraph.getSuccessors(item, { deep: false, breadthFirst: true }).filter(x => this.jsGraph.isNeighbor(x, item)).
      //   map(elem => elem.attributes.attrs.text.text).reduce((acc, ele) => (acc + '+' + ele), '');
      const childrenOfItem: any[] = this.jsGraph.getSuccessors(item, { deep: false, breadthFirst: true }).filter(x => this.jsGraph.isNeighbor(x, item));
      childrenOfItem.forEach(x => {
        draftNodes.find(elem => (elem.id === item.attributes.attrs.text.text)).dependents.push(x.attributes.attrs.text.text);
      });
      // console.log('Children of ' + item.attributes.attrs.text.text + ': ' + childrenOfItem);
    });

    // this.jsGraph.bfs(this.jsGraph.getFirstCell(), function (element, distance) {
    // }, { outbound: true });
    console.log('--------');
    console.log(draftNodes);
    localStorage.setItem('myNodes', JSON.stringify({ nodes: draftNodes }));

  }

  addElement() {
    const nodeName = prompt('Node name please ?');
    const rect = this.createBox(10, 10, nodeName);
    rect.addTo(this.jsGraph);
  }

}

export interface GraphNode {
  id: string;             //  Use this to idenify the nodes
  name: string;
  description: string;
  conditions?: string;
  dependents: string[];   // Graph display will use this to connect the nodes
  sensitive?: string;
  insensitive?: string;
  calendar?: string;
  external?: boolean;
  inputParameters?: string;
  outputParameters?: string;
  timeout?: string;
  retries?: string;
  system?: string;
  state?: string;
}

export interface GraphStructure {
  id?: string;
  name: string;
  description: string;
  system: string;

  nodes: GraphNode[];
}

