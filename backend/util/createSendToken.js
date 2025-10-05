import { signToken } from "./signToken.js";

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const days = parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10);
  const cookieOptions = {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "Strict",
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  return res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export default createSendToken;
