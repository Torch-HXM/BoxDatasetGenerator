export function getBoxTurn(dataContainer){
  for(let i=0;i<dataContainer["box"].length;i++){
    let box = dataContainer["box"][i];
    if(!box.scvp){
      for(let i=0;i<6;i++){
        let local_points = box.localPoints[i];
        let world_points = [];
        for(let j=0;j<local_points.length;j++){
          const box_matrix = box.computeWorldMatrix();
          const world_point = BABYLON.Vector3.TransformCoordinates(local_points[j], box_matrix);
          world_points.push(world_point);
        }
        box.worldPoints[i] = world_points;
      }
      box.scvp = true;
      return box;
    }
  }
  return null;
}

export function getExposedsize(container, box, dataContainer, canvas, engine, scene){
  for(let i=0;i<6;i++){
      let exposed_area_scale = 0;
      for(let j=0;j<box.worldPoints[i].length;j++){
      let point = box.worldPoints[i][j];

      let sphere = box.spheres[i][j];
      sphere.position = point;
      // start ray
      const worldMatrix = BABYLON.Matrix.Identity();
      const transformMatrix = scene.getTransformMatrix();
      const viewport = scene.activeCamera.viewport;

      const screenSpace = BABYLON.Vector3.Project(point, worldMatrix, transformMatrix, viewport);
      let rayStart = BABYLON.Vector3.Unproject(
          new BABYLON.Vector3(screenSpace.x * canvas.clientWidth, screenSpace.y * canvas.clientHeight, 0),
          engine.getRenderWidth(),
          engine.getRenderHeight(),
          BABYLON.Matrix.Identity(), 
          scene.getViewMatrix(),
          scene.getProjectionMatrix()
      );
      
      let ray = BABYLON.Ray.CreateNewFromTo(rayStart, point);
      let pick = ray.intersectsMesh(container);
      if(!pick.hit){
          for(let k=0;k<dataContainer["box"].length;k++){
          pick = ray.intersectsMesh(dataContainer["box"][k]);
          if(pick.hit){
              sphere.material.diffuseColor = new BABYLON.Color3.Red();
              break;
          }
          }
          if(!pick.hit){
          exposed_area_scale++;
          sphere.material.diffuseColor = new BABYLON.Color3.Green();
          }
      }
      else{
          sphere.material.diffuseColor = new BABYLON.Color3.Red();
      }
      }
      box.exposedAreaScale[i] = exposed_area_scale;
  }
}