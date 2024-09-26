import { WolooGuestModel } from "../Models/WolooGuest.model";
import Encryption from "../utilities/Encryption";
import CommonService from "./CommonService/Guest";
import { ClientAuth } from "../Models/ClientAuth.model";


const makeObjectForLogin = async (user:any) => {
    const token = await Encryption.generateJwtToken({ id: user.id, role_id: user.role_id });
    for (let u in user) {
        if (
            u == "subscription_id" ||
            u == "fb_id" ||
            u == "gp_id" ||
            u === "sponsor_id" ||
            u == "woloo_id" ||
            u == "gift_subscription_id" ||
            u == "status" ||
            u == "settings" ||
            u == "thirst_reminder_hours" ||
            u == "voucher_id"
        ) {
            let value = user[u];
            if (value || value == 0) {
                user[u] = value.toString();
            }
        }
    }
    user["role_id"] = null;
    if (!user["voucher_id"] && Date.parse(user.expiry_date) > Date.now()) {
        user.isFreeTrial = 1;
    } else {
        user.isFreeTrial = 0;
    }
    return {
        user: user,
        token: token,
        user_id: user.id,
    };
}

const clientAuthService = async (mobile: any, svocid: any, client_id: any, client_secret: any) => {
    const user = (await new WolooGuestModel().getUserByMobile(mobile))[0];
    const client = await new ClientAuth().getClient(client_id, client_secret);
    if (client) {
        if (user) {
            if (!user.svocid) {
                // store svocid
                await new WolooGuestModel().updateWolooGuest({ svocid }, user.id);
                user.svocid = svocid;
            }
            if (user.svocid !== svocid) {
                throw new Error("Invalid SVOCID");
            }
            return await makeObjectForLogin(user);
        } else {
            const newUserId = await CommonService.createGuest(mobile, 0,null,null);
            await new WolooGuestModel().updateWolooGuest({ svocid }, newUserId);
            const newuser = (await new WolooGuestModel().getWolooGuestById(newUserId))[0];
            return await makeObjectForLogin(newuser);
        }
    } else {
        throw new Error("Invalid Client Credentials");
    }
}

export default {
    clientAuthService
}