const sharp = require('sharp');
const fs = require('fs');
const path = require('path');


const dir = {
    traitTypes: `./layers/trait_types`,
    outputs: `./outputs`,
    background: `./layers/background`,
}

const imageFormat = {
    width: 24,
    height: 24
};

const params = JSON.parse(fs.readFileSync(`params.json`))




const main = async () => {    
    const types = fs.readdirSync(dir.traitTypes)  
    let traitTypes = types.concat()
        .map(traitType => (
            fs.readdirSync(`${dir.traitTypes}/${traitType}/`)
                .map(file => {
                    return { trait_Type: traitType, file: file }
                })              
        ));
  
    const backs = fs.readdirSync(`${dir.background}`);
    traitTypes = await (createRandFilesProb(traitTypes));    
    console.log(traitTypes);
    params.files = traitTypes;    
    fs.writeFileSync(`params.json`, JSON.stringify(params));
}

const createRandFilesProb = (traitsArr) => {    
   
    traitsArr.map(path => {
        let max = 20
        let rand = 0
        let smtn = 1
        path.map(obj => {
            rand += Math.trunc(Math.random() * max)+smtn;
            if (rand < 100) {
                obj.probablity = rand                
            }
            else if (rand >= 100) {
                obj.probablity = 100
                max = 0
                rand = 0
                smtn = -1
            }
            else if (rand <= 0) {
               obj.probablity = 0
            }            
        })
        if ((params.mandatory.includes(path[0].trait_Type) && (path.indexOf(100)!=-1))) {
            path[path.length-1] = 100
        }
    })
    return traitsArr.map(path => path.filter(obj =>  obj.probablity > 0 )).filter(path=>!!path.length)
}


    
    


const createCombinations = (traitsArr, max ) => {
    let combinations = []
    traitsArr.map
}


// let i = 1;
// for (const item of backs) {
//     sharp(`${dir.background}/${item}`)
//         .withMetadata()
//         .composite([{ input: `${dir.traitTypes}/punks/${trait.punks[2]}` },
//         { input: `${dir.traitTypes}/top/${trait.top[0]}`}])
//         .resize(imageFormat.width, imageFormat.height)
//         .toFile(`${dir.outputs}/${i++ }.png`)
//         .then(() => {
//             console.log(`Progress: ${i}`);
//         }).catch(error => {
//             console.log(error);
//         })
       
// }

main()