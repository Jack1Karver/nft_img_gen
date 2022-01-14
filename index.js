const sharp = require('sharp');
const fs = require('fs');



const dir = {
    types: `./layers/trait_types`,
    outputs: `./outputs`,
    background: `./layers/background`,
}

const imageFormat = {
    width: 24,
    height: 24
};

const params = JSON.parse(fs.readFileSync(`params.json`))




const main = () => {    
    const typesArr = fs.readdirSync(dir.types)  
    let types = typesArr.concat()
        .map(traitType => (
            fs.readdirSync(`${dir.types}/${traitType}/`)
                .map(file => {
                    return { type: traitType, file: file }
                })              
        ));
  
    const backs = fs.readdirSync(`${dir.background}`);
    types = (createRandFilesProb(types)); 
    params.files = types;    
    fs.writeFileSync(`params.json`, JSON.stringify(params));
    const max = params.amount
    let combinations = createCombinations(types, max)
    let compositeObjArr = createCompositeObj(combinations)
    console.log(compositeObjArr);
    drawImage(compositeObjArr, backs);
    drawMeta(combinations);
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
        let ord = params.order.find((item)=>item.type == path[0].type)
        if ((ord.req == true) && (!path.some(obj=> obj.probablity == 100))) {
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
            else return {type:'N/A'}
        }));
        
        comb = comb.filter(obj => obj.type != 'N/A')
        comb.sort((prev, next) => {
            let frstInd = params.order.findIndex(currentValue => currentValue.type == prev.type )
            let scndInd = params.order.findIndex(currentValue => currentValue.type == next.type)
            return frstInd - scndInd
        })
        combinations.push(comb)        
    }        
    return combinations
}

const createCompositeObj = (combinations) => {
    let compositeArr = combinations.map(comb => {
        let composite = []
        comb.map(obj=>{                           
            composite.push({ input: `${dir.types}/${obj.type}/${obj.file}`})        
           
        })
        return composite
    })
    return compositeArr
}
async function drawImage(composites, backs){
    let i = 0
    for (const items of composites) {   
        let rand = Math.trunc(Math.random() * (backs.length))       
        await sharp(`${dir.background}/${backs[rand]}`)
            .withMetadata()
            .composite(items)
            .resize(imageFormat.width, imageFormat.height)
            .toFile(`${dir.outputs}/images/${++i}.png`)
            .then(() => {
                console.log(`Progress: ${i}/${composites.length}`);
            }).catch(error => {
                console.log(error);
            })
    
    }
}

async function drawMeta(combinations){
    let i = 1
    for (const item of combinations) {
        fs.appendFile(`${dir.outputs}/meta/${i++}.json`, JSON.stringify(item), err => {
            if(err) console.log(error);
        })
    }
}

main()
