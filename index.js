const express = require("express");
const app = express();
const scrapPort = require("./helpers/scrap-ports");
const scrapShipsInPort = require("./helpers/scrap-ships-in-port");
const scrapExpectedArrivalsInPort = require("./helpers/scrap-expected-arrivals-in-port");
const session = require("express-session");
const md5 = require("md5");

const port = 3300;
const db = {
  user: [
    {
      email: "testuser@gmail.com",
      password: "d8578edf8458ce06fbc5bb76a58c5ca4",
    },
  ],
};


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    cookie: { maxAge: 60000 },
    saveUninitialized:false,
    resave:false
  })
);

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  //check the user logged in or not
  if (req.session.userLoggedIn) {
    try {
      const ports = await scrapPort();

      res.render("ports", { ports });
    } catch (error) {
      res.send("data scrapping error", error);
    }
  } else {
    res.render("login");
  }
});

app.get("/in-port/:portId/:vesselsCount", async (req, res) => {
  try {
    const { portId, vesselsCount } = req.params;
    const vessels = await scrapShipsInPort(portId, vesselsCount);
    res.render("vessels-in-ports.ejs", { vessels });
  } catch (error) {
    res.send("data scrapping error", error);
  }
});

app.delete("/logout",(req,res)=>{
    req.session.destroy();
    res.json({message:'user logged out successfully'});
})

app.get("/arrivals/:portId/:vesselsCount", async (req, res) => {
  try {
    const { portId, vesselsCount } = req.params;
    const vessels = await scrapExpectedArrivalsInPort(portId);
    res.render("arrivals-in-ports.ejs", { vessels });
  } catch (error) {
    res.send("data scrapping error", error);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post('/login-user',(req,res)=>{
   const {email, password} = req.body;
   
   const user =  (db.user).filter(user =>{
      if(user.email === email && user.password === md5(password)) return user;
   });

   if(user.length > 0){
     req.session.userLoggedIn = true;
    return  res.json({message:"login success"});
   }{


      return res.status(404).json({message:"in valid credentials provided"});
   }
});

app.get("/download/:item", (req, res) => {
  const { item } = req.params;
  let file = "";
  if (item == "ports") {
    file = `${__dirname}/generated/ports.xlsx`;
  } else if (item === "expected") {
    file = `${__dirname}/generated/excepted-arrivals-in-ports.xlsx`;
  } else if (item === "in-port") {
    file = `${__dirname}/generated/vessels-in-ports.xlsx`;
  } else {
    res.render("error");
  }
  res.download(file);
});

app.all("*", (req, res) => {
  res.render("error");
});

app.listen(port, () => console.log("application up and running on " + port));
