const { exec } = require('child_process');
const { spawn } = require('child_process');

module.exports = function (app)
{

    app.get('/api/', function (req, res)        // respond with all foods
    {
        // exec('pwd', (error, stdout, stderr) => {
            // if (error) {
            //     console.log(`exec error: ${error}`);
            //     return;
            // }
            // console.log(stdout);
            // console.error(`stderr: ${stderr}`);
        // });

        var generate_image = exec('sudo sh generate_image.sh',
            (error, stdout, stderr) => {
                console.log(stdout);
                console.log(stderr);
                if (error !== null) {
                    console.log(`exec error: ${error}`);
                }
            });
        // res.sendFile(__dirname + '/tree.png');
    });

}