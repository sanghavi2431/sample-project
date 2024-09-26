export default {
  voucher: {
    FREE: "free",
    PAID: "paid",
    CALLBACK_URL: "/api/voucher/webhook",
    CALLBACK_METHOD: "get",
    FUTURE_SUB_MSG: `You already have an active Voucher/ Membership. If you want to use Scanned Voucher the Current Will be Cancelled
        *Remaining number of days from the current membership will be void`,
    FUTURE_EXPIRED_VOUCHER: `You already have an active Future Membership. You can use the voucher only after the future membership is active.`,
    VOUCHER_CONSUMED: "Voucher already consumed",
    FUTURE_SUB_EXIST: "You have future subscription",
    ONLINE: "online",
    UPLOAD_PATH: "Images/Vouchers/",
    SUBSCRIPTION: "Subscription",
    VOUCHER: "Voucher",
  },
  cibil_score_colour: {
    POOR: "#FF3600",
    FAIR: "#FF8200",
    GOOD: "#FFCF00",
    GREAT: "#ADD800",
    EXCELLENT: "#00863F",
  },

  cibil_score: {
    "1": "300-619",
    "2": "620-659",
    "3": "700-719",
    "4": "720-749",
    "5": "750-850",
  },

  report: {
    UPLOAD_PATH: "Images/Report/",
  },

  smsTemplate: {
    SUBMIT_REVIEW: "1707161529701035599",
    ADD_WOLOO: "1707161529695445805",
    
  },
  rbac:{
    role_id:{
      host_id:9,
      client:13,
      admin:1,
      corporate_admin:8,
      content_writer:11,
      facility_manager:3
    }
  },
};
