import './style.css'
import * as BABYLON from "babylonjs"
import * as cannon from "https://cdn.babylonjs.com/cannon.js"
import {POSPAIR, completePOSPAIR, createRandomBox} from "./module/box.js"
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
const light = new BABYLON.HemisphericLight( "light", new BABYLON.Vector3(0, 0, 0), scene);
light.intensity = 0.8;

// camera
const camera = new BABYLON.ArcRotateCamera("camera", 45, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
camera.setPosition(new BABYLON.Vector3(0, 150, -150));
camera.attachControl(canvas, true);

// container
// createContainer(scene);

// complete pospair
completePOSPAIR(scene);

// create boxes and patches
var boxes_data = {"counter":0, "max_num":1, "c":2, "box":[]};
function createBoxes(){
  if(boxes_data["counter"] < boxes_data["max_num"]){
    const box = createRandomBox(boxes_data["counter"], boxes_data["c"], scene);
    boxes_data["box"].push(box);
    boxes_data["counter"] += 1;
    setTimeout(createBoxes, 40);
  }
}
console.log("creating box.");
createBoxes();

// remove boxes's physics's engine
const speed_limit = 0.5;
const angle_limit = 0.5;
const still_threshold = 100;
let still_counter = 0;
let start_patches = false;

function keepStill(){
  if(still_counter<still_threshold){
    let if_still = true;
    for(let i=0;i<boxes_data["box"].length;i++){
      const box = boxes_data["box"][i];
      const if_x_out_limit = box.position.x>container_base_data["size"]/2 | box.position.x<-container_base_data["size"]/2
      const if_y_out_limit = box.position.y<0 | box.position.y>container_base_data["size"];
      const if_z_out_limit = box.position.z>container_base_data["size"]/2 | box.position.z<-container_base_data["size"]/2
      
      if(if_x_out_limit | if_y_out_limit | if_z_out_limit){
        box.physicsImpostor.sleep();
        box.isVisible = false;
        boxes_data["box"].splice(i, 1);
        i--;
        console.log("delete.");
      }
      else{
        const box_linear_speed = box.physicsImpostor.getLinearVelocity();
        const box_angle_speed = box.physicsImpostor.getAngularVelocity();
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
    still_counter++;
    console.log("keep still", still_counter);
    console.log("box number: %d", boxes_data["box"].length);
  }
  else{
    start_patches = true;
    scene.onBeforeRenderObservable.removeCallback(keepStill);
  }
}
scene.onBeforeRenderObservable.add(keepStill);

// patches
scene.onBeforeRenderObservable.add(noName);
function noName(){
  if(start_patches){
    // get the box to caculate.
    let box = getBoxTurn();
    // all the box has done caculating.
    if(box==null){
      console.log("finish.")
      scene.onBeforeRenderObservable.removeCallback(noName);
    }
    // wait for patches's caculating.
    else{
      // done caculate
      if(ifOccludedDataReady(box)){
        let exposedOccludedNum = getExposedOccludedPatchesNum(box);
        box.exposedOccludedNum = exposedOccludedNum;
        console.log(box.exposedOccludedNum);
      }
      // next scene;
      else{
        ;
      }
    }
  }
}

function getBoxTurn(){
  for(let i=0;i<boxes_data["box"].length;i++){
    let box = boxes_data["box"][i];
    if(box.scvp){
      if(box.fcvp){
        // the box has finish caculating.
      }
      else{
        // patches have stick to the box, but the box haven't finish caculating.
        return box;
      }
    }
    else{
      // stick patches to box.
      let patches = box.patches;
      for(let i=0;i<6;i++){
        for(let j=0;j<patches[i].length;j++){
          const plane = patches[i][j];
          plane.position = box.position;
          plane.rotation = new BABYLON.Vector3(0, 0, 0);
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
          plane.position = BABYLON.Vector3.TransformCoordinates(plane.box_point, box_matrix);
          plane.isVisible = true;
        }
      }
      box.scvp = true;
      // return the box for caculating.
      return box;
    }
  }
  return null; // 此时，所有的box都已经计算完毕.
}

let ready_counter = 0;
function ifOccludedDataReady(box){
  let patches = box.patches;
  let if_ready = true;
  
  if(ready_counter<1){
    for(let i=0;i<6;i++){
      for(let j=0;j<patches[i].length;j++){
        if_ready = if_ready && patches[i][j].isOcclusionQueryInProgress;
        patches[i][j].isOccluded; // weakup
        if(!if_ready){
          return false;
        }
      }
    }
    ready_counter++;
    return false;
  }
  else{
    ready_counter = 0;
    return true;
  }
}

function getExposedOccludedPatchesNum(box){
  let patches = box.patches;
  let exposedOccludedNum = {0:{"exposed":0, "occluded":0}, 
                            1:{"exposed":0, "occluded":0}, 
                            2:{"exposed":0, "occluded":0}, 
                            3:{"exposed":0, "occluded":0}, 
                            4:{"exposed":0, "occluded":0}, 
                            5:{"exposed":0, "occluded":0}};
  for(let i=0;i<6;i++){
    for(let j=0;j<patches[i].length;j++){
      if(patches[i][j].isOccluded){
        exposedOccludedNum[i]["occluded"]++;
      }
      else{
        exposedOccludedNum[i]["exposed"]++;
      }
    }
  }

  box.fcvp = true;

  return exposedOccludedNum;
}

// let getOccludedResultCounter = 0;
// let stop_sign = 0;
engine.runRenderLoop(()=>{
  for(let i=0;i<boxes_data["box"].length;i++){
    let box = boxes_data["box"][i];
    let patches = box.patches;
    let expose_num = 0;
    let hide_num = 0;
    for(let j=0;j<6;j++){
      for(let k=0;k<patches[j].length;k++){
        if(patches[j][k].isOccluded){
          hide_num++;
        }
        else{
          expose_num++;
        }
      }
    }
    console.log("boxId:%d, expose|hide:%d|%d.", i, expose_num, hide_num);
  }
  scene.render();
});
// resize
window.addEventListener("resize", ()=>{
  engine.resize();
});