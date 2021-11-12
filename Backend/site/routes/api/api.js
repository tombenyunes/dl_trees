const { spawn } = require('child_process');

module.exports = function (app)
{

    // app.get('/api/', function (req, res)        // respond with all foods
    // {
    //     exec('C:\\dev\\docker_test\\stylegan2-ada-pytorch\\nvid.bat nvidia-smi', (error, stdout, stderr) => {
    //         // if (error) {
    //         //     console.log(`exec error: ${error}`);
    //         //     return;
    //         // }
    //         console.log(`stdout: ${stdout}`);
    //         // console.error(`stderr: ${stderr}`);
    //     });
    //
    //     // res.sendFile(__dirname + '/tree.png');
    // });

    const ls = spawn('C:\\\\dev\\\\docker_test\\\\stylegan2-ada-pytorch\\\\docker_run.bat');

    ls.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
    });

    ls.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });

    ls.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });

    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
    });

}