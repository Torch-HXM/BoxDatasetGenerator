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
camera.setPosition(new BABYLON.Vector3(0, 70, -70));
camera.attachControl(canvas, true);

// ground
const ground = new BABYLON.MeshBuilder.CreateGround("ground", {width: 144, height: 144}, scene);
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
var boxes = [];

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

    var box = new BABYLON.MeshBuilder.CreateBox("medicine1", options, scene);
    var random_birth_pos = Math.random()*container_size/2-container_size/4;
    box.material = mat;
    box.position = new BABYLON.Vector3(random_birth_pos, container_size, random_birth_pos);
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, {mass:POSPAIR[0]["width"]*POSPAIR[0]["height"]*POSPAIR[0]["depth"]/10, restitution:0.3}, scene);
    box.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, -20, 0));
    boxes.push(box);
    counter += 1;

    setTimeout(createRandomBox, 1000);
  }
}
createRandomBox();

// 渲染场景
engine.runRenderLoop(()=>{
  scene.render();
});
// 监听窗口大小变化
window.addEventListener("resize", ()=>{
  engine.resize();
});