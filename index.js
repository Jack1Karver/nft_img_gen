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
    params.files = traitTypes;    
    fs.writeFileSync(`params.json`, JSON.stringify(params));
    const max = params.amount
    let combinations = createCombinations(traitTypes, max)
    let compositeObjArr = createCompositeObj(combinations)
    console.log(compositeObjArr);
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
        if (params.mandatory.includes(path[0].trait_Type) && (!path.some(obj=> obj.probablity == 100))) {
            path[path.length-1].probablity = 100
        }
    })
    return traitsArr.map(path => path.filter(obj =>  obj.probablity > 0 )).filter(path=>!!path.length)
}


    
    


const createCombinations = (traitsArr, max) => {
    let combinations = []
    for (let i = 0; i < max; i++){        
        let comb = (traitsArr.map(type => {
            let random = Math.floor(Math.random() * 100)
            let myObj = type.find(obj => obj.probablity >= random)    
            if (myObj != void (0)) {
                return myObj
            }
            else return {trait_Type:'N/A'}
        }));
        //console.log(comb);
        comb = comb.filter(obj => obj.trait_Type != 'N/A')
        combinations.push(comb)        
    }    
    console.log(combinations);
    return combinations
}

const createCompositeObj = (combinations) => {
    let compositeArr = combinations.map(comb => {
        comb.map(obj=>{
        let composite = []        
        for (const layer in obj) {             
            composite.push({ input: `${dir.traitTypes}/${layer.trait_Type}/${layer.file}`})
        }
            return composite
        })
        return comb
    })
    return compositeArr
}
const drawImage = (combinations, composites, backs) => {
    for (const item of composites) {   
        let rand = Math.round(Math.random() * backs.length)       
        sharp(`${dir.background}/${backs[rand]}`)
            .withMetadata()
            .composite([{ input: `${dir.traitTypes}/punks/${trait.punks[2]}` },
            { input: `${dir.traitTypes}/top/${trait.top[0]}` }])
            .resize(imageFormat.width, imageFormat.height)
            .toFile(`${dir.outputs}/${i++}.png`)
            .then(() => {
                console.log(`Progress: ${i}`);
            }).catch(error => {
                console.log(error);
            })
    
    }
}


main()