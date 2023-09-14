import {container_base_data} from "./container.js"
import {boxPointGenerator} from "./point.js"

/*
 * for POSPAIR
 * 0->back, 1->front, 2->right, 3->left, 4->top, 5->down
 */
export var POSPAIR = {
  0:{
      "file_path":"/pics/1.jpg",
      "map_size":[1280, 1621],
      "width":14,
      "height":4,
      "depth":10,
      "pos_pair":{0:[350, 790, 945, 623], 1:[350, 1390, 945, 1217], 2:[950, 1218, 1115, 790], 3:[177, 621, 350, 194], 4:[350, 1220, 945, 791],  5:[350, 620, 945, 195]},
      "points":{},
      "spheres":{}
  },
  1:{
      "file_path":"/pics/2.jpg",
      "map_size":[1280, 1363],
      "width":13,
      "height":2.5,
      "depth":8,
      "pos_pair":{0:[280, 792, 1000, 651], 1:[280, 211, 1000, 71], 2:[998, 654, 1137, 209], 3:[142, 1233, 280, 789], 4:[280, 1233, 1000, 792],  5:[280, 652, 998, 211]},
      "points":{},
      "spheres":{}
  },
  2:{
      "file_path":"/pics/6.jpg",
      "map_size":[1280, 1621],
      "width":14,
      "height":4,
      "depth":10,
      "pos_pair":{0:[347, 719, 945, 621], 1:[346, 1390, 944, 1218], 2:[998, 654, 1137, 209], 3:[177, 621, 346, 194], 4:[346, 1219, 945, 791],  5:[347, 620, 946, 194]},
      "spheres":{}
  }
};
// caculate points and patches
/**
 * 
 * @param {BABYLON.Scene} scene
 * fill POSPAIR's points and patches features. 
 */
export function completePOSPAIR(s, scene){
  let POSPAIR_length = 3;
  for(let i=0;i<POSPAIR_length;i++){
    const box_points = boxPointGenerator(
      POSPAIR[i]["width"], 
      POSPAIR[i]["height"], 
      POSPAIR[i]["depth"],
      s
      );
    // balls
    let spheres = {0:[], 1:[], 2:[], 3:[], 4:[], 5:[]};
    for(let j=0;j<6;j++){
      for(let k=0;k<box_points[j].length;k++){
        const sphere_material = new BABYLON.StandardMaterial("sphere material"+i+j+k, scene);
        sphere_material.diffuseColor = new BABYLON.Color3.Black();
        const sphere = new BABYLON.MeshBuilder.CreateSphere("s"+i+j+k, {diameter:1});
        sphere.material = sphere_material;
        // sphere.renderingGroupId = 1;
        spheres[j].push(sphere);
      }
    }
    POSPAIR[i]["spheres"] = spheres;
    POSPAIR[i]["points"] = box_points;
  }
}

function getTexture(mat, file_path, map_size, pos_pair, width, height, depth, scene){
  const texture = new BABYLON.Texture(file_path, scene);
  mat.diffuseTexture = texture;
  let faceUV = new Array(6);
  for(let i=0;i<6;i++){
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
  // create box
  const random_num = Math.floor(Math.random()*3);
  let mat = new BABYLON.StandardMaterial("UV"+counter, scene);
  const options = getTexture(
    mat, 
    POSPAIR[random_num]["file_path"], 
    POSPAIR[random_num]["map_size"], 
    POSPAIR[random_num]["pos_pair"], 
    POSPAIR[random_num]["width"], 
    POSPAIR[random_num]["height"], 
    POSPAIR[random_num]["depth"], 
    scene
  );

  const box = new BABYLON.MeshBuilder.CreateBox("box"+counter, options, scene);
  box.material = mat;
  box.position = new BABYLON.Vector3((Math.random()*container_base_data["size"]/2-container_base_data["size"]/4), container_base_data["size"], (Math.random()*container_base_data["size"]/2-container_base_data["size"]/4));
  box.rotation = new BABYLON.Vector3(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
  box.physicsImpostor = new BABYLON.PhysicsImpostor(
    box, 
    BABYLON.PhysicsImpostor.BoxImpostor, 
    {mass:POSPAIR[random_num]["width"]*POSPAIR[random_num]["height"]*POSPAIR[random_num]["depth"], restitution:0.1}, 
    // {mass:0, restitution:0.1}, 
    scene
  );

  box.localPoints = POSPAIR[random_num]["points"];
  box.worldPoints = {0:[], 1:[], 2:[], 3:[], 4:[], 5:[]};
  box.exposedAreaScale = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0};
  box.spheres = POSPAIR[random_num]["spheres"];
  box.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, -20, 0));
  box.scvp = false; // 如果已经将patches贴到box的表面，则scvf=true; start caculate visible patches 
  return box;
}

export function isBoxStill(dataContainer, speed_limit, angle_limit){
  let if_still = true;
  for(let i=0;i<dataContainer["box"].length;i++){
    const box = dataContainer["box"][i];
    const if_x_out_limit = box.position.x>container_base_data["size"]/2 | box.position.x<-container_base_data["size"]/2
    const if_y_out_limit = box.position.y<0 | box.position.y>container_base_data["size"]+20;
    const if_z_out_limit = box.position.z>container_base_data["size"]/2 | box.position.z<-container_base_data["size"]/2
    
    if(if_x_out_limit | if_y_out_limit | if_z_out_limit){
      box.physicsImpostor.sleep();
      box.isVisible = false;
      dataContainer["box"].splice(i, 1);
      i--;
      console.log("delete.");
    }
    else{
      const box_linear_speed = box.physicsImpostor.getLinearVelocity();
      const box_angle_speed = box.physicsImpostor.getAngularVelocity();
      const if_linear_speed_tolerate = Math.abs(box_linear_speed.x) <= speed_limit && Math.abs(box_linear_speed.y) <= speed_limit && Math.abs(box_linear_speed.z) <= speed_limit;
      const if_angle_speed_tolerate = Math.abs(box_angle_speed.x) <= angle_limit && Math.abs(box_angle_speed.y) <= angle_limit && Math.abs(box_angle_speed.z) <= angle_limit;
      if_still = if_still && if_linear_speed_tolerate && if_angle_speed_tolerate;
    }
  }
  return if_still;
}