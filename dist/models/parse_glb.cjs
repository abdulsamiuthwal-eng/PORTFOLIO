const fs = require("fs");

const parseGlb = (file) => {
  const buffer = fs.readFileSync(file);
  
  // Read header
  const magic = buffer.readUInt32LE(0);
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);
  
  if (magic !== 0x46546C67) {
    console.error("Not a GLB file");
    return;
  }
  
  // Read chunk 0 (JSON)
  const chunkLength = buffer.readUInt32LE(12);
  const chunkType = buffer.readUInt32LE(16);
  
  if (chunkType !== 0x4E4F534A) {
    console.error("First chunk is not JSON");
    return;
  }
  
  const jsonBuffer = buffer.slice(20, 20 + chunkLength);
  const gltf = JSON.parse(jsonBuffer.toString("utf8"));
  
  console.log("Mesh Names:");
  if (gltf.meshes) {
    gltf.meshes.forEach((mesh, index) => {
      console.log(`Mesh ${index}: ${mesh.name}`);
    });
  } else {
    console.log("No meshes");
  }

  console.log("\nNode Names:");
  if (gltf.nodes) {
    gltf.nodes.forEach((node, index) => {
      if (node.name) {
        console.log(`Node ${index}: ${node.name}`);
      }
    });
  } else {
    console.log("No nodes");
  }
};

parseGlb("character_restored.glb");
