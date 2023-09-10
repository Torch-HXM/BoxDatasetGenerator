import * as BABYLON from "babylonjs"
import * as cannon from "https://cdn.babylonjs.com/cannon.js"
import {container_base_data} from "./container.js"

// 0->back, 1->front, 2->right, 3->left, 4->top, 5->down
var POSPAIR = {
  0:{
      "file_path":"/pics/1.jpg",
      "map_size":[1280, 1621],
      "width":14,
      "height":4,
      "depth":10,
      "pos_pair":{0:[350, 790, 945, 623], 1:[350, 1390, 945, 1217], 2:[950, 1218, 1115, 790], 3:[177, 621, 350, 194], 4:[350, 1220, 945, 791],  5:[350, 620, 945, 195]}
  },
  1:{
      "file_path":"/pics/2.jpg",
      "map_size":[1280, 1363],
      "width":13,
      "height":2.5,
      "depth":8,
      "pos_pair":{0:[280, 792, 1000, 651], 1:[280, 211, 1000, 71], 2:[998, 654, 1137, 209], 3:[142, 1233, 280, 789], 4:[280, 1233, 1000, 792],  5:[280, 652, 998, 211]}
  },
  2:{
      "file_path":"/pics/6.jpg",
      "map_size":[1280, 1621],
      "width":14,
      "height":4,
      "depth":10,
      "pos_pair":{0:[347, 719, 945, 621], 1:[346, 1390, 944, 1218], 2:[998, 654, 1137, 209], 3:[177, 621, 346, 194], 4:[346, 1219, 945, 791],  5:[347, 620, 946, 194]}
  },
};

function getTexture(mat, file_path, map_size, pos_pair, width, height, depth, scene){
  var texture = new BABYLON.Texture(file_path, scene);
  mat.diffuseTexture = texture;
  var faceUV = new Array(6);
  for(var i=0;i<6;i++){
  faceUV[i] = new BABYLON.Vector4(
      pos_pair[i][0]/map_size[0],
      1-pos_pair[i][1]/map_size[1],
      pos_pair[i][2]/map_size[0],
      1-pos_pair[i][3]/map_size[1]  
  );
  }
  return {width:width, height:height, depth:depth, faceUV:faceUV};
}

export function createRandomBox(counter, scene){
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
  return box;
}