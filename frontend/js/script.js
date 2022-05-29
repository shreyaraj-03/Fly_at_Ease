
const video = document.getElementById('videoInput')

//to load models from the faceapi
Promise.all([ 
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
]).then(start)

function start(){
    //document.body.append('Models Loaded')
    //through camera video is recorded
    navigator.getUserMedia(
        {video:{}},
        stream => video.srcObject = stream,
        err => console.error(err)
    )
    //console.log('video added')
    recognizeFaces()
}
//variables declared to count number of capture of face and number of face matches
var count = 0;
var known = 0;
async function recognizeFaces(){
    const labeledDescriptors = await loadLabeledImages()
    //console.log(labeledDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors,0.7)

    video.addEventListener('play',async()=>{
        //console.log('playing')
        //canvas is created here and matched with video's size
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)

        const displaySize = {width: video.width, height: video.height}
        faceapi.matchDimensions(canvas, displaySize)

        setInterval(async()=>{
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
            const resizedDetections = faceapi.resizeResults(detections,displaySize)
            canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)
            
            //results stores the result of the faces matches and by how much percent
            const results = resizedDetections.map((d)=>{
               
                console.log(faceMatcher.findBestMatch(d.descriptor))
                return faceMatcher.findBestMatch(d.descriptor)
            })
            //through every capture,we see here number of face matched if it is greater than a fixed 
            // then the passenger is allowed to board
            results.forEach((result,i)=>{
                const box = resizedDetections[i].detection.box
                count++;
                if(result['_label']!='unknown'&&result['_distance']>=0.4){
                    known++;
                }
                if(count>50){
                    if(known>30){
                        window.location.href = "allow.html";
                    }
                    else{
                        window.location.href = "notallowed.html";
                    }
                    
                }
                console.log(count)
                //draws the box around the detected face
                const drawBox = new faceapi.draw.DrawBox(box, {label: result.toString()})
                drawBox.draw(canvas)
            })
        },100)
    })
}


function loadLabeledImages(){
    //labels cantains the passports's image of the valid passengers
    const labels = ['Modi','Shreya']

    return Promise.all(
        labels.map(async(label)=>{
            const descriptions = []
            for(let i=1; i<2; i++){
                const img = await faceapi.fetchImage(`../images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                //console.log(label + i + JSON.stringify(detections))
                descriptions.push(detections.descriptor)
            }
            //document.body.append(label + 'Faces Loaded | ')
            return new faceapi.LabeledFaceDescriptors(label,descriptions)
        })
    )
}
