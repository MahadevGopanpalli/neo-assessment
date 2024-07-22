const cookieSession = require("cookie-session");
const express = require("express");
const cors = require("cors");
const passportSetup = require("./config/passport");
const passport = require("passport");
const authRoute = require("./routes/authRoutes");
const connectDB = require("./config/db")
const morgan = require("morgan");
const userRoutes = require("./routes/userRoutes");
const fs = require("fs");
const multer = require("multer")
const {uploadFileToS3} = require("./config/s3");

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(
  cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: 'http://localhost:4200',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use("/upload",upload.single('file'),async (req,res)=>{
  try
  {
    const profileImageUrl = await uploadFileToS3(req.file);
    fs.unlinkSync(req.file.path); 
    res.send({status : 0,msg : "Successfully uploaded",path : profileImageUrl});
  }
  catch(e)
  {
    console.error(e);
    res.send({status : 1,msg : e, path : ''});  
  }
})

app.use(morgan('dev'));
app.use("/auth",authRoute);
app.use("/users", userRoutes);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});