import getPrismaInstance from "../utils/PrismaClient.js";
import { generateToken04 } from "./../utils/TokenGenerator.js";

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

export const onboardUser = async (req, res, next) => {
  console.log(req.body);
  try {
    const { name, email, about, image: profilePhoto } = req.body;
    if (!email || !name || !about || !profilePhoto) {
      return res.send("Name,Email,About and Profile Photo must be provided");
    }
    const prisma = getPrismaInstance();
    const result = await prisma.user.create({
      data: { name, email, about, profilePhoto },
    });
    return res.json({
      message: "User created successfully",
      status: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
    });
    const usersGroupByInitialLetter = {};

    users?.forEach((user) => {
      const initialLetter = user?.name?.charAt(0).toUpperCase();
      if (!usersGroupByInitialLetter[initialLetter]) {
        usersGroupByInitialLetter[initialLetter] = [];
      }
      usersGroupByInitialLetter[initialLetter].push(user);
    });
    return res.status(200).json({ users: usersGroupByInitialLetter });
  } catch (error) {
    next(error);
  }
};

export const generateGegoCloudToken = (req, res, next) => {
  try {
    const userId = req.params.userId;
    const effectiveTime = 3600;
    const payload = "";
    if (appId && serverSecret && userId) {
      const token = generateToken04(
        appId,
        userId,
        serverSecret,
        effectiveTime,
        payload
      );
      return res.status(200).json({ token });
    }
    return res.status(400).send("AppId,userId and serverSecret is required");
  } catch (error) {
    next(error);
  }
};
