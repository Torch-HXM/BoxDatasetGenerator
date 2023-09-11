import './style.css'
import * as BABYLON from "babylonjs"
import * as cannon from "https://cdn.babylonjs.com/cannon.js"
import {createRandomBox, boxPointGenerator} from "./module/box.js"
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
var boxes_data = {"counter":0, "max_num":180, "box":[]};
function createBoxes(){
  if(boxes_data["counter"] < boxes_data["max_num"]){
    var box = createRandomBox(boxes_data["counter"], scene);
    boxes_data["box"].push(box);
    boxes_data["counter"] += 1;
    setTimeout(createBoxes, 20);
  }
}
console.log("creating box.");
createBoxes();

// var box = new BABYLON.MeshBuilder.CreateBox("test box", {width:14, height:8, depth:4}, scene);
// var material = new BABYLON.StandardMaterial("box material", scene);
// material.alpha = 1;
// box.material = material;

// var box_points = boxPointGenerator(14, 8, 4, 2);
// var planes = [];
// var plane_material = new BABYLON.StandardMaterial("plane material", scene);
// plane_material.diffuseColor = new BABYLON.Color3.Yellow();

// for(var i=0;i<6;i++){
//   var rotation_quaternion;
//   if(i==0 | i==1){
//     rotation_quaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, 0);
//   }
//   else if(i==2 | i==3){
//     rotation_quaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI/2);
//   }
//   else{
//     rotation_quaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2);
//   }

//   for(var j=0;j<box_points[i].length;j++){
//     var plane = new BABYLON.MeshBuilder.CreatePlane("p"+i+j, {size:1}, scene);
//     plane.rotationQuaternion = rotation_quaternion;
//     plane.position = box_points[i][j];
//     plane.material = plane_material;
//     plane.occlusionQueryAlgorithmType = BABYLON.AbstractMesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
//     plane.occlusionType = BABYLON.AbstractMesh.OCCLUSION_TYPE_STRICT;
//     planes.push(plane);
//   }
// }

// // keep still
// var speed_limit = 0.5;
// var angle_limit = 0.5;
// var still_counter = 0;
// var still_threshold = 100;

// function keepStill(){
//   if(still_counter<still_threshold){
//     var if_still = true;
//     for(var i=0;i<boxes_data["box"].length;i++){
//       if(boxes_data["box"][i].position.y<0){
//         boxes_data["box"].splice(i, 1);
//       }
//       else{
//         var box_linear_speed = boxes_data["box"][i].physicsImpostor.getLinearVelocity();
//         var box_angle_speed = boxes_data["box"][i].physicsImpostor.getAngularVelocity();
//         var if_linear_speed_tolerate = box_linear_speed.x <= speed_limit && box_linear_speed.y <= speed_limit && box_linear_speed.z <= speed_limit;
//         var if_angle_speed_tolerate = box_angle_speed.x <= angle_limit && box_angle_speed.y <= angle_limit && box_angle_speed.z <= angle_limit;

//         if_still = if_still && if_linear_speed_tolerate && if_angle_speed_tolerate;
//       }
//     }
//     if(if_still){
//       still_counter++;
//     }
//     else{
//       still_counter=0;
//     }
//   }
//   else if(still_counter==still_threshold){
//     for(var i=0;i<boxes_data["box"].length;i++){
//       boxes_data["box"][i].physicsImpostor.sleep();
//     }
//     still_counter++;
//     console.log("keep still", still_counter);
//     console.log("box number: %d", boxes_data["box"].length);
//   }
//   else{
//     // scene.registerBeforeRender(applyPatches);
//     scene.unregisterBeforeRender(keepStill);
//   }
// }
// scene.registerBeforeRender(keepStill);

// // patches
// var c = 2;
// function applyPatches(){
//   for(var k=0;k<boxes_data["box"].length;k++){
//     var box = boxes_data["box"][k];
//     box.material.alpha = 0.3;
//     var box_points = boxPointGenerator(box.width, box.height, box.depth, c);
//     var plane_material = new BABYLON.StandardMaterial("plane material", scene);
//     plane_material.diffuseColor = new BABYLON.Color3.Yellow();

//     for(var i=0;i<6;i++){
//       var rotation_quaternion;
//       if(i==0 | i==1){
//         rotation_quaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, 0);
//       }
//       else if(i==2 | i==3){
//         rotation_quaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI/2);
//       }
//       else{
//         rotation_quaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2);
//       }

//       for(var j=0;j<box_points[i].length;j++){
//         var plane = new BABYLON.MeshBuilder.CreatePlane("p"+i+j, {size:1}, scene);
//         plane.rotationQuaternion = rotation_quaternion;
//         plane.position = box_points[i][j];
//         plane.material = plane_material;
//         plane.occlusionQueryAlgorithmType = BABYLON.AbstractMesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
//         plane.occlusionType = BABYLON.AbstractMesh.OCCLUSION_TYPE_STRICT;
//         // planes.push(plane);
//       }
//     }
//   }
//   scene.unregisterBeforeRender(applyPatches);
// }

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