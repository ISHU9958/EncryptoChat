const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes.js");
const Message = require("./models/MessageModel.js");
const GroupModel = require("./models/GroupModel.js");
const UserModel = require("./models/UserModel.js");

dotenv.config();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://encryptochat.netlify.app",
      "https://encrypto-chat.vercel.app", // Added new frontend origin
    ], 
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://encryptochat.netlify.app",
    "https://encrypto-chat.vercel.app",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


app.use(express.json());


try {
  mongoose.connect(process.env.DB_URL);
} catch (error) {
  console.log(error);
}

const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://encryptochat.netlify.app",
      "https://encrypto-chat.vercel.app", // Added new frontend origin
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});


app.use("/api/v1/user", userRoutes);

const findGroupByName = async (username) => {
  const grp = await GroupModel.findOne({ name: username });
  return grp;
}

const saveMessage = async (msg) => {
  const newMsg = new Message(msg);
  let finalmsg = await newMsg.save();
  return finalmsg;
}

async function findUserByUsername(username) {
  const user = await UserModel.findOne({ username });
  return user;
}

const prepareFinalMessage = (msg, image, isRead, myside = false) => ({
  _id: msg._id,
  to: msg.to,
  from: msg.from,
  tocontent: msg.tocontent,
  fromcontent: msg.fromcontent,
  isForward: msg.isForward,
  image,
  myside,
  isRead,
  memberSeen: msg.memberSeen || [],
});

const emitChatUpdate = (io, user, event, data) => {
  io.to(user).emit(event, data);
};



io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Register user
  socket.on("register", async (username) => {
    if (!username) {
      return;
    }

    // users.set(username, socket.id);
    socket.join(username);
    console.log(`${username} registered with socket ID: ${socket.id}`);
  });

  // Handle private messages
  socket.on("private_message1", async (msg) => {
    // Check for missing fields in the message
    if (!msg.from || !msg.to || typeof msg.isGroup === "undefined") {
      console.log("Invalid message object:", msg);
      return;
    }

    let finalmsg = await saveMessage(msg);
    const user = await findUserByUsername(msg.from);
    const image = user.image;


    if (!msg.isGroup) {
      // Handle private message
      const touser = await findUserByUsername(msg.to);
      const toimage = touser.image;

      const countMessages = await Message.find({
        to: msg.to,
        from: msg.from,
        isRead: false
      }).countDocuments();


      if (msg.from) {


        emitChatUpdate(io, msg.from, "get-msg-id-private-msg-1", prepareFinalMessage(finalmsg, image, false,true));
        emitChatUpdate(io, msg.from, "chat-updated-1", {...prepareFinalMessage(finalmsg, toimage, finalmsg.read),unseenMessages:0,});
      }

      if (msg.to !== msg.from) {
        if (msg.to) {

          emitChatUpdate(io,msg.to,'private_message2',prepareFinalMessage(finalmsg,image,finalmsg.isRead,false));
          emitChatUpdate(io,msg.to,'chat-updated-2',{...prepareFinalMessage(finalmsg,image,finalmsg.isRead,false),unseenMessages:countMessages});
        }
      }
    } else {
      // Handle group message

      // const touser = await findUserByUsername(msg.to);
      // const toimage = touser.image;
      const Group = await findGroupByName(msg.to);
      if (msg.from) {


         emitChatUpdate(io, msg.from, "get-msg-id-private-msg-1", prepareFinalMessage(finalmsg, image, finalmsg.isRead,true));

         emitChatUpdate(io, msg.from, "chat-updated-1", {...prepareFinalMessage(finalmsg, Group.image, finalmsg.read),unseenMessages:0,});
      }


      if (!Group) {
        console.log(`Group with name ${msg.to} not found`);
        return; // Handle gracefully if group not found
      }

      const members = Group.members;

      for (let username of members) {
        if (username !== msg.from) {

          const countMessages = await Message.find({
            to: msg.to,
            from: { $ne: username },
            memberSeen: { $ne: username }
          }).countDocuments();



          io.to(username).emit("private_message2", {
            _id: finalmsg._id,
            to: username,
            from: msg.to,
            tocontent: finalmsg.tocontent,
            fromcontent: finalmsg.fromcontent,
            isForward: finalmsg.isForward,
            image,
            memberSeen: msg.memberSeen ? msg.memberSeen : [],
          });

          io.to(username).emit("chat-updated-2", {
            _id: finalmsg._id,
            to: username,
            from: msg.to,
            image:Group.image,
            tocontent: finalmsg.tocontent,
            fromcontent: finalmsg.fromcontent,
            isForward: finalmsg.isForward,
            unseenMessages: countMessages,
          });
        }
      };
    }
  });






  socket.on("delete-msg-1", async (msg) => {
    if (msg.myside == true) {
      if (!msg.isGrp) {
        // private msg
        if (msg.to) {
          io.to(msg.to).emit("delete-msg-2", msg);
        }
      } else {
        // group msg

        const Group = await findGroupByName(msg.to);
        if (!Group) {
          console.log(`Group with name ${msg.to} not found`);
          return; // Handle gracefully if group not found
        }

        const members = Group.members;

        members.forEach((username) => {
          if (username !== msg.from) {
            io.to(username).emit("delete-msg-2", {
              _id: msg._id,
              to: username,
              from: msg.to,
              tocontent: msg.tocontent,
              fromcontent: msg.fromcontent,
              isForward: msg.isForward,
              myside: msg.myside,
              image: msg.image,
              isGrp: msg.isGrp,
            });
          }
        });
      }
      await Message.deleteOne({ _id: msg._id });
    }
  });



  socket.on("read-msg-for-particular-chat", async ({ username, mainuser }) => {
    try {
      const group = await findGroupByName(username);

      if (group) {
        const members = group.members;
        const grpsize = group.members.length - 1;


        const messages = await Message.find({ to: username, from: { $in: members } });

        const users = await UserModel.find({ username: { $in: members } });
        const map = new Map();

        users.forEach((user) => {
          map.set(user.username, user.image);
        })

        // let finalmsg = [];

        for (let msg of messages) {
          // Ensure `mainuser` is added to `memberSeen` only if it's not already there
          if (!msg.memberSeen?.includes(mainuser)) {
            if (msg.from !== mainuser) {
              await Message.findByIdAndUpdate(msg._id, { $addToSet: { memberSeen: mainuser } });
              msg.memberSeen.push(mainuser); // Reflect the change locally for `finalmsg`
            }
          }

          let isRead = false;
          if (msg.memberSeen.length === grpsize) {
            isRead = true;

            await Message.findByIdAndUpdate(msg._id, { isRead: true });
          }

          members.forEach((mem) => {
            if (msg.from === mem) {

              io.to(mem).emit("messages-read", { to: username, msg: prepareFinalMessage(msg,map.get(msg.from),isRead,true), isGrp: true });
            } else {

              io.to(mem).emit("messages-read", { to: username, msg: prepareFinalMessage(msg,map.get(msg.from),isRead,false), isGrp: true });
            }
          })
        }


      }

      else {
        // Update messages where `from` is `username` and `to` is `mainuser`
        const filter = { from: username, to: mainuser, isRead: false }; // Add 'isRead: false' to avoid unnecessary updates
        const update = { $set: { isRead: true } };

        // Update messages
        await Message.updateMany(filter, update);


        // Find updated messages (optional)
        let updatedMessages = await Message.find({ $or: [{ from: username, to: mainuser }, { to: username, from: mainuser }] });

        const user1 = await findUserByUsername(mainuser);
        const mainuserimage = user1.image ? user1.image : '';

        const user2 = await findUserByUsername(username);
        const usernameimage = user2.image ? user2.image : '';

        let finalmsg = [];

        updatedMessages.forEach((msg) => {
          if (msg.from === mainuser) {


            finalmsg.push(prepareFinalMessage(msg,mainuserimage,msg.isRead,false));
          } else {

            finalmsg.push(prepareFinalMessage(msg,usernameimage,msg.isRead,true));
          }
        })

        io.to(username).emit("messages-read", { to: mainuser, msg: finalmsg, isGrp: false });
      }

    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });



});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`server is running on 3000`);
});
