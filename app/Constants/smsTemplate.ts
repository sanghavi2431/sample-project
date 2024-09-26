export default {
    otpTemplate : function(otp:any){
        //const template = `Dear User,\nYour One Time Password for login is ${otp}. Put this OTP and press submit.\nPlease do not share the OTP with anyone.\nIn case you have not initiated this request please contact our helpdesk athelpdesk@woloo.in\nBest Regards,\nWolooTeam XXXX`;
        const template = `Dear User,\nYour OTP for login is ${otp}. Please do not share the OTP with anyone. For any issue contact our helpdesk at info@woloo.in\nwww.woloo.in`
        return template;
    }
}