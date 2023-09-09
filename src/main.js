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
const light = new BABYLON.HemisphericLight( "light", new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 0.7;

// camera
var camera = new BABYLON.ArcRotateCamera("camera", 45, 0, 0, new BABYLON.Vector3(0, 0, -0), scene);
camera.setPosition(new BABYLON.Vector3(0, 150, -150));
camera.attachControl(canvas, true);

// visiable edges
var container_base_data = {
  "size":72,
  "depth":0.1,
  "material":new BABYLON.StandardMaterial("container edges material", scene), 
  "alpha":0.3,
  "restitution":0.5,
}
container_base_data["material"].alpha = container_base_data["alpha"];
var container_loop_data = {
  "name":["left edge", "right edge", "front edge", "back edge", "bottom edge"],
  "size":[[container_base_data["depth"], container_base_data["size"]/2, container_base_data["size"]],
          [container_base_data["depth"], container_base_data["size"]/2, container_base_data["size"]],
          [container_base_data["size"], container_base_data["size"]/2, container_base_data["depth"]],
          [container_base_data["size"], container_base_data["size"]/2, container_base_data["depth"]],
          [container_base_data["size"], container_base_data["depth"], container_base_data["size"]]],
  "position":[new BABYLON.Vector3(-(container_base_data["size"] + container_base_data["depth"])/2, (container_base_data["size"]/4 + container_base_data["depth"]/2), 0), 
              new BABYLON.Vector3((container_base_data["size"] + container_base_data["depth"])/2, (container_base_data["size"]/4 + container_base_data["depth"]/2), 0),
              new BABYLON.Vector3(0, (container_base_data["size"]/4 + container_base_data["depth"]/2), -(container_base_data["size"] + container_base_data["depth"])/2),
              new BABYLON.Vector3(0, (container_base_data["size"]/4 + container_base_data["depth"]/2), (container_base_data["size"] + container_base_data["depth"])/2),
              new BABYLON.Vector3(0, 0, 0)]
};
for(var i=0;i<container_loop_data["name"].length;i++){
  var edge = new BABYLON.MeshBuilder.CreateBox(container_loop_data["name"][i], 
                                              {width:container_loop_data["size"][i][0], height:container_loop_data["size"][i][1], depth:container_loop_data["size"][i][2]}, 
                                              scene);
  edge.material = container_base_data["material"];
  edge.physicsImpostor = new BABYLON.PhysicsImpostor(edge, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:container_base_data["restitution"]}, scene);
  edge.position = container_loop_data["position"][i];
}

// invisiable edges
var limit_base_data = {
  "size":72,
  "depth":0.1,
  "material":new BABYLON.StandardMaterial("limit edges material", scene), 
  "alpha":0,
  "restitution":0.5,
}
limit_base_data["material"].alpha = limit_base_data["alpha"];
var limit_loop_data = {
  "name":["left edge", "right edge", "front edge", "back edge", "top edge", "bottom edge"],
  "size":[[limit_base_data["depth"], limit_base_data["size"], limit_base_data["size"]],
          [limit_base_data["depth"], limit_base_data["size"], limit_base_data["size"]],
          [limit_base_data["size"], limit_base_data["size"], limit_base_data["depth"]],
          [limit_base_data["size"], limit_base_data["size"], limit_base_data["depth"]],
          [limit_base_data["size"], limit_base_data["depth"], limit_base_data["size"]],
          [limit_base_data["size"], limit_base_data["depth"], limit_base_data["size"]]],
  "position":[new BABYLON.Vector3(-(limit_base_data["size"] + limit_base_data["depth"])/2, (limit_base_data["size"] + limit_base_data["depth"])/2, 0), 
              new BABYLON.Vector3((limit_base_data["size"] + limit_base_data["depth"])/2, (limit_base_data["size"] + limit_base_data["depth"])/2, 0),
              new BABYLON.Vector3(0, (limit_base_data["size"] + limit_base_data["depth"])/2, -(limit_base_data["size"] + limit_base_data["depth"])/2),
              new BABYLON.Vector3(0, (limit_base_data["size"] + limit_base_data["depth"])/2, (limit_base_data["size"] + limit_base_data["depth"])/2),
              new BABYLON.Vector3(0, (limit_base_data["size"] + limit_base_data["depth"]), 0),
              new BABYLON.Vector3(0, 0, 0)]
};
for(var i=0;i<limit_loop_data["name"].length;i++){
  var edge = new BABYLON.MeshBuilder.CreateBox(limit_loop_data["name"][i], 
                                              {width:limit_loop_data["size"][i][0], height:limit_loop_data["size"][i][1], depth:limit_loop_data["size"][i][2]}, 
                                              scene);
  edge.material = limit_base_data["material"];
  edge.physicsImpostor = new BABYLON.PhysicsImpostor(edge, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:limit_base_data["restitution"]}, scene);
  edge.position = limit_loop_data["position"][i];
}

// boxes
var counter = 0;
var boxes_data = {"box":[], "matrix":[]};

function createRandomBox(){
  if(counter < 200){
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
    box.material = mat;
    box.position = new BABYLON.Vector3(Math.random()*container_base_data["size"]/2-container_base_data["size"]/4, container_base_data["size"], Math.random()*container_base_data["size"]/2-container_base_data["size"]/4);
    box.rotation = new BABYLON.Vector3(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    box.physicsImpostor = new BABYLON.PhysicsImpostor(
      box, 
      BABYLON.PhysicsImpostor.BoxImpostor, 
      {mass:POSPAIR[random_num]["width"]*POSPAIR[random_num]["height"]*POSPAIR[random_num]["depth"], restitution:0.3}, 
      scene
    );
    box.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, -20, 0));
    boxes_data["box"].push(box);
    counter += 1;

    setTimeout(createRandomBox, 20);
  }
}
createRandomBox();

// catch 

// render
engine.runRenderLoop(()=>{
  
  scene.render();
});
// resize
window.addEventListener("resize", ()=>{
  engine.resize();
});