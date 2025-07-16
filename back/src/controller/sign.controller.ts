import { signinReqSchema, type SigninReq } from "../utils/signTypes";
import { errorHelper } from "../utils/errorHelper";
import  jwt from 'jsonwebtoken';
import { db } from "../db/index";
import type { Context } from "hono";
import { tokens } from "../db/schema";


const signController = async (c: Context) => {
  // Parse the request body using Hono's context
  let body;
  try {
    body = await c.req.json();
  

    if (!body) {
      return c.json(errorHelper.error(400, 'Bad Request'));
    }

    const r: SigninReq = {
      email: body.email,
      password: body.password,
    };

    const validation = signinReqSchema.safeParse(r);

    if (!validation.success) {
      return c.json(errorHelper.error(400, 'Validation failed'));
    }

    let accessToken;
    let refreshToken;
    let isAdmin = false;

    // Check credentials
    if (process.env.ADMIN_ADRESS === r.email && process.env.ADMIN_PASS === r.password) {

      // Generate JWT token
      accessToken = jwt.sign({ isAdmin: true }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '1h',
      });
      refreshToken = jwt.sign({ isAdmin: true }, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: '7d',
      });

      isAdmin = true;

      


    }else if (process.env.CHEF_ADRESS === r.email && process.env.CHEF_PASS === r.password) {

      // Generate JWT token
      accessToken = jwt.sign({ isAdmin: false }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '1h',
      });
      refreshToken = jwt.sign({ isAdmin: false }, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: '7d',
      });



    }else {
      return c.json(errorHelper.error(401, 'Invalid credentials'));
    }
    
    return c.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
      message: 'Signed in successfully',
      success: true,
      isAdmin

    });
  }
    catch (error : any) {
      return c.json(errorHelper.error(500, 'Internal Server Error'));
    }

};

    


export { signController };