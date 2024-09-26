import axios from "axios";
import fs from "fs"


const downloadAndStoreImage = async function(url:any, filename:any){
    console.log("uri:any, filename:any, callback:any",url, filename)
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    try {
      fs.writeFileSync(filename, response.data);
      console.log('Image downloaded successfully!');
      return filename;
    } catch (err) {
      // Handle the error
      console.error('Error downloading image:', err);
      // Optionally return null or another value to indicate failure
      return err;
    }
    
};


export default {
    downloadAndStoreImage
};
