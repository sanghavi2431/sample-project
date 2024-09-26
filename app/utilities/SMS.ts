import HttpClient from './HttpClient';
import config = require("../config");
import smsTemplate = require('../Constants/smsTemplate');

export default class SMS {
    constructor() {

    }

    public static async send(mobile: number, otp: number, message: string, tempId: string): Promise<any> {
        let url: string = `${config.SMS.url}`;
        // console.log("Template", smsTemplate.default.otpTemplate(otp));
        return new Promise((resolve, reject) => {
            HttpClient.api('get', url, {
                params:
                    { user: config.SMS.user, password: config.SMS.password, senderid: config.SMS.senderId, mobiles: mobile, tempid: config.SMS.tempid, sms: smsTemplate.default.otpTemplate(otp), responsein: 'json' }
            })
                .then(function (response: any) {
                    resolve(response);
                })
                .catch(function (error: Error) {
                    console.log(error)
                    reject(error);
                })
        });
    }

    public static async sendRaw(mobile: number, message: string, tempId: string): Promise<any> {

        let url: string = `${config.SMS.url}`;

        return new Promise((resolve, reject) => {
            HttpClient.api('get', url, {
                params:
                    { user: config.SMS.user, password: config.SMS.password, senderid: config.SMS.senderId, mobiles: mobile, tempid: tempId, sms: message, responsein: 'json' }
            })
                .then(function (response: any) {
                    console.log(response);
                    resolve(response);
                })
                .catch(function (error: Error) {
                    console.log(error);
                    reject(error);
                })
        });
    }
}