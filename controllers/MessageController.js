import getPrismaInstance from "../utils/PrismaClient.js";

export const addMessage = async (req, res, next) => {
  console.log(req.body)
  try {
    const prisma = getPrismaInstance();
    const { message, from, to } = req.body;
    const getUser = onlineUsers.get(to);
    if (message && from && to) {
      console.log(req.body,"valid")
      const newMessage = await prisma.message.create({
        data: {
          message,
          sender: { connect: { id: parseInt(from) } },
          receiver: { connect: { id: parseInt(to) } },
          messageStatus: getUser ? "delivered" : "sent",
        },
        include: {
          sender: true,
          receiver: true,
        },
      });
      return res.status(201).send({ message: newMessage });
    }
    return res
      .status(400)
      .send({ message: "Message, from and to must be provided" });
  } catch (error) {
    next(error);
  }
};
