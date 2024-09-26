import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "http-status-codes";
import ApiResponse from "./ApiResponse";

const extractQueryForRequest = (req: Request, query: string) => {
  if (req.query[query]) {
    // @ts-ignore
    return JSON.parse(req.query[query]);
  }
  return [];
};

const extractCookieFromRequest = (req: Request, key: string) => {
  /*if (req.headers.authorization) {
    return req.headers.authorization;
  }
  if (req.headers.cookie) {
    const results = req.headers.cookie.split(';');
    const filtered = results.filter((result: string) => {
      return result.startsWith(`${key}=`);
    });
    if (filtered.length > 0) {
      return filtered[0].split('=')[1];
    }
  }*/
  if (req.headers[key]) {
    return req.headers[key];
  }
  return null;
};

const getClientAddress = function (req: Request) {
  return req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
};

const subscriptionTime = function (days: any) {
  let date = new Date();

  function daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
  }

  function monthy_days_cal(nextMonths: number) {
    var today = new Date();
    var month = today.getMonth();
    var count = 0;
    for (var i = 0; i < nextMonths; i++) {
      count += daysInMonth(month + i + 1, today.getFullYear());
    }
    return count;
  }

  let one_month = monthy_days_cal(1);
  let two_month = monthy_days_cal(2);
  let three_month = monthy_days_cal(3);
  let six_month = monthy_days_cal(6);
  let one_year = monthy_days_cal(12);

  switch (days) {
    case "1 week":
      return {
        period: "weekly",
        interval: 1,
        days: 7,
      };

    case "1 month":
      return {
        period: "monthly",
        interval: 1,
        days: one_month,
      };

    case "2 months":
      return {
        period: "monthly",
        interval: 2,
        days: two_month,
      };

    case "3 months":
      return {
        period: "monthly",
        interval: 3,
        days: three_month,
      };

    case "6 months":
      return {
        period: "monthly",
        interval: 6,
        days: six_month,
      };

    case "1 year":
      return {
        period: "yearly",
        interval: 1,
        days: one_year,
      };

    default:
      return {
        days:0
      };
      break;
  }
};

export {
  extractQueryForRequest,
  subscriptionTime,
  extractCookieFromRequest,
  getClientAddress,
};
