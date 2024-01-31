import { FileUploadHelper } from "../utils/FileUploaderHelper.js";
import getPrismaInstance from "../utils/PrismaClient.js";

export const addMessage = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { message, from, to } = req.body;
    const getUser = onlineUsers.get(to);
    if (message && from && to) {
      const newMessage = await prisma.message.create({
        data: {
          message,
          sender: { connect: { id: from } },
          receiver: { connect: { id: to } },
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

export const getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.params;

    if (!from || !to) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const prisma = getPrismaInstance();
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: from,
            receiverId: to,
          },
          {
            senderId: to,
            receiverId: from,
          },
        ],
      },
      orderBy: {
        id: "asc",
      },
    });
    const unreadMessages = [];
    messages.forEach((message, index) => {
      if (message?.messageStatus !== "read" && message?.senderId === to) {
        messages[index].messageStatus = "read";
        unreadMessages.push(message?.id);
      }
    });
    await prisma.message.updateMany({
      where: {
        id: {
          in: unreadMessages,
        },
      },
      data: {
        messageStatus: "read",
      },
    });
    return res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

export const addImageMessage = async (req, res, next) => {
  try {
    const { secure_url } = await FileUploadHelper.uploadToCloudinary(req?.file);
    if (secure_url) {
      const prisma = getPrismaInstance();
      const { from, to } = req.query;
      if (from && to) {
        const message = await prisma.message.create({
          data: {
            message: secure_url,
            sender: { connect: { id: from } },
            receiver: { connect: { id: to } },
            type: "image",
          },
        });
        return res.status(200).json({ message });
      }
      return res.status(400).send("from and to must be provided");
    }
    return res.status(400).send("image must be provided");
  } catch (error) {
    next(error);
  }
};

export const getInitialContactsWithMessages = async (req, res, next) => {
  try {
    const userId = req.params.from;

    const prisma = getPrismaInstance();
    const isExistUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sentMessages: {
          include: {
            sender: true,
            receiver: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        receivedMessages: {
          include: {
            sender: true,
            receiver: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const messages = [
      ...isExistUser?.sentMessages,
      ...isExistUser.receivedMessages,
    ];

    messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const users = new Map();

    const messageStatusChange = [];

    messages.forEach((msg) => {
      const isSender = msg?.senderId === userId;

      const calculatedId = isSender ? msg?.receiverId : msg?.senderId;
      if (msg?.messageStatus === "sent") {
        messageStatusChange.push(msg?.id);
      }
      if (!users.get(calculatedId)) {
        const {
          id,
          type,
          message,
          messageStatus,
          createdAt,
          senderId,
          receiverId,
        } = msg;
        let user = {
          messageId: id,
          type,
          message,
          messageStatus,
          createdAt,
          senderId,
          receiverId,
        };

        if (isSender) {
          user = {
            ...user,
            ...msg?.receiver,
            totalUnreadMessage: 0,
          };
        } else {
          user = {
            ...user,
            ...msg?.sender,
            totalUnreadMessage: messageStatus !== "read" ? 1 : 0,
          };
        }

        users.set(calculatedId, { ...user });
      } else if (msg?.messageStatus !== "read" && !isSender) {
        const user = users.get(calculatedId);
        users.set(calculatedId, {
          ...user,
          totalUnreadMessage: user.totalUnreadMessage + 1,
        });
      }
    });

    if (messageStatusChange.length) {
      await prisma.message.updateMany({
        where: {
          id: {
            in: messageStatusChange,
          },
        },
        data: {
          messageStatus: "delivered",
        },
      });
    }

    return res.status(200).json({
      users: Array.from(users.values()),
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  } catch (error) {
    next(error);
  }
};
