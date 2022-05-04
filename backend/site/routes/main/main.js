const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');


let config_is_generating = false;
let config_same_seed = false;

let generating_images = false;

let default_resolution = 8;

let gan_output_dir = '/scratch/gan/output/';
let detectron_output_dir = '/scratch/detectron/output/';
let pyxelate_output_dir = '/scratch/pyxelate/output/';

let gan_entry_point = 'python3 /scratch/backend/site/scripts/generate_image.py 2> /dev/null';
let detectron_entry_point = 'python3 /scratch/detectron/TreeRecognition.py 2> /dev/null';
let pyxelate_entry_point = 'python3.7 /scratch/pyxelate/Pyxelate.py 2> /dev/null';

let config_file_path = '/scratch/backend/site/config/config.json';


module.exports = function (app)
{
    app.get('/', function (req, res)
    {
        // don't generate new image when page is reloaded/visited
        read_config_file();
        no_new_image(req, res);
    });

    // post/redirect/get design pattern to avoid 'confirm form resubmission' when reloading
    app.post('/loading', function (req, res)
    {
        res.redirect(307, '/');
    })

    app.post('/', function (req, res)
    {
        read_config_file();

        if (!config_is_generating)
        {
            let detectron_output_dir_files = fs.readdirSync(detectron_output_dir);

            if (!generating_images && detectron_output_dir_files.length <= 20)
            {
                refill_image_buffer();
            }

            write_config_file(req.body.resolution, (req.body.config_same_seed == undefined) ? false : true);

            // if the image buffer contains images, stylize one and send it as a response
            // otherwise, send previous image as response
            if (detectron_output_dir_files.length > 0)
            {
                log_formatted_message("Started image stylization");
                stylize_and_send_image(req, res, detectron_output_dir_files[0], detectron_output_dir_files[1]);
            }
            else
            {
                log_formatted_error("Image buffer is empty. Please wait for it to refill.");
                no_new_image(req, res);
            }
        }
        else 
        {
            log_formatted_error("An image is currently being generated. Please try again in a few moments.");
            no_new_image(req, res);
        }
    });

}

function read_config_file()
{
    // read value of 'generating' from config.json file
    // this refers to if an image is currently being generated

    fs.readFile(config_file_path, 'utf8', (err, data) =>
    {
        if (err) console.log(`Error read file: ${err}`);

        try
        {
            const config_data = JSON.parse(data);
            config_is_generating = config_data.generating;
            config_same_seed = config_data.same_seed;
        }
        catch (error)
        {
            config_is_generating = false;
            config_same_seed = false;
        }
    })
}

function stylize_and_send_image(req, res, previous_image, cur_image)
{
    let pyxelate_start_seconds = Date.now() / 1000;

    let stylize_image = exec(pyxelate_entry_point, (error, stdout, stderr) =>
    {
        if (error !== null) console.log(`exec error: ${error}`);
        // console.log(`stdout: ${stdout}`);
        console.log(stderr);
        
        let seconds_diff = Math.round(((Date.now() / 1000) - pyxelate_start_seconds) * 10) / 10;
        log_formatted_message("Stylized image with Pyxelate in " + seconds_diff + " seconds");
    });
    
    // when image stylization is complete
    stylize_image.on('exit', function()
    {
        send_response(req, res, (config_same_seed) ? previous_image : cur_image)

        // delete previous image if not generating same seed
        if (!config_same_seed)
        {
            let file_to_delete = detectron_output_dir + previous_image;
            delete_image(file_to_delete);
        }
    });
}

function refill_image_buffer()
{
    log_formatted_message("Refilling image buffer");
    generating_images = true;
    let stylegan_start_seconds = Date.now() / 1000;

    let generate_image = exec(gan_entry_point, (error, stdout, stderr) =>
    {
        if (error !== null) console.log(`exec error: ${error}`);
        // console.log(`stdout: ${stdout}`);
        console.log(stderr);

        let seconds_diff = Math.round(((Date.now() / 1000) - stylegan_start_seconds) * 10) / 10;
        log_formatted_message("Generated images from GAN in " + seconds_diff + " seconds")
    });

    generate_image.on('exit', function()
    {
        let detectron_start_seconds = Date.now() / 1000;

        exec(detectron_entry_point, (error, stdout, stderr) =>
        {
            if (error !== null) console.log(`exec error: ${error}`);
            // console.log(`stdout: ${stdout}`);
            console.log(stderr);

            seconds_diff = Math.round(((Date.now() / 1000) - detectron_start_seconds) * 10) / 10;
            log_formatted_message("Removed backgrounds from images in " + seconds_diff + " seconds");

            seconds_diff = Math.round(((Date.now() / 1000) - stylegan_start_seconds) * 10) / 10;
            log_formatted_message("Image buffer refill completed in " + seconds_diff + " seconds");
            
            generating_images = false;
        });
    })
}

function delete_image(file_to_delete)
{
    exec('sudo rm $file_name -f', {env: {'file_name': file_to_delete}}, (error, stdout, stderr) =>
    {
        if (error !== null) console.log(`exec error: ${error}`);
        // console.log(`stdout: ${stdout}`);
        console.log(stderr);
    });
}

function write_config_file(resolution, same_seed)
{
    let config = 
    {
        resolution: resolution,
        generating: false,
        same_seed: same_seed
    }

    fs.writeFile(config_file_path, JSON.stringify(config), 'utf8', (err) => 
    {
        if (err) console.log(`Error writing file: ${err}`);

        fs.chmod(config_file_path, 0o777, (err) =>
        {
            if (err) console.log(`Error writing file: ${err}`);
        });
    })
}

function no_new_image(req, res)
{
    // send most recent image
    let pyxelate_output_dir_files = fs.readdirSync(pyxelate_output_dir);
    
    send_response(req, res, pyxelate_output_dir_files[0])
}

function send_response(req, res, tree_asset)
{
    // try to get resolution from webpage options, otherwise set to default
    let resolution;
    (req.body.resolution != undefined) ? resolution = req.body.resolution : resolution = default_resolution;

    let same_seed;
    (config_same_seed != undefined) ? same_seed = config_same_seed : same_seed = false;

    // case for asset not existing is handled in main.html
    res.render('main.html', { image_name: tree_asset, current_resolution: resolution, same_seed: config_same_seed });
}



function get_formatted_time()
{
    let d = new Date();
    d = d.toLocaleTimeString().slice(0, d.toLocaleTimeString().length - 3);
    return d;
}

function log_formatted_message(message)
{
    console.log("(" + get_formatted_time() + ")" + " ---------- " + message + " ----------")
}

function log_formatted_error(message)
{
    console.log("(" + get_formatted_time() + ")" + " >>>>>>>>>> " + message + " <<<<<<<<<<")
}