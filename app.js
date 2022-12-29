require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const cors = require("cors");
const mailer = require("nodemailer")
const validator = require("express-validator")

const app = express();
const port = 3000;

mongoose.set('strictQuery', true);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))

app.set("view engine", "ejs")
app.set("views", "views")

mongoose.connect("mongodb://127.0.0.1:27017/cartoonify", () => {
    console.log("Connect To Database");

    app.listen(port, () => console.log(`App running on http://localhost:${port}`))
});

const Nft = require("./models/nft")
const Feedback = require("./models/feedback")

const api = express.Router();

api.get("/", async (req, res) => {
    const nfts = await Nft.find();
    res.json({nfts});
})

api.get("/:id", async (req, res) => {
    const nft = await Nft.findById(req.params.id).catch(() => res.json({error: "NFT not found."}).status(404))
    res.json({nft})
})

api.post("/", async (req, res) => {
    const nft = new Nft(req.body)
    await nft.save();
    res.json({nft})
})

api.delete("/:id", async(req, res) => {
    await Nft.findByIdAndDelete(req.params.id).catch(() => res.json({error: "NFT not found."}).status(404))
    res.json({id: req.params.id})
})

api.put("/:id", async (req, res) => {
    await Nft.findByIdAndUpdate(req.params.id, req.body).catch(() => res.json({error: "NFT not found."}).status(404))
    res.json({nft:await Nft.findById(req.params.id)})
})

app.use("/api", api)

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/contact", (req, res) => {
    res.render("contact", {error:false, message:""})
})

app.get("/about", (req, res) => {
    res.render("about")
})

app.get("/nfts", (req, res) => {
    res.render("nfts");
})

app.post("/feedback", 
    validator.body("mobile_no").isNumeric().isLength({max:10, min:10}), 
    validator.body("email_addr").isEmail().normalizeEmail(), 
    validator.body("name").isString(),
    async (req, res) => {

    let errors = validator.validationResult(req)

    if(!errors.isEmpty()){
        if(errors.array().length === 1){
            let msg = ""
            if(errors.array()[0].param === "mobile_no"){
                msg = "Phone number should be of 10 digits"
                res.render("contact", {error: true, message:msg})
            }
            if(errors.array()[0].param === "email_addr"){
                msg = "Please enter a valid Email Address"
                res.render("contact", {error: true, message:msg})
            }
            if(errors.array()[0].param === "name"){
                
                msg = "Name should be alphabetical."
                res.render("contact", {error: true, message:msg})
            }
        }

    } else {
        let transporter = mailer.createTransport({
            host: "imap.gmail.com",
            port: 993,
            secure: true,
            auth: {
                user: "ogamethorns@gmail.com",
                pass: process.env.GMAIL_PASSWORD
            }
        })
    
    
        let body = req.body;
        if (!req.body.checked) {
            body = {...body, checked: "not-checked"}
        }
        let feedback = new Feedback(body)
        await feedback.save();
        
        if (feedback.checked == "checked") {
            let mailOptions = {
                from: 'Omkar ogamethorns@gmail.com',
            to: 'ogamethorns@gmail.com',
            subject: 'Nodemailer is unicode friendly ✔',
            text: 'Hello to myself!',
            html: '<p><b>Hello</b> to myself!</p>'
            }
    
            transporter.sendMail(mailOptions, function(err, info) {
                if(err){
                    console.error(err)
                } else {
                    console.log(info)
                    console.log('Message sent: %s', info.messageId);
                    console.log('Preview URL: %s', mailer.getTestMessageUrl(info));
                }
            })
        }
        
        res.redirect("/contact")
    }
    

})