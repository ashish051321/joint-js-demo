import { Component } from '@angular/core';

import * as jQuery from 'jquery';
import * as _ from 'lodash';
import * as $ from 'backbone';
import * as joint from "../../node_modules/jointjs/dist/joint.js";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'joint-js-demo';

  ngOnInit() {
    let graph = new joint.dia.Graph;

    let paper = new joint.dia.Paper({
      el: jQuery("#paper"),
      width: 600,
      height: 200,
      model: graph,
      gridSize: 1
    });

    let rect = new joint.shapes.basic.Rect({
      position: { x: 100, y: 30 },
      size: { width: 100, height: 30 },
      attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } }
    });

    let rect2 = rect.clone() as joint.shapes.basic.Rect;
    rect2.translate(300);

    var targetArrowheadTool = new joint.linkTools.TargetArrowhead({
      focusOpacity: 0.5
    });

    var link = new joint.shapes.standard.Link();

    var link = new joint.shapes.standard.Link({
      source: { id: rect.id },
      target: { id: rect2.id}
    });

    graph.addCells([rect, rect2, link]);
}

}
