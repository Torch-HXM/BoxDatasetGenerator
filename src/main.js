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
const light = new BABYLON.HemisphericLight( "light", new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 0.8;

// camera
const camera = new BABYLON.ArcRotateCamera("camera", 45, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
camera.setPosition(new BABYLON.Vector3(0, 150, -150));
camera.attachControl(canvas, true);

// container
createContainer(scene);

// complete pospair
completePOSPAIR(scene);

// create boxes and patches
var boxes_data = {"counter":0, "max_num":180, "c":2, "box":[]};
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
    scene.onBeforeRenderObservable.removeCallback(keepStill);
    applyPatches();
  }
}
scene.onBeforeRenderObservable.add(keepStill);

// stick patches to boxes's surfaces
function applyPatches(){
  console.log("apply patches");
  let all = 0;
  const exposed_material = new BABYLON.StandardMaterial("exposed patch material", scene);
  exposed_material.diffuseColor = new BABYLON.Color3.Yellow();
  for(let k=0;k<boxes_data["box"].length;k++){
    const box = boxes_data["box"][k];
    box.physicsImpostor.sleep();
    box.material.alpha = 0;
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
        all++;
      }
    }
  }
  console.log("all:%d", all);
}
// outlight unhidden patches
// render
engine.runRenderLoop(()=>{
  // for(let i=0;i<boxes_data["box"].length;i++){
  //   let occluded_num =0;
  //   let exposed_num =0;
  //   let box = boxes_data["box"][i];
  //   let patches = box.patches;
  //   for(var j=0;j<6;j++){
  //     for(var k=0;k<patches[j].length;k++){
  //       let patch = patches[j][k];
  //       if(patch.isOccluded){
  //         occluded_num++;
  //       }
  //       else{
  //         exposed_num++;
  //       }
  //     }
  //   }
  //   console.log("exposed|occluded:%d|%d", exposed_num, occluded_num);
  // }
  scene.render();
});
// resize
window.addEventListener("resize", ()=>{
  engine.resize();
});