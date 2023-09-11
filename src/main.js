import './style.css'
import * as BABYLON from "babylonjs"
import * as cannon from "https://cdn.babylonjs.com/cannon.js"
import {createRandomBox} from "./module/box.js"
import {createContainer, container_base_data} from "./module/container.js"

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
var boxes_data = {"counter":0, "max_num":100, "c":2, "box":[], "patches":[], "points":[]};
function createBoxes(){
  if(boxes_data["counter"] < boxes_data["max_num"]){
    const box_and_patches = createRandomBox(boxes_data["counter"], boxes_data["c"], scene);
    boxes_data["box"].push(box_and_patches["box"]);
    boxes_data["patches"].push(box_and_patches["patches"]);
    boxes_data["points"].push(box_and_patches["points"]);
    boxes_data["counter"] += 1;
    setTimeout(createBoxes, 40);
  }
}
console.log("creating box.");
createBoxes();

// keep still
const speed_limit = 0.5;
const angle_limit = 0.5;
const still_threshold = 100;
var still_counter = 0;

var ifStillObserver = new BABYLON.Observable();

function keepStill(){
  if(still_counter<still_threshold){
    var if_still = true;
    for(var i=0;i<boxes_data["box"].length;i++){
      if(boxes_data["box"][i].position.y<0 | boxes_data["box"][i].position.y>container_base_data["size"]){
        scene.removeMesh(boxes_data["box"][i]);
        boxes_data["box"].splice(i, 1);
        boxes_data["patches"].splice(i, 1);
        boxes_data["points"].splice(i, 1);
        i--;
      }
      else{
        const box_linear_speed = boxes_data["box"][i].physicsImpostor.getLinearVelocity();
        const box_angle_speed = boxes_data["box"][i].physicsImpostor.getAngularVelocity();
        const if_linear_speed_tolerate = box_linear_speed.x <= speed_limit && box_linear_speed.y <= speed_limit && box_linear_speed.z <= speed_limit;
        const if_angle_speed_tolerate = box_angle_speed.x <= angle_limit && box_angle_speed.y <= angle_limit && box_angle_speed.z <= angle_limit;

        if_still = if_still && if_linear_speed_tolerate && if_angle_speed_tolerate;
      }
    }
    if(if_still){
      still_counter++;
    }
    else{
      still_counter=0;
    }
  }
  else if(still_counter==still_threshold){
    for(var i=0;i<boxes_data["box"].length;i++){
      boxes_data["box"][i].physicsImpostor.sleep();
      delete boxes_data["box"][i].physicsImpostor;
    }
    still_counter++;
    console.log("keep still", still_counter);
    console.log("box number: %d", boxes_data["box"].length);
  }
  else{
    ifStillObserver.notifyObservers();
    scene.onBeforeRenderObservable.remove(keepStill);
  }
}
scene.onBeforeRenderObservable.add(keepStill);

// patches
function applyPatches(){
  console.log("apply patches");
  for(var k=0;k<boxes_data["patches"].length;k++){
    var patches = boxes_data["patches"][k];
    var box = boxes_data["box"][k];
    var points = boxes_data["points"][k];
    box.material.alpha = 0.1;

    for(var i=0;i<6;i++){
      for(var j=0;j<patches[i].length;j++){
        var plane = patches[i][j];
        plane.isVisible = true;
        plane.position = box.position;
        const box_matrix = box.computeWorldMatrix();
        const box_rotation = box.rotationQuaternion.toEulerAngles();

        if(i==0 | i==1){
          plane.addRotation(box_rotation.x, box_rotation.y, box_rotation.z);
        }
        else if(i==2 | i==3){
          plane.addRotation(box_rotation.x, box_rotation.y, box_rotation.z).addRotation(0, Math.PI/2, 0);
        }
        else{
          plane.addRotation(box_rotation.x, box_rotation.y, box_rotation.z).addRotation(Math.PI/2, 0, 0);
        }
        plane.position = BABYLON.Vector3.TransformCoordinates(points[i][j], box_matrix);
      }
    }
  }
}
ifStillObserver.addOnce(applyPatches);

// render
engine.runRenderLoop(()=>{
  // var numOccluded = 0;
  // for(var i=0;i<planes.length;i++){
  //   if(planes[i].isOccluded){
  //     numOccluded++;
  //   }
  // }
  // console.log("all:%d, Occluded:%d.", planes.length, numOccluded);
  scene.render();
});
// resize
window.addEventListener("resize", ()=>{
  engine.resize();
});