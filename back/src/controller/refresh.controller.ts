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
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json(errorHelper.error(400, "Authorization header missing or malformed"), 400);
    }

    const oldToken = authHeader.split(" ")[1];

    const validation = refreshReqSchema.safeParse({ token: oldToken });
    if (!validation.success) {
      return c.json(errorHelper.error(400, "Token validation failed"), 400);
    }

    // ✅ Handle token expiration properly
    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(oldToken, process.env.REFRESH_TOKEN_SECRET!) as jwt.JwtPayload;
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return c.json(errorHelper.error(401, "Refresh token expired"), 401);
      }
      return c.json(errorHelper.error(401, "Invalid refresh token"), 401);
    }

    const [tableToken] = await db
      .select()
      .from(tokens)
      .where(eq(tokens.token, oldToken));

    if (!tableToken) {
      return c.json(errorHelper.error(401, "Refresh token not found"), 401);
    }

    const payload = {
      isAdmin: decoded.isAdmin,
    };

    const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "1h",
    });

    const newRefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: "7d",
    });

    await db
      .update(tokens)
      .set({ token: newRefreshToken })
      .where(eq(tokens.token, oldToken));

    return c.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      message: "Refreshed successfully",
      success: true,
    });
  } catch (error) {
    return c.json(errorHelper.error(500, "Internal Server Error"), 500); // ✅ Include correct status
  }
};

export { refreshController };
