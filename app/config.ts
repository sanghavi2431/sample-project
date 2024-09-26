import * as dotenv from "dotenv";
dotenv.config();

const env = process.env;
export = {
    DB: {
        host: env.MASTER_DB_HOST || '',
        user: env.MASTER_DB_USER || '',
        password: env.MASTER_DB_PASSWORD || '',
        database: env.MASTER_DB_NAME || '',
        port: env.MASTER_DB_PORT
    },

    JwtToken: {
        secretKey: process.env.JWT_TOKEN_SECRET_KEY || 'aLNYaVAtxBCUBSsDIimwBStCTt4E1teRlTbceVp7FY0f6HPFtp91nWVZvmdmtwGC',
        expiry: process.env.JWT_TOKEN_EXPIRY || '90d'
    },
    MapBox: {
        url: process.env.MAPBOX_URL || 'https://api.mapbox.com/directions/v5/mapbox/',
        key: process.env.MAPBOX_KEY || 'pk.eyJ1IjoiZnNtYXBib3hhY2NvdW50IiwiYSI6ImNrYjdoNXA1ZTA1dGEyeHJscHkxaXIybWcifQ.YOAp3jBWBb7RznAdKxqZgQ',
    },
    GoogleMap: {
        key: process.env.GOOGLE_MAP_KEY,
        distanceMatrixUrl: process.env.GOOGLE_MAP_DISTANCEMATRIX_URL || 'https://maps.google.com/maps/api/distancematrix/json'
    },
    SMS: {
        url: process.env.SMSMENOW_URL || "http://sms.smsmenow.in/sendsms.jsp",
        user: process.env.SMSMENOW_USER || "LOOMWV",
        password: process.env.SMSMENOW_PASSWORD || "c999349cb3XX",
        senderId: process.env.SMSMENOW_SENDER_ID || "loomwv",
        // tempid: "1707161739236905963"
        tempid:"1707170065991135935"
    },
    firebaseLink: {
        url: `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.FIREBASE_API_KEY}`,
        apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDyJDAP9AhZDNDvFxB82N816xjWG9Lmji0",
        domainUriPrefix: "https://woloo.page.link",
        androidPackageName: "in.woloo.www",
        iosBundleId: "in.woloo.app"
    },
    razorpay: {
        key: process.env.razorpay_key || 'rzp_test_ZIlhyKgx2C38vT',
        secret: process.env.razorpay_secret || 'QPKVhc0PP3bW5eqjzwb8BuwR'
    },
    email: {
        hostname: process.env.EMAIL_HOST || "",
        email_user: process.env.EMAIL_USER || "",
        email_pass: process.env.EMAIL_PASS || "",
        email: process.env.EMAIL || "",
    },
    baseUrl: "http://qa1.digitalflake.com",
    s3imagebaseurl: process.env.IMAGE_BASE_URL || "https://woloo-prod.s3.ap-south-1.amazonaws.com/",
    wolooimagebaseurl: process.env.OLD_IMAGE_BASE_URL || "https://admin.woloo.in/storage/app/public/",
    wolooBaseUrl: process.env.WOLOO_BASE_URL || "https://admin.woloo.in/public/",
    listPerPage: env.LIST_PER_PAGE || 10,
    cibilScoreImageBaseUrl: "https://woloo-dev-bucket.s3.ap-south-1.amazonaws.com",
    S3: {
        bucketName: process.env.AWS_BUCKET_NAME || "",
        bucketRegion: process.env.AWS_BUCKET_REGION || "",
        key: process.env.AWS_ACCESS_KEY || "",
        secretKey: process.env.AWS_SECRET_KEY || ""
    },
    REDIS:{
        PORT:process.env.REDIS_PORT || 6379,
        HOST:process.env.REDIS_HOST || "localhost",
    },
}