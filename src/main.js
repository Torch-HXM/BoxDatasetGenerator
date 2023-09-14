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
light.intensity = 0.7;

// camera
const camera = new BABYLON.ArcRotateCamera("camera", 45, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
// camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
camera.setPosition(new BABYLON.Vector3(0, 150, -150));
camera.attachControl(canvas, true, true);

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

// detect if boxes remain still
const speed_limit = 0.5;
const angle_limit = 0.5;
const still_threshold = 100;
let still_counter = 0;
let start_ray = false;

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
    start_ray = true;
    scene.onBeforeRenderObservable.removeCallback(keepStill);
  }
}
scene.onBeforeRenderObservable.add(keepStill);

// get points position
scene.onBeforeRenderObservable.add(areaSizeLoop);
function areaSizeLoop(){
  if(start_ray){
    // get the box to caculate.
    let box = getBoxTurn();
    // all the box has done caculating.
    if(box==null){
      console.log("finish.")
      scene.onBeforeRenderObservable.removeCallback(areaSizeLoop);
    }
    // caculate this box
    else{
      caculateRayIntersect();
    }
  }
}

function getBoxTurn(){
  for(let i=0;i<boxes_data["box"].length;i++){
    let box = boxes_data["box"][i];
    if(!box.scvp){
      for(let i=0;i<6;i++){
        let surface_points = box.points[i];
        for(let j=0;j<surface_points.length;j++){
          const box_matrix = box.computeWorldMatrix();
          box.points[i][j] = BABYLON.Vector3.TransformCoordinates(surface_points[j], box_matrix);
          box.spheres[i][j].position = box.points[i][j];
        }
      }
      box.scvp = true;
      return box;
    }
  }
  return null; // 此时，所有的box都已经计算完毕.
}

function caculateRayIntersect(){

}

scene.onAfterRenderObservable.add(()=>{
  for(let k=0;k<boxes_data["box"].length;k++){
    let box = boxes_data["box"][k];
    if(box.scvp){
      for(let i=0;i<6;i++){
        for(let j=0;j<box.points[i].length;j++){
          let point = box.points[i][j];
          let sphere = box.spheres[i][j];
          // start ray
          const worldMatrix = BABYLON.Matrix.Identity();
          const transformMatrix = scene.getTransformMatrix();
          const viewport = scene.activeCamera.viewport;

          const screenSpace = BABYLON.Vector3.Project(point, worldMatrix, transformMatrix, viewport);
          let rayStart = BABYLON.Vector3.Unproject(
            new BABYLON.Vector3(screenSpace.x * canvas.clientWidth, screenSpace.y * canvas.clientHeight, 0),
            engine.getRenderWidth(),
            engine.getRenderHeight(),
            BABYLON.Matrix.Identity(), 
            scene.getViewMatrix(),
            scene.getProjectionMatrix()
          );
          
          let ray = BABYLON.Ray.CreateNewFromTo(rayStart, point);
          let pick = ray.intersectsMesh(box);

          if(pick.hit){
            sphere.material.diffuseColor = new BABYLON.Color3.Blue();
          }
          else{
            sphere.material.diffuseColor = new BABYLON.Color3.Yellow();
          }
        }
      }
    }
  }
})

engine.runRenderLoop(()=>{
  scene.render();
});
// resize
window.addEventListener("resize", ()=>{
  engine.resize();
});