import express from 'express';
import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/ApiResponse';
import Encryption from '../utilities/Encryption';
import { extractCookieFromRequest } from '../utilities/ApiUtilities';
import application from '../Constants/application'

/**
 * Route authentication middleware to verify a token
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 *
 */

export default async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  //@ts-ignore
  if (application.authorizationIgnorePath.indexOf(`${req._parsedUrl.pathname}`) === -1) {
    const authorizationHeader = extractCookieFromRequest(
      req, 'x-woloo-token'
    );
    const apiKey: string | string[] | undefined | null = extractCookieFromRequest(req, 'x-api-key');
    if (authorizationHeader) {
      const decoded = await new Encryption().verifyJwtToken(authorizationHeader);
      // @ts-ignore
      console.log('decoded', decoded)

      if (decoded && req.headers["tenant-id"] == decoded.tenant_id) {
        // @ts-ignore
        req.session = decoded;
        console.log('TOKEN ---> Verified Successfully');
      } else {
        apiResponse.error(res, httpStatusCodes.UNAUTHORIZED);
        return;
      }
    } else if (apiKey) {
      if (apiKey === 'eHDgroph0FZW7zMAkByPXrZykkE69SlH' && req.originalUrl == "/api/wolooHost/devicePayload") {
      }
      else if (apiKey === 'k45GQj8FtKt0NR074UfFyvCEPAfJBzxY' && req.originalUrl == "/api/wolooGuest/createClient") {
      }
      else {
        apiResponse.error(res, httpStatusCodes.FORBIDDEN);
        return;
      }
    } else {
      apiResponse.error(res, httpStatusCodes.FORBIDDEN);
      return;
    }
  }
  next();
};
