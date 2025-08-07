import applyCors from "../lib/cors.js"; 

export default async function handler(req, res) {
  if (applyCors(req, res)) return; 

   if(req.body.backup === "ok") {
    const spawnvar = spawn('../lib/Backupscript.sh', 
['']);

spawnvar.on('error', (error) => {
  console.error(`Failed to start child process: ${error}`);
});

spawnvar.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});
     spawnvar.on('close', (code) => {
         console.log(`child process exited with code ${code}`);
 
  if(code === 0){


  res.set('Content-Type', 'application/zip');
  res.download('../lib/greenbay.zip', err => {
    if (err) {
      console.error('Error sending file:', err);
    } else {
      // Delete the zip file after it has been sent
     fs.unlinkSync('../lib/greenbay.zip');
 const spawnvar = spawn('../lib/Removegreenbay.sh', 
['']);
    }
  });
}

});

}
}
