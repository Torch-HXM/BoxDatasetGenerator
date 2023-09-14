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
  export function boxPointGenerator(width, height, depth, s){
    let box_points = {0:[], 1:[], 2:[], 3:[], 4:[], 5:[]};
  
    const x_lengths = [width, width, depth, depth, width, width];
    const y_lengths = [height, height, height, height, depth, depth];
  
    const pice = 0.01; // let patches over the surface
  
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