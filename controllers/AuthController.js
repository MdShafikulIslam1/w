import getPrismaInstance from "../utils/PrismaClient.js";

export const checkUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const prisma = getPrismaInstance();
    if (!email) {
      return res.json({ message: "User Email is required", status: false });
    }
    const isUserExist = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!isUserExist) {
      return res.json({ message: "User does not exist", status: false });
    } else {
      return res.json({
        message: "User already exists",
        status: true,
        data: isUserExist,
      });
    }
  } catch (error) {
    next(error);
  }
};
