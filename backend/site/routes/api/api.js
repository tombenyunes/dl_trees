const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = function (app)
{
    app.get('/api/', function (req, res)
    {
        // Windows
        if (process.platform == "win32") // win32 applies to 64-bit too
        {
            let generate_image = exec(path.join(__dirname + './../../scripts/generate_image.bat'),
            (error, stdout, stderr) => {
                console.log(stdout);
                console.log(stderr);
                if (error !== null) console.log(`exec error: ${error}`);
            });

            generate_image.on('exit', function() {
                let dir = path.join(__dirname + '/../../../../gan/output/');
                
                // Find all files in the ./gan/output folder
                let files = fs.readdirSync(dir);

                // Without a timeout of 1ms+ there is a chance express will try to send a the file before it has been created
                setTimeout(() => {
                    res.sendFile(dir + files[0]); // only ever 1 file in the files array
                }, 1);
            })
        }

        // Linux, Mac
        else
        {
            let generate_image = exec(path.join(__dirname + './../../scripts/generate_image.sh'),
                (error, stdout, stderr) => {
                    console.log(stdout);
                    console.log(stderr);
                    if (error !== null) console.log(`exec error: ${error}`);
                });

            generate_image.on('exit', function() {
                let dir = path.join(__dirname + '/../../../../gan/output/');
                let files = fs.readdirSync(dir);
                setTimeout(() => {
                    res.sendFile(dir + files[0]);
                }, 1);
            })
        }
    });

}