import {reject} from "async";
const jwt = require('jsonwebtoken');
const config = require("../config");

export default class Encryption {
    constructor() {

    }

    public static async generateJwtToken(data: any) {
        console.log("before token", data)
        //return await jwt.sign(data, config.JwtToken.secretKey, {expiresIn: config.JwtToken.expiry,notBefore : 10, issuer : "https://woloo.verifinow.com/api/v1/login", jwtid : "zbAHubrIlhqXtsZG", subject:"645"});
        return await jwt.sign(data,config.JwtToken.secretKey, {expiresIn: config.JwtToken.expiry,
            notBefore : 0, issuer : "https://woloo.verifinow.com/api/v1/login",
            jwtid : "ABCDEFGHIJK", subject:(data.id).toString(),algorithm:"HS256"});
    }

    public async verifyJwtToken(token: string | string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(
                token,
                config.JwtToken.secretKey,
                (err: Error, decoded: any) => {
                    if (err) {
                        resolve(null);
                    } else {
                        resolve(decoded);
                    }
                },
            );
        });
    }
}
