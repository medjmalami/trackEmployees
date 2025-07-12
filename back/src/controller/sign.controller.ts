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
  } catch (error) {
    return c.json(errorHelper.error(400, 'Invalid JSON body'));
  }

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

  // Check credentials
  if (process.env.ADRESS === r.email && process.env.PASS === r.password) {
    // Success logic here

    // Generate JWT token
    const accessToken = jwt.sign({ company: process.env.COMPANY }, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: '1h',
    });
    const refreshToken = jwt.sign({ company: process.env.COMPANY }, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: '7d',
    });

    try {
        await db.insert(tokens).values({
            token: refreshToken,
        });
    }
    catch (error : any) {
      return c.json(errorHelper.error(500, 'Internal Server Error'));
    }

    return c.json({
             accesstoken: accessToken ,
             refreshtoken : refreshToken,
             message: "signed in successfully",
             success: true, 
        });
  } else {
    return c.json(errorHelper.error(401, 'Invalid credentials'));
  }
};

export { signController };