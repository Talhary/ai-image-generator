import axios from 'axios'
import 'dotenv/config'
import Replicate from "replicate";
async function generateImage( prompt, steps = 25, width = 1440, height = 1440) {
    const url = 'https://api.replicate.com/v1/models/black-forest-labs/flux-pro/predictions';
    
    const data = {
      input: {
        steps: steps,
        width: width,
        height: height,
        prompt: prompt,
        guidance: 3,
        interval: 4,
        aspect_ratio: "9:16",
        output_format: "png",
        output_quality: 100,
        safety_tolerance: 5,
        prompt_upsampling: false
      }
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
     
      return result;
      
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const replicate = new Replicate({
    // get your token from https://replicate.com/account/api-tokens
    auth: process.env.REPLICATE_API_TOKEN, // defaults to process.env.REPLICATE_API_TOKEN
  });
const getUrl = async (result)=>{
    let prediction = result
    prediction = await replicate.predictions.get(prediction.id);
    prediction = await replicate.wait(prediction);
    // console.log(prediction)
    if(prediction.status !== 'succeeded') {
     return {err:true,message:prediction.error,url:null}
    }
    
   return {err:false,url:prediction.output,message:prediction}
}
async function upscale(url) {
  const replicateApiUrl = "https://api.replicate.com/v1/predictions";

  const requestBody = {
    version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
    input: {
      seed: 1337,
      image: url,
      prompt: "masterpiece, best quality, highres, <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>",
      dynamic: 13.83,
      handfix: "disabled",
      pattern: false,
      sharpen: 0,
      sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
      scheduler: "DPM++ 3M SDE Karras",
      creativity: 0.09,
      lora_links: "",
      downscaling: false,
      resemblance: 0.6,
      scale_factor: 2,
      tiling_width: 112,
      output_format: "png",
      tiling_height: 144,
      custom_sd_model: "",
      negative_prompt: "(worst quality, low quality, normal quality:2) JuggernautNegative-neg",
      num_inference_steps: 18,
      downscaling_resolution: 768
    }
  };

  try {
    const response = await fetch(replicateApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,  // Your token goes here
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    return data.output[0];
  } catch (error) {
    console.error("Error:", error);
  }
}


export const createImage = async (req,res) => {
    const prompt = req.body.prompt;
    if(!prompt) return res.status(400).json({error: 'Prompt is required'});
    console.log(prompt)
    const image = await generateImage(prompt);

    const url =await getUrl(image)
    res.json({ res:url});
}
export const upscaleImage = async (req,res) => {
    const url = req.body.url;
    const upscaledImage = await upscale(url);
    res.json({ res:upscaledImage});
}
//   generateImage( prompt).then(async(result)=>{
//     const imageUrl = await getUrl(result)
//     console.log(imageUrl.url);
//     const upscaledImage = await upscale(imageUrl.url)
//     console.log(upscaledImage);
//   })
// upscale('https://replicate.delivery/czjl/Mao4IE7lBFanE1boCe353aaguOhey8yrmbN3k4M8XKdYYbmTA/output.png').then(res=>console.log(res))