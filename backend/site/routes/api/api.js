const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = function (app)
{

    // app.get('/api/', function (req, res)
    // {
    //     var generate_image = exec('sudo sh ./scripts/generate_image.sh',
    //         (error, stdout, stderr) => {
    //             console.log(stdout);
    //             console.log(stderr);
    //             if (error !== null) {
    //                 console.log(`exec error: ${error}`);
    //             }
    //         });
    //
    //
    //
    //     var dir = path.join(__dirname + '/../../../../gan/output/');
    //     var files = fs.readdirSync(dir);
    //
    //     var i;
    //     (files.length == 1) ? i = 0 : i = files.length - 1;
    //     res.sendFile(dir + files[i]);
    //     // res.send(file);
    // });

    app.get('/api/', function (req, res)
    {
        let generate_image = exec('sudo sh ./scripts/generate_image.sh',
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
    });

    app.get('/apiwin/', function (req, res)
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
    });

}