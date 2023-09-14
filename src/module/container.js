export let container_base_data = {
    "size":72,
    "depth":1,
    "alpha":0.3,
    "restitution":0.2,
}

export function createContainer(scene){
    // visiable edges
    container_base_data["material"] = new BABYLON.StandardMaterial("container edges material", scene);
    container_base_data["material"].alpha = container_base_data["alpha"];
    container_base_data["material"].diffuseColor = new BABYLON.Color3.Blue();
    let visible_edges = [];
    const container_loop_data = {
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
    for(let i=0;i<container_loop_data["name"].length;i++){
        const edge = new BABYLON.MeshBuilder.CreateBox(container_loop_data["name"][i], 
                                                    {width:container_loop_data["size"][i][0], height:container_loop_data["size"][i][1], depth:container_loop_data["size"][i][2]}, 
                                                    scene);
        edge.material = container_base_data["material"];
        edge.physicsImpostor = new BABYLON.PhysicsImpostor(edge, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:container_base_data["restitution"]}, scene);
        edge.position = container_loop_data["position"][i];

        visible_edges.push(edge);
    }
    
    // invisiable edges
    const limit_base_data = {
        "width":72,
        "height":72+20,
        "depth":0.1,
        "material":new BABYLON.StandardMaterial("limit edges material", scene), 
        "alpha":0,
        "restitution":0.5,
    }
    limit_base_data["material"].alpha = limit_base_data["alpha"];
    const limit_loop_data = {
        "name":["left edge", "right edge", "front edge", "back edge", "top edge", "bottom edge"],
        "size":[[limit_base_data["depth"], limit_base_data["height"], limit_base_data["width"]],
                [limit_base_data["depth"], limit_base_data["height"], limit_base_data["width"]],
                [limit_base_data["width"], limit_base_data["height"], limit_base_data["depth"]],
                [limit_base_data["width"], limit_base_data["height"], limit_base_data["depth"]],
                [limit_base_data["width"], limit_base_data["depth"], limit_base_data["width"]],
                [limit_base_data["width"], limit_base_data["depth"], limit_base_data["width"]]],
        "position":[new BABYLON.Vector3(-(limit_base_data["width"] + limit_base_data["depth"])/2, (limit_base_data["height"] + limit_base_data["depth"])/2, 0), 
                    new BABYLON.Vector3((limit_base_data["width"] + limit_base_data["depth"])/2, (limit_base_data["height"] + limit_base_data["depth"])/2, 0),
                    new BABYLON.Vector3(0, (limit_base_data["height"] + limit_base_data["depth"])/2, -(limit_base_data["width"] + limit_base_data["depth"])/2),
                    new BABYLON.Vector3(0, (limit_base_data["height"] + limit_base_data["depth"])/2, (limit_base_data["width"] + limit_base_data["depth"])/2),
                    new BABYLON.Vector3(0, (limit_base_data["height"] + limit_base_data["depth"]), 0),
                    new BABYLON.Vector3(0, 0, 0)]
    };
    for(let i=0;i<limit_loop_data["name"].length;i++){
        const edge = new BABYLON.MeshBuilder.CreateBox(limit_loop_data["name"][i], 
                                                    {width:limit_loop_data["size"][i][0], height:limit_loop_data["size"][i][1], depth:limit_loop_data["size"][i][2]}, 
                                                    scene);
        edge.material = limit_base_data["material"];
        edge.physicsImpostor = new BABYLON.PhysicsImpostor(edge, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:limit_base_data["restitution"]}, scene);
        edge.position = limit_loop_data["position"][i];
    }
    // merge edges
    return new BABYLON.Mesh.MergeMeshes(visible_edges);
}