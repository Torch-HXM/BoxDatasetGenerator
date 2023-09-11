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
// createContainer(scene);

// boxes
// var boxes_data = {"counter":0, "max_num":200, "box":[], "worldMatrix":[], "notOcculudedBoxId":[]};
// function createBoxes(){
//   if(boxes_data["counter"] < boxes_data["max_num"]){
//     var box = createRandomBox(boxes_data["counter"], scene);
//     boxes_data["box"].push(box);
//     boxes_data["worldMatrix"].push(box.computeWorldMatrix(true));
//     boxes_data["counter"] += 1;
//     setTimeout(createBoxes, 20);
//   }
// }
// createBoxes();

var box = new BABYLON.MeshBuilder.CreateBox("test box", {width:14, height:8, depth:4}, scene);
var material = new BABYLON.StandardMaterial("box material", scene);
material.alpha = 0.3;
box.material = material;

var box_points = boxPointGenerator(14, 8, 4, 2);
var planes = [];
var plane_material = new BABYLON.StandardMaterial("plane material", scene);
plane_material.diffuseColor = new BABYLON.Color3.Yellow();

for(var i=0;i<6;i++){
  var rotation_quaternion;
  if(i==0 | i==1){
    rotation_quaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, 0);
  }
  else if(i==2 | i==3){
    rotation_quaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI/2);
  }
  else{
    rotation_quaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2);
  }

  for(var j=0;j<box_points[i].length;j++){
    var plane = new BABYLON.MeshBuilder.CreatePlane("p"+i+j, {size:1}, scene);
    plane.rotationQuaternion = rotation_quaternion;
    plane.position = box_points[i][j];
    plane.material = plane_material;
    plane.occlusionQueryAlgorithmType = BABYLON.AbstractMesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
    plane.occlusionType = BABYLON.AbstractMesh.OCCLUSION_TYPE_STRICT;
    planes.push(plane);
  }
}

// render
engine.runRenderLoop(()=>{
  // var numOccluded = 0;
  // for(var i=0;i<boxes_data["box"].length;i++){
  //   if(boxes_data["box"][i].position.y<0){
  //     boxes_data["box"].splice(i, 1);
  //   }
  //   else if(boxes_data["box"][i].isOccluded){
  //     numOccluded++;
  //   }
  // }
  // console.log("all:%d, Occluded:%d.", boxes_data["box"].length, numOccluded);
  scene.render();
});
// resize
window.addEventListener("resize", ()=>{
  engine.resize();
});