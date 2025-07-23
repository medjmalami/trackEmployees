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
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(errorHelper.error(400, 'Authorization header missing or malformed'));
    }

    const oldToken = authHeader.split(' ')[1];

    const validation = refreshReqSchema.safeParse({ token: oldToken });
    if (!validation.success) {
      return c.json(errorHelper.error(400, 'Token validation failed'));
    }

    // Verify the refresh token
    const decoded = jwt.verify(oldToken, process.env.REFRESH_TOKEN_SECRET!) as jwt.JwtPayload;

    const [tableToken] = await db
      .select()
      .from(tokens)
      .where(eq(tokens.token, oldToken));

    if (!tableToken) {
      return c.json(errorHelper.error(401, 'Invalid refresh token'));
    }

    // check user info from decoded payload
    const payload = {
      isAdmin: decoded.isAdmin,
    };

    const newAccessToken = jwt.sign({ 
      isAdmin: payload.isAdmin,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour in seconds
    }, process.env.REFRESH_TOKEN_SECRET!);

    const newRefreshToken = jwt.sign({ 
      isAdmin: payload.isAdmin,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days in seconds
    }, process.env.REFRESH_TOKEN_SECRET!);

    // Replace old refresh token in DB
    await db
      .update(tokens)
      .set({ token: newRefreshToken })
      .where(eq(tokens.token, oldToken));

    return c.json({
      accesstoken: newAccessToken,
      refreshtoken: newRefreshToken,
      message: "Refreshed successfully",
      success: true,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return c.json(errorHelper.error(500, 'Internal Server Error'));
  }
};

export { refreshController };
