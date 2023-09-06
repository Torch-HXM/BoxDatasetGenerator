import './style.css'
import * as BABYLON from "babylonjs"
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
const camera = new BABYLON.FreeCamera( "camera", new BABYLON.Vector3(0, 100, -100), scene);
camera.setTarget(BABYLON.Vector3.Zero());
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
var box_birth_pos = new BABYLON.Vector3(0, container_size, 0);

var box_sizes = [{width:13, height:3, depth:4.5}, {}, {}];

var box_material = new BABYLON.StandardMaterial("box material", scene);
box_material.diffuseColor = BABYLON.Color3.Red();

function createRandomBox(){
  if(counter < 100){
    var box = new BABYLON.MeshBuilder.CreateBox("box"+counter, {width:13, height:3, depth:4.5}, scene);
    box.position = box_birth_pos;
    box.
    box.material = box_material;
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, {mass:2, restitution:0.3}, scene);
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