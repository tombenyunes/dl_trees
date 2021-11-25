const { exec } = require('child_process');

module.exports = function (app)
{

    app.get('/api/', function (req, res)
    {
        var generate_image = exec('sudo sh ./scripts/generate_image.sh',
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