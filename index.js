const express = require("express");
const app = express();
const scrapPort = require("./helpers/scrap-ports");
const scrapShipsInPort = require("./helpers/scrap-ships-in-port");
const scrapExpectedArrivalsInPort = require("./helpers/scrap-expected-arrivals-in-port");
app.set('view engine', 'ejs');

app.get('/',async (req,res)=>{
    try {
        const ports = await scrapPort();



        
        res.render('ports',{ports});
    } catch (error) {
        res.send('data scrapping error',error)
    }
});

app.get('/in-port/:portId/:vesselsCount',async (req,res)=>{
    try {
        const {portId,vesselsCount} = (req.params);
        const vessels = await scrapShipsInPort(portId,vesselsCount);
        res.render('vessels-in-ports.ejs',{vessels});
    } catch (error) {
        res.send('data scrapping error',error)
    }
});  

app.get("/arrivals/:portId/:vesselsCount",async (req,res)=>{
    try {
        const {portId,vesselsCount} = (req.params);
        const vessels = await scrapExpectedArrivalsInPort(portId);
        res.render('arrivals-in-ports.ejs',{vessels});
    } catch (error) {
        res.send('data scrapping error',error)
    }
});

app.get('/download/:item',(req,res)=>{
    const  {item}  = (req.params);
    let file ='';
    if(item == 'ports'){
        file = `${__dirname}/generated/ports.xlsx`;
    }else if(item === "expected"){
        file = `${__dirname}/generated/excepted-arrivals-in-ports.xlsx`;
    }else if(item === "in-port"){
        file = `${__dirname}/generated/vessels-in-ports.xlsx`;
    }else{
        res.render('error');
    }
    res.download(file);
})




app.all("*",(req,res)=>{
    res.render('error');
})

app.listen(3300,()=>console.log('application up and running'));