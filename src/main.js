import './style.css'
import * as BABYLON from "babylonjs"
import * as cannon from "https://cdn.babylonjs.com/cannon.js"
import {createRandomBox} from "./module/box.js"
import {createContainer} from "./module/container.js"

// canvas layout
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height= window.innerHeight;
document.body.appendChild(canvas);
const engine = new BABYLON.Engine(canvas, true);

// scene
const scene = new BABYLON.Scene(engine);
scene.enablePhysics()

// light
const light = new BABYLON.HemisphericLight( "light", new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 0.7;

// camera
var camera = new BABYLON.ArcRotateCamera("camera", 45, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
camera.setPosition(new BABYLON.Vector3(0, 150, -150));
camera.attachControl(canvas, true);

// container
createContainer(scene);

// boxes
var boxes_data = {"counter":0, "max_num":200, "box":[], "notOcculudedBoxId":[]};
function createBoxes(){
  if(boxes_data["counter"] < boxes_data["max_num"]){
    var box = createRandomBox(boxes_data["counter"], scene);
    boxes_data["box"].push(box);
    boxes_data["counter"] += 1;
    setTimeout(createBoxes, 20);
  }
}
createBoxes();

// render
engine.runRenderLoop(()=>{
  scene.render();
});
// resize
window.addEventListener("resize", ()=>{
  engine.resize();
});