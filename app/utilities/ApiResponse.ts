import { Response } from 'express';
import httpStatusCodes from 'http-status-codes';
export interface IOverrideRequest {
    code: number;
    message: string;
    positive: string;
    negative: string;
}

export interface ICookie {
    key: string;
    value: string;
}
export default class ApiResponse {
    static result = (
        res: Response,
        results: object,
        message?: any,
        status: number = 200,
        //cookie: ICookie = null,
    ) => {
        res.status(status);
        /* if (cookie) {
             res.cookie(cookie.key, cookie.value);
         }*/
        res.json({
            success: true,
            ...message,
            results
        });
    };

    static error = (
        res: Response,
        status: number = 400,
        error: string = httpStatusCodes.getStatusText(status),
        //override: IOverrideRequest = null,
    ) => {
        res.status(status).json({
            //override,
            error: {
                message: error,
            },
            success: false,
        });
    };

    static setCookie = (res: Response, key: string, value: string) => {
        res.cookie(key, value);
    };
}
export class ApiResponseWithMessage {
    static result = (
        res: Response,
        results: object,
        status: number = 200,
        message: string
        //cookie: ICookie = null,
    ) => {
        res.status(status);
        /* if (cookie) {
             res.cookie(cookie.key, cookie.value);
         }*/
        res.json({
            success: true,
            message,
            results
        });
    };

    static error = (
        res: Response,
        status: number = 400,
        error: string = httpStatusCodes.getStatusText(status),
        //override: IOverrideRequest = null,
    ) => {
        res.status(status).json({
            //override,
            error: {
                message: error,
            },
            success: false,
        });
    };

    static setCookie = (res: Response, key: string, value: string) => {
        res.cookie(key, value);
    };
}

export class ApiResponseWithoutResult {
    static result = (
        res: Response,
        status: number = 200,
        message: string,
        //cookie: ICookie = null,
        custom?: any
    ) => {
        res.status(status);
        /* if (cookie) {
             res.cookie(cookie.key, cookie.value);
         }*/
        res.json({
            success: true,
            message

        });
    };

    static error = (
        res: Response,
        status: number = 400,
        error: string = httpStatusCodes.getStatusText(status),
        //override: IOverrideRequest = null,
    ) => {
        res.status(status).json({
            //override,
            error: {
                message: error,
            },
            success: false,
        });
    };

    static setCookie = (res: Response, key: string, value: string) => {
        res.cookie(key, value);
    };
}