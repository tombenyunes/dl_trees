const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { finished } = require('stream');

let generating_images = false;
let is_generating = false;


function write_config_file(resolution)
{
    let config = 
    {
        resolution: resolution,
        generating: false
    }

    fs.writeFile('/scratch/backend/site/config.json', JSON.stringify(config), 'utf8', (err) => 
    {
        if (err) {
            console.log(`Error writing file: ${err}`);
        } else {
            // console.log(`File is written successfully`);
        }

        fs.chmod('/scratch/backend/site/config.json', 0o777, (err) =>
        {
            if (err) {
                console.log(`Error writing file: ${err}`);
            } else {
                // console.log(`File permissions changed successfully`);
            }
        });
    })
}


function update_generating_status()
{
    fs.readFile('/scratch/backend/site/config.json', 'utf8', (err, data) =>
    {
        if (err) {
            console.log(`Error read file: ${err}`);
        } else {
            // console.log(`File is read successfully`);
        }

        const config_data = JSON.parse(data);

        is_generating = config_data.generating;
        console.log("is_generating: " + is_generating);
    })
}


module.exports = function (app)
{
    app.get('/', function (req, res)
    {
        // write_config_file(6); # to replace config file if corrupted
        update_generating_status();

        let dir = path.join('/scratch/pyxelate/output/');
        let files = fs.readdirSync(dir);
        setTimeout(() =>
        {
            res.render('main.html', { image_name: files[0], current_resolution: 6, generating_status: is_generating })
        }, 1);
    });

    app.post('/loading', function (req, res)
    {
        res.redirect(307, '/');
    })

    app.post('/', function (req, res)
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
                setTimeout(() =>
                {
                    res.sendFile(dir + files[0]); // only ever 1 file in the files array
                }, 1);
            })
        }

        // Linux/Mac
        else
        {
            update_generating_status();

            if (!is_generating)
            {
                let dir = path.join('/scratch/detectron/output/');
                let files = fs.readdirSync(dir);

                if (!generating_images)
                {
                    if (files.length <= 10)
                    {
                        // console.log("---------- generating images ----------")
                        generating_images = true;

                        let generate_image = exec('sh /scratch/backend/site/scripts/generate_image.sh',
                        (error, stdout, stderr) => {
                            console.log(stdout);
                            console.log(stderr);
                            if (error !== null) console.log(`exec error: ${error}`);
                            // console.log("---------- generated image from stylegan ----------")
                        });
                    
                        generate_image.on('exit', function()
                        {
                            let detect_image = exec('sh /scratch/detectron/detect_image.sh',
                            (error, stdout, stderr) => {
                                console.log(stdout);
                                console.log(stderr);
                                if (error !== null) console.log(`exec error: ${error}`);
                                // console.log("---------- removed background from image ----------")
                            });
            
                            detect_image.on('exit', function()
                            {
                                generate_images = false;
                            })
                        })
                    }


                    write_config_file(req.body.resolution);



                    let stylize_image = exec('python3.7 /scratch/pyxelate/Pyxelate.py',
                        (error, stdout, stderr) => {
                            console.log(stdout);
                            console.log(stderr);
                            if (error !== null) console.log(`exec error: ${error}`);
                            // console.log("---------- stylized image with pyxelate ----------")
                        });
                    
                    stylize_image.on('exit', function()
                    {
                        if (files.length > 0)
                        {
                            let delete_image = exec('sudo rm $file_name', {env: {'file_name': dir + files[0]}},
                                (error, stdout, stderr) => {
                                    console.log(stdout);
                                    console.log(stderr);
                                    if (error !== null) console.log(`exec error: ${error}`);
                                    // console.log("---------- deleted image  ----------")
                                })
                        }
                
                        res.render('main.html', { image_name: files[0], current_resolution: req.body.resolution })
                    });
                }
            }
            else 
            {
                let dir = path.join('/scratch/pyxelate/output/');
                let files = fs.readdirSync(dir);
                setTimeout(() =>
                {
                    res.render('main.html', { image_name: files[0], current_resolution: 6, generating_status: is_generating })
                }, 1);
            }
        }
    });

}