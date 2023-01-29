const AWS = require('aws-sdk');
const url = new AWS.Endpoint("https://ap-south-1.linodeobjects.com");

const { Credentials } = require('aws-sdk');
// import S3 from 'aws-sdk/clients/s3';

const s3Client = new AWS.S3({
    region: 'us-east-1',
    endpoint: url,
    sslEnabled: true,
    s3ForcePathStyle: false,
    credentials: new Credentials({
        accessKeyId: 'T60TOL69ECFV2LAIKEB0',
        secretAccessKey: 'U9ydsCP7bfFXDAN74wd1KgDFbxmm0Al6InHthCZx',
    }),
});

async function uploadFileToObjectStorage(base64Data, fileName, encoding, extension) {
    const params = {
        Bucket: 'merchandise',
        Key: `${fileName}`,
        Body: base64Data,
        ACL: 'public-read',
        ContentEncoding: `${encoding}`,
        ContentType: `${extension}`,
    };

    const { Location } = await s3Client.upload(params).promise();
    return Location;
}

exports.uploadProductsImages = async(req, res) => {

    const imageData = req.files.Image.data
        // console.log(Object.keys(req.files).length)
        // Object.keys(JSON.parse(JSON.stringify(req.files))).length
    const imageType = (req.files.Image.name).split(".").slice(-1).pop();

    const fileName = Date.now().toString(36) + Math.random().toString(36).substring(2) + "." + imageType
    const encoding = req.files.Image.encoding
    const extension = req.files.Image.mimetype
    const imagePath = await uploadFileToObjectStorage(imageData, fileName, encoding, extension)

    return res.status(200).send({ sucess: true, data: { imageURL: imagePath }, message: "Sucessfull" })
}

exports.uploadProductsImagesData = async(imageBaseData) => {


    const imageData = Buffer.from(imageBaseData.replace(/^data:image\/\w+;base64,/, ""), 'base64')
    const fileName = Date.now().toString(36) + Math.random().toString(36).substring(2) + "." + "png";
    const encoding = "base64"
    const extension = "image/png"
    const imagePath = await uploadFileToObjectStorage(imageData, fileName, encoding, extension)
    return { success: true, data: { imageURL: imagePath }, message: 'Successfull' }
}

exports.deleteProductsImagesData = async(imageUrl) => {
    console.log(imageUrl)
    return { success: true, message: "successfully deleted" }
}