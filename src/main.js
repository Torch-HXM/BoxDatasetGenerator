import './style.css'
import * as BABYLON from "babylonjs"
import * as cannon from "https://cdn.babylonjs.com/cannon.js"
import {completePOSPAIR, createRandomBox, isBoxStill} from "./module/box.js"
import {createContainer} from "./module/container.js"
import {getBoxTurn, getExposedsize} from "./module/areaSize.js"

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
const camera = new BABYLON.ArcRotateCamera("camera", 45, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
// camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
camera.setPosition(new BABYLON.Vector3(0, 150, -150));
camera.attachControl(canvas, true, true);

// container
const container = createContainer(scene);

// complete pospair
completePOSPAIR(scene);

// create boxes and patches
var dataContainer = {"counter":0, "max_num":180, "c":2, "box":[]};
function createBoxes(){
  if(dataContainer["counter"] < dataContainer["max_num"]){
    const box = createRandomBox(dataContainer["counter"], dataContainer["c"], scene);
    dataContainer["box"].push(box);
    dataContainer["counter"] += 1;
    setTimeout(createBoxes, 20);
  }
}
console.log("creating box.");
createBoxes();

// detect if boxes remain still
const speed_limit = 3;
const angle_limit = 3;
const still_threshold = 100;
let still_counter = 0;
let start_ray = false;

function keepStill(){
  if(still_counter<still_threshold){
    const if_still = isBoxStill(dataContainer, speed_limit, angle_limit);
    if(if_still) still_counter++;
    else still_counter=0;
  }
  else if(still_counter==still_threshold){
    for(let i=0;i<dataContainer["box"].length;i++) dataContainer["box"][i].physicsImpostor.sleep();
    still_counter++;
    console.log("keep still", still_counter);
    console.log("box number: %d", dataContainer["box"].length);
  }
  else{
    start_ray = true;
    scene.onBeforeRenderObservable.removeCallback(keepStill);
  }
}
scene.onBeforeRenderObservable.add(keepStill);

// caculate exposed area size
scene.onBeforeRenderObservable.add(areaSizeLoop);
function areaSizeLoop(){
  if(start_ray){
    // get the box to caculate.
    let box = getBoxTurn(dataContainer);
    // all the box has done caculating.
    if(box==null){
      for(let i=0;i<dataContainer["box"].length;i++){
        console.log(dataContainer["box"][i].exposedAreaScale);
      }
      console.log("finish.")
      scene.onBeforeRenderObservable.removeCallback(areaSizeLoop);
    }
    // caculate this box
    else{
      getExposedsize(container, box, dataContainer, canvas, engine, scene);
    }
  }
}


// render
engine.runRenderLoop(()=>{
  scene.render();
});
// resize
window.addEventListener("resize", ()=>{
  engine.resize();
});