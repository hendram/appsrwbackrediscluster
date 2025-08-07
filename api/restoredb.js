import applyCors from "../lib/cors.js";

export default async function handler(req, res) {
if (applyCors(req, res)) return; 

// Create a writable stream to the desired file location
  const fileStream = fs.createWriteStream('../lib/greenbay.zip');

  // Write the file data to the writable stream
  req.on('data',  function(chunk) {
  fileStream.write(chunk);
  });

  // Close the writable stream
  req.on('end', function() {
  fileStream.end()
   });

  // Send a response to the client

    const spawnvar = spawn('../lib/Restorescript.sh', 
['']);

spawnvar.on('error', (error) => {
  console.error(`Failed to start child process: ${error}`);
});

spawnvar.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});
     spawnvar.on('close', (code) => {
         console.log(`child process exited with code ${code}`);
 const spawnvar = spawn('../lib/Removeallgreenbay.sh', 
['']);
         res.send({answer: "ok"});
});
}
