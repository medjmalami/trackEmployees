import { errorHelper } from "../utils/errorHelper";
import { db } from "../db/index";
import type { Context } from "hono";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { tokens } from "../db/schema";
import { config } from "dotenv";
import { refreshReqSchema } from "../utils/refreshtypes";
config();

const refreshController = async (c: Context) => {
  // Parse the request body using Hono's context
  let body;
  try {
    body = await c.req.json();


  if (!body || !body.token) {
    return c.json(errorHelper.error(400, 'Bad Request'));
  }

  const oldToken = body.token.split(' ')[1];
  if (!oldToken) {
    return c.json(errorHelper.error(400, 'Bad Request'));
  }

  const validation = refreshReqSchema.safeParse({token: oldToken});

  if (!validation.success) {
    return c.json(errorHelper.error(400, 'Validation failed'));
  }

  // Verify the refresh token's validity (signature and expiration)
  let decoded;

    decoded = jwt.verify(oldToken, process.env.REFRESH_TOKEN_SECRET!) as jwt.JwtPayload;

    const [tableToken] = await db.select().from(tokens).where(eq(tokens.token, oldToken));
    
    if (!tableToken) {
      return c.json(errorHelper.error(401, 'Invalid token'));
    }
    const user = c.get('user');
    if (!user) {
      return c.json(errorHelper.error(401, 'Invalid token'));
    }

    // Include user information from the decoded token
    const payload = {
      isAdmin: user.isAdmin,
    };

    const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: '1h',
    });

    const newRefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: '7d',
    });

    // Update the token in the database
    await db.update(tokens).set({
      token: newRefreshToken,
    }).where(eq(tokens.token, oldToken));

    return c.json({
      accesstoken: newAccessToken,
      refreshtoken: newRefreshToken,
      message: "refreshed successfully",
      success: true,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return c.json(errorHelper.error(500, 'Internal Server Error'));
  }
};

export { refreshController };