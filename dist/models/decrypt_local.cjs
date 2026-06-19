const crypto = require("crypto");
const fs = require("fs");

const decryptFile = (inputFile, outputFile, password) => {
  const fileBuffer = fs.readFileSync(inputFile);
  const iv = fileBuffer.slice(0, 16);
  const encryptedData = fileBuffer.slice(16);
  
  const key = crypto.createHash("sha256").update(password).digest();
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  
  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);
  
  fs.writeFileSync(outputFile, decrypted);
  console.log("Decrypted successfully to", outputFile);
};

decryptFile("character.enc", "character_restored.glb", "Character3D#@");
