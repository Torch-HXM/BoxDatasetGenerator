import * as BABYLON from "babylonjs"
import * as cannon from "https://cdn.babylonjs.com/cannon.js"
import {container_base_data} from "./container.js"

/**
 * @param {int} x_length first choose the edge that parallel to x axis, second choose the edge that vertical to x axis.
 * @param {int} y_length the other edge except the one chosen by x_length.
 * @param {BABYLON.Vector3} offset_vector the surface position offset to box's center.
 * @param {BABYLON.Vector3} rotation_quaternion the surface rotation quaternion.
 * @param {int} s the diameter of robot's arm's sucker.
 * @returns patches's position for single surface in box's local axises.
 */
function surfacePointGenerator(x_length, y_length, offset_vector, rotation_quaternion, s){
  const col = Math.floor(x_length/s);
  const row = Math.floor(y_length/s);
  let surface_points = [];

  for(let c=0;c<col;c++){
    for(let r=0;r<row;r++){
      let point_vector = new BABYLON.Vector3((c+0.5)*s-x_length/2, (r+0.5)*s-y_length/2, 0);
      point_vector = point_vector.applyRotationQuaternion(rotation_quaternion);
      point_vector = point_vector.add(offset_vector);
      surface_points.push(point_vector);
    }
  }
  return surface_points;
}

/**
 * 
 * @param {int} width the box's width
 * @param {int} height the box's height
 * @param {itn} depth the box's depth
 * @param {int} s the diameter of robot's arm's sucker.
 * @returns patches's position for all surfaces in box's local axises.
 */
function boxPointGenerator(width, height, depth, s){
  let box_points = {0:[], 1:[], 2:[], 3:[], 4:[], 5:[]};

  const x_lengths = [width, width, depth, depth, width, width];
  const y_lengths = [height, height, height, height, depth, depth];

  const pice = 0.005; // let patches over the surface

  const offset_vectors = [new BABYLON.Vector3(0, 0, depth/2+pice), 
                          new BABYLON.Vector3(0, 0, -(depth/2+pice)),
                          new BABYLON.Vector3(width/2+pice, 0, 0),
                          new BABYLON.Vector3(-(width/2+pice), 0, 0),
                          new BABYLON.Vector3(0, height/2+pice, 0),
                          new BABYLON.Vector3(0, -(height/2+pice), 0)];

  const rotation_quaternions = [BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, 0),
                              BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Z, 0),
                              BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI/2),
                              BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI/2),
                              BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2),
                              BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI/2)];
  
  for(let i=0;i<offset_vectors.length;i++){
    const surface_points = surfacePointGenerator(x_lengths[i], y_lengths[i], offset_vectors[i], rotation_quaternions[i], s);
    box_points[i] = surface_points;
  }

  return box_points;
}

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
      "patches":{}
  },
  1:{
      "file_path":"/pics/2.jpg",
      "map_size":[1280, 1363],
      "width":13,
      "height":2.5,
      "depth":8,
      "pos_pair":{0:[280, 792, 1000, 651], 1:[280, 211, 1000, 71], 2:[998, 654, 1137, 209], 3:[142, 1233, 280, 789], 4:[280, 1233, 1000, 792],  5:[280, 652, 998, 211]},
      "points":{},
      "patches":{}
  },
  2:{
      "file_path":"/pics/6.jpg",
      "map_size":[1280, 1621],
      "width":14,
      "height":4,
      "depth":10,
      "pos_pair":{0:[347, 719, 945, 621], 1:[346, 1390, 944, 1218], 2:[998, 654, 1137, 209], 3:[177, 621, 346, 194], 4:[346, 1219, 945, 791],  5:[347, 620, 946, 194]},
      "points":{},
      "patches":{}
  }
};
// caculate points and patches
/**
 * 
 * @param {BABYLON.Scene} scene
 * fill POSPAIR's points and patches features. 
 */
export function completePOSPAIR(scene){
  let POSPAIR_length = 3;
  const plane_material = new BABYLON.StandardMaterial("patch material", scene);
  plane_material.diffuseColor = new BABYLON.Color3.Black();
  let s = 2;
  for(let i=0;i<POSPAIR_length;i++){
    const box_points = boxPointGenerator(
      POSPAIR[i]["width"], 
      POSPAIR[i]["height"], 
      POSPAIR[i]["depth"],
      s
      );
    POSPAIR[i]["points"] = box_points;

    let planes = {0:[], 1:[], 2:[], 3:[], 4:[], 5:[]};
    for(let i=0;i<6;i++){
      for(let j=0;j<box_points[i].length;j++){
        // const plane = new BABYLON.MeshBuilder.CreatePlane("p"+i+j, {size:1}, scene);
        const plane = new BABYLON.MeshBuilder.CreateBox("p"+i+j, {width:1, height:1, depth:0.01}, scene);
        plane.material = plane_material;
        plane.material.alpha = 1;
        plane.isVisible = false;
        plane.box_point = box_points[i][j];
        plane.occlusionQueryAlgorithmType = BABYLON.AbstractMesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
        plane.occlusionType = BABYLON.AbstractMesh.OCCLUSION_TYPE_STRICT;
        planes[i].push(plane);
      }
    }
    POSPAIR[i]["patches"] = planes;
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

export function createRandomBox(counter, c, scene){
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
  // box.material = mat;
  box.position = new BABYLON.Vector3((Math.random()*container_base_data["size"]/2-container_base_data["size"]/4)/5, container_base_data["size"]/5, (Math.random()*container_base_data["size"]/2-container_base_data["size"]/4)/5);
  box.rotation = new BABYLON.Vector3(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
  box.physicsImpostor = new BABYLON.PhysicsImpostor(
    box, 
    BABYLON.PhysicsImpostor.BoxImpostor, 
    // {mass:POSPAIR[random_num]["width"]*POSPAIR[random_num]["height"]*POSPAIR[random_num]["depth"], restitution:0.1}, 
    {mass:0, restitution:0.1}, 
    scene
  );
  // box.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, -20, 0));
  box.patches = POSPAIR[random_num]["patches"];
  box.scvp = false; // 如果已经将patches贴到box的表面，则scvf=true; start caculate visible patches 
  box.fcvp = false; // 如果还没有计算完遮挡和裸露，则fcvf=false; finish caculate visible patches 
  return box;
}
