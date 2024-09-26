var Settlement: any = [];
Settlement.deg2rad = function (deg: any) {
  return (deg * Math.PI) / 180.0;
};

Settlement.rad2deg = function (angle: any) {
  // (angle / Math.PI * 180)
  return angle * 57.29577951308232;
};

Settlement.default_key = function (obj: any) {
  var result = 0;
  Object.entries(obj).map((item) => {
    const num = Number(item[0]);
    if (Number.isInteger(num) && num >= result) {
      // Get new key
      result = num + 1;
    }
  });
  obj[result] = {};
  return result;
};

const calculateDistanceMatrix = (
  latitudeUser: any,
  longtitudeUser: any,
  woloos: any
) => {
  const filteredWoloo = [];
  for (var key in woloos) {
    let woloo = woloos[key];
    let latitudeWoolo = woloo.lat;
    let longtitudeWoolo = woloo.lng;
    let theta = longtitudeUser - longtitudeWoolo;
    let distance =
      Math.sin(Settlement.deg2rad(latitudeUser)) *
      Math.sin(Settlement.deg2rad(latitudeWoolo)) +
      Math.cos(Settlement.deg2rad(latitudeUser)) *
      Math.cos(Settlement.deg2rad(latitudeWoolo)) *
      Math.cos(Settlement.deg2rad(theta));
    distance = Math.acos(distance);
    distance = Settlement.rad2deg(distance);
    distance = distance * 60 * 1.1515;
    distance = distance * 1.609344;
    if (distance <= 6) {
      filteredWoloo.push(woloo);
    }
  }

  return filteredWoloo;
};

const mapConfigData = (response: any) => {

  const data: any = {};
  for (let key in response) {
    const item = response[key];
    if (!data[item["keyword"]]) {
      data[item["keyword"]] = {};
    }
    data[item["keyword"]][item["display_data"]] = item["value_data"];
  }

  console.log("data..........>", data)
  return data;
};

const mapKeys = (arr: { [x: string]: any }) => {
  let obj: any = {};
  for (let k in arr) {
    let key = arr[k];
    obj[key] = key;
  }
  return obj;
};

Settlement.str_repeat = function (input: string, multiplier: number) {
  let y = "";
  while (true) {
    if (multiplier & 1) {
      y += input;
    }
    multiplier >>= 1;
    if (multiplier) {
      input += input;
    } else {
      break;
    }
  }
  return y;
};
Settlement.str_shuffle = function (str: string | null) {
  if (arguments.length === 0) {
    throw new Error("Wrong parameter count for str_shuffle()");
  }
  if (str === null) {
    return "";
  }
  str += "";
  let newStr = "";
  let rand;
  let i = str.length;
  while (i > 0) {
    rand = Math.floor(Math.random() * i);
    newStr += str.charAt(rand);
    str = str.substring(0, rand) + str.substring(rand + 1);
    i--;
  }
  return newStr;
};

const voucherGenerator = (length: number) => {
  let code = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let voucher_code = Settlement.str_shuffle(
    Settlement.str_repeat(code, length)
  ).substring(0, length);
  return voucher_code;
};

const genRefCode = () => {
  const char = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let refCode = Settlement.str_shuffle(
    Settlement.str_repeat(char, 10)
  ).substring(0, 10);
  return refCode;
};

const convertToDaysAndMonths = (time: any) => {
  if (time == "0") {
    const result: any = {
      period: "yearly",
      interval: 0,
      days: 365,
      frequency: "0",
    };
    return result;
  }
  //console.log(time);
  const subTime = time.trim().split(" ");

  const filterTime = subTime[1].toLowerCase();
  const period =
    filterTime == "month" || filterTime == "months"
      ? "monthly"
      : filterTime == "year"
        ? "yearly"
        : filterTime || "week"
          ? "weekly"
          : null;
  let frequency = period == "yearly" ? "Annual" : period;
  if (!period) throw new Error("Invalid time argument");
  Error("Invalid time argument");
  const days =
    (period == "weekly"
      ? 7
      : period == "monthly"
        ? 30
        : period == "yearly"
          ? 365
          : 1) * subTime[0];
  // console.log(period, subTime);
  const result: any = {
    period: period,
    interval: Number(subTime[0]),
    days: days,
    frequency: frequency,
  };
  return result;
};

const calculateExpiryDate = (currentDate: any, days: any, future: any) => {
  const baseDate = future.future === 1 ? new Date(currentDate) : new Date();
  return new Date(baseDate.setDate(baseDate.getDate() + days.days));
}

export default {
  calculateDistanceMatrix,
  mapConfigData,
  mapKeys,
  voucherGenerator,
  genRefCode,
  convertToDaysAndMonths,
  calculateExpiryDate
};
