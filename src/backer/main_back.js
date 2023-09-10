import './style.css'
import * as BABYLON from "babylonjs"
import {getTexture, POSPAIR} from "./textures.js"
import * as cannon from "https://cdn.babylonjs.com/cannon.js"

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
const light = new BABYLON.HemisphericLight( "light1", new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 0.7;

// camera
var camera = new BABYLON.ArcRotateCamera("camera", 45, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
camera.setPosition(new BABYLON.Vector3(0, 130, -130));
camera.attachControl(canvas, true);

// ground
const ground = new BABYLON.MeshBuilder.CreateGround("ground", {width: 300, height: 300}, scene);
ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:0.5}, scene);
// container's edges
var container_size = 72;
var container_material = new BABYLON.StandardMaterial("container material", scene);
container_material.alpha = 0.3;

var edges = [
  new BABYLON.MeshBuilder.CreateBox( "edge left", {width:0.1, height:container_size/2, depth:container_size}, scene ),
  new BABYLON.MeshBuilder.CreateBox( "edge right", {width:0.1, height:container_size/2, depth:container_size}, scene),
  new BABYLON.MeshBuilder.CreateBox( "edge front", {width:container_size, height:container_size/2, depth:0.1}, scene),
  new BABYLON.MeshBuilder.CreateBox( "edge back", {width:container_size, height:container_size/2, depth:0.1}, scene ),
];
edges[0].position = new BABYLON.Vector3(-container_size/2, container_size/4, 0);
edges[1].position = new BABYLON.Vector3(container_size/2, container_size/4, 0);
edges[2].position = new BABYLON.Vector3(0, container_size/4, -container_size/2);
edges[3].position = new BABYLON.Vector3(0, container_size/4, container_size/2);

for(var i=0; i<4; i++){
  edges[i].physicsImpostor = new BABYLON.PhysicsImpostor(edges[i], BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:0.5}, scene);
  edges[i].material = container_material;
}

// boxes
var counter = 0;
var unit_normal_vector = new BABYLON.Vector3(0, 1, 0)
var boxes_property = {"box":[], "matrix":[]};

function createRandomBox(){
  if(counter < 30){
    var random_num = Math.floor(Math.random()*3);
    var mat = new BABYLON.StandardMaterial("map1", scene);
    var options = getTexture(
      mat, 
      POSPAIR[random_num]["file_path"], 
      POSPAIR[random_num]["map_size"], 
      POSPAIR[random_num]["pos_pair"], 
      POSPAIR[random_num]["width"], 
      POSPAIR[random_num]["height"], 
      POSPAIR[random_num]["depth"], 
      scene
    );

    var box = new BABYLON.MeshBuilder.CreateBox("medicine"+counter, options, scene);
    var matrix = box.computeWorldMatrix(true);
    box.material = mat;
    box.position = new BABYLON.Vector3(Math.random()*container_size/2-container_size/4, container_size, Math.random()*container_size/2-container_size/4);
    box.rotation = new BABYLON.Vector3(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    box.physicsImpostor = new BABYLON.PhysicsImpostor(
      box, 
      BABYLON.PhysicsImpostor.BoxImpostor, 
      {mass:POSPAIR[random_num]["width"]*POSPAIR[random_num]["height"]*POSPAIR[random_num]["depth"], restitution:0.3}, 
      scene
    );
    box.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, -20, 0));
    boxes_property["box"].push(box);
    boxes_property["matrix"].push(matrix);
    counter += 1;

    setTimeout(createRandomBox, 200);
  }
}
createRandomBox();


// var mat = new BABYLON.StandardMaterial("map1", scene);
// var random_num = 0;
// var options = getTexture(
//   mat, 
//   POSPAIR[random_num]["file_path"], 
//   POSPAIR[random_num]["map_size"], 
//   POSPAIR[random_num]["pos_pair"], 
//   POSPAIR[random_num]["width"], 
//   POSPAIR[random_num]["height"], 
//   POSPAIR[random_num]["depth"], 
//   scene
// );

// var box = new BABYLON.MeshBuilder.CreateBox("medicine", options, scene);
// box.material = mat;
// box.position = new BABYLON.Vector3(0, 20, 0);
// box.rotation = new BABYLON.Vector3(Math.PI/4, Math.PI/4, Math.PI/4);

// box.physicsImpostor = new BABYLON.PhysicsImpostor(
//   box, 
//   BABYLON.PhysicsImpostor.BoxImpostor, 
//   {mass:POSPAIR[random_num]["width"]*POSPAIR[random_num]["height"]*POSPAIR[random_num]["depth"], restitution:0.3}, 
//   scene
// );

// var subbox = new BABYLON.MeshBuilder.CreateBox("subbox", {width:4, height:4, depth:4}, scene);
// var matrix = box.computeWorldMatrix(true);
// var local_pos = new BABYLON.Vector3(0, 4, 0);

// render
let highlight = new BABYLON.HighlightLayer('highlight',scene,{camera:camera});
var heigh_rule = {"index":0, "y":0};
var angle_rule = {"index":0, "angle":90};

engine.runRenderLoop(()=>{
  var global_pos = BABYLON.Vector3.TransformCoordinates(local_pos, matrix);
  subbox.position = global_pos;
  subbox.rotationQuaternion = box.rotationQuaternion;

  highlight
  highlight.removeAllMeshes();
  heigh_rule["y"] = 0;
  angle_rule["angle"] = 90;
  for(var i=0;i<counter;i++){
    // for height
    if(boxes_property["box"][i].position.y >= heigh_rule["y"]){
      heigh_rule["index"] = i;
      heigh_rule["y"] = boxes_property["box"][i].position.y;
    }
    // for angle
    
  }
  highlight.addMesh(boxes_property["box"][heigh_rule["index"]], BABYLON.Color3.Blue());
  
  scene.render();
});
// resize
window.addEventListener("resize", ()=>{
  engine.resize();
});