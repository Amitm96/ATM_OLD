const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient({
    keyFilename: '../service-kjsa-key.json'
});

module.exports = async function (image) {
    // Performs text detection on the local file
    const [result] = await client.textDetection(image);
    const detections = result.textAnnotations;
    if (detections.length) {
        console.log(detections[0].description.trim());
        return detections[0].description.trim();
    }
    return ''
}


if (require.main == module) {
    const fs = require('fs');
    const img = fs.readFileSync(process.argv[2]);
    module.exports(img);
}