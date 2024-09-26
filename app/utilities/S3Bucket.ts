import fs from "fs";
import AWS from "aws-sdk";
import Multer from 'multer';

let config = require("../config");
const region = config.S3.bucketRegion;
const accessKeyId = config.S3.key;
const secretAccessKey = config.S3.secretKey;

const s3 = new AWS.S3({
  region,
  accessKeyId,
  secretAccessKey,
});

export const uploadFile = async (data: any, name: string): Promise<any> => {

 let fileStream = fs.createReadStream(data.filepath);

  const params: any = {
    Bucket: config.S3.bucketName,
    Body: fileStream,
    Key: name,
    ContentType: data.mimetype,
  };
  console.log(params)
  return s3
    .upload(params, (s3Err: any, data: any) => {
      if (s3Err) throw new s3Err();
      console.log(`File uploaded successfully at ${data.Location}`);
    })
    .promise();
};



export const uploadFileUsingMulter = async (file: Express.Multer.File, name: string): Promise<string> => {
try {
      const params: any = {
          Bucket: config.S3.bucketName,
          Body: file.buffer,
          Key: name,
          ContentType: file.mimetype
      }
      var result = await s3.upload(params).promise();
      return result.Key;
  } catch (e) {
      throw e;
  }
}


// downloads file from s3
export function getFileStream(fileKey: any) {
  const downloadParams: any = {
    key: fileKey,
    Bucket: config.S3.bucketName,
  };
  s3.getObject(downloadParams).createReadStream();
}

export const uploadLocalFile = async (
  path: any,
  name: string,
  type: any
): Promise<any> => {
  const data = fs.readFileSync(path);
  const params: any = {
    Bucket: config.S3.bucketName,
    Body: data,
    Key: name,
    ContentType: type,
  };
  console.log("params",params)
  const uploadPromise = s3.upload(params).promise();
  const uploadResult = await uploadPromise;
  return uploadResult?.Location;
};

async function getListOfObjectsInS3Bucket(): Promise<string[]> {
  const params = {
    Bucket: config.S3.bucketName,
  };

  const response = await s3.listObjectsV2(params).promise();
  const objects =
    response.Contents?.map((object) => object.Key as string) || [];
  console.log(objects);
  return objects;
}

export const uploadBuffer = async (
  name: string,
  type: any,
  data: any
): Promise<any> => {
  try {
    const params: any = {
      Bucket: config.S3.bucketName,
      Body: data,
      Key: name,
      ContentType: type,
    };

    let downloadUrl;
    var bucket = config.S3.bucketName;

    await s3
      .upload(params, (s3Err: any, data: any) => {
        if (s3Err) {
          throw s3Err;
        } else {
          downloadUrl = s3.getSignedUrl("getObject", {
            Bucket: bucket,
            Key: name,
          });
        }
      })
      .promise();

    return downloadUrl;
  } catch (error) {
    console.log("Error uploading file:------------->", error);
    throw error;
  }
};
