const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = function (app)
{
    app.get('/api/', function (req, res)
    {
        // if on windows
        if (process.platform == "win32")
        {
            let generate_image = exec(path.join(__dirname + './../../scripts/generate_image.bat'),
            (error, stdout, stderr) => {
                console.log(stdout);
                console.log(stderr);
                if (error !== null) {
                    console.log(`exec error: ${error}`);
                }
            });

            generate_image.on('exit', function() {
                let dir = path.join(__dirname + '/../../../../gan/output/');
                let files = fs.readdirSync(dir);
    
                setTimeout(() => {
                    res.sendFile(dir + files[0]);
                }, 1);
            })
        }

        // linux, mac
        else
        {
            let generate_image = exec(path.join(__dirname + './../../scripts/generate_image.sh'),
                (error, stdout, stderr) => {
                    console.log(stdout);
                    console.log(stderr);
                    if (error !== null) {
                        console.log(`exec error: ${error}`);
                    }
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