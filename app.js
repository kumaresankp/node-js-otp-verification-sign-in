const express = require('express');
const nodemailer = require('nodemailer');
const session = require('express-session');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true
}));

PORT = process.env.PORT || 3001

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});

app.post('/send-otp', (req, res) => {
    const { name, email } = req.body;

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store the OTP in the session
    req.session.otp = otp;

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_ADDRESS,
            pass: process.env.GMAIL_PASSWORD
        }
    });

    // Define the email message
    const mailOptions = {
        from: process.env.GMAIL_ADDRESS,
        to: email,
        subject: 'OTP Verification',
        text: `Hello ${name}, your OTP is: ${otp}`
    };

    // Send the OTP email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Failed to send OTP.');
        } else {
            console.log('Email sent: ' + info.response);
            res.redirect(`/verify?otp=${otp}`);
        }
    });
});
app.get('/verify', (req, res) => {
    const { otp } = req.body;
    res.sendFile(__dirname + '/public/verify.html', { otp });
});
app.post('/verify-otp', (req, res) => {
    const { otp } = req.query;
    const storedOTP = req.session.otp;

    // Compare the entered OTP with the stored OTP
    if (otp === storedOTP) {
        // OTP verification successful
        delete req.session.otp; // Remove the stored OTP from the session
        res.redirect('/login');
    } else {
        res.send('Invalid OTP. Please try again.');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})