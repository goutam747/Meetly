let IS_PROD = true;
const server = IS_PROD ?
    "https://meetly-backend-rnum.onrender.com" :

    "http://localhost:8000"


export default server;