
const UserModel = require('../models/UserModel.js');
const MessageModel = require('../models/MessageModel.js');
const GroupModel = require('../models/GroupModel.js');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');

const generateToken = (user) => {

    return JWT.sign({ userId: user._id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '2y' });
}

const RegisterDataController = async (req, res) => {

    try {

        const user1 = await UserModel.findOne({ username: req.body.username });


        if (user1) {
            return res.status(200).send({
                success: false,
                message: 'User Name Already Exist, Try another one',
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashpass = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashpass;
        const user = new UserModel(req.body);
        await user.save();

        res.status(201).send({
            success: true,
            message: 'Register Successfully',
        })


    } catch (error) {
        return res.status(500).send({
            success: false,
            message: 'Server Error',
        })
    }

}
const LoginController = async (req, res) => {

    try {
        // console.log(req.body.username);
        const user = await UserModel.findOne({ username: req.body.username });
        // console.log(user);
        if (!user) {
            return res.status(200).send({
                success: false,
                message: 'Check your details',
            });
        }



        const found = await bcrypt.compare(req.body.password, user.password);
        // console.log(found);
        if (!found) {
            return res.status(200).send({
                success: false,
                message: 'Check your details',
            });
        }



        return res.status(200).send({
            success: true,
            message: 'Login Successfully',
            token: generateToken(user),
            user: user,
        })



    } catch (error) {
        return res.status(500).send({
            success: false,
            message: 'Server Error',
        })
    }

}

const getPublicKeyController=async(req,res)=>{
    try {

        const user=await UserModel.findOne({username:req.body.username});
        
        res.status(201).send({
            success:true,
            message:'public key fetched',
            publicKey:user.publicKey,
        })

        
    } catch (error) {
        res.status(500).send({
            success:true,
            message:'public key can not fetched server issue',
            error,
        })

    }
}


const getUserController = async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.userId });
        if (!user) {
            return res.status(200).send({
                success: false,
                message: 'you are not a user',
            })
        }
        res.status(200).send({
            success: true,
            message: 'get user',
            user: user,
        })

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'not getting user',
            error,
        })
    }

}

const SearchController = async (req, res) => {
    try {
        const user = await UserModel.findOne({ username: req.body.username });

        if (!user) {
            return res.status(200).send({
                success: false,
                message: 'user not found',
            })
        }

        res.status(200).send({
            success: true,
            message: 'get user',
            user: user,
        })

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'server error',
            error,
        })
    }

}


const chatsController = async (req, res) => {
    try {
        // Fetch messages involving the user, sorted by most recent first
        const friendsChat = await MessageModel.find({
            $or: [{ to: req.username }, { from: req.username }]
        }).sort({ createdAt: -1 }); // Sort by latest message timestamp

        const uniqueUsers = new Map(); // Use a Map to store unique usernames with the latest message

        // Extract unique usernames, prioritizing the latest message
        friendsChat.forEach((chat) => {
            const otherUser = chat.to === req.username ? chat.from : chat.to;

            // Add the user if not already in the map (keeps the first occurrence, which is the latest due to sorting)
            if (!uniqueUsers.has(otherUser)) {
                uniqueUsers.set(otherUser, chat.createdAt);
            }
        });

        const user = await UserModel.findOne({ username: req.username });

        const groups = user.groups ? user.groups : [];
        groups.forEach((groupname) => {
            if (!uniqueUsers.has(groupname)) {
                uniqueUsers.set(groupname, user.updatedAt);
            }
        });

        uniqueUsers.set(req.username, new Date()); // Include the current user (optional)

        // Convert Map to an array of usernames
        const usernames = Array.from(uniqueUsers.keys());

        // Fetch images for all usernames in parallel
        const usersData = await UserModel.find({ username: { $in: usernames } });

        // Initialize an array to store chat data
        const chats = [];

        // Loop through each username to add unseen message count
        for (const username of usernames) {
            // console.log(username);
            const userData = usersData.find((user) => user.username === username);
            

            if (!userData) {
                // for group
                const Group=await GroupModel.findOne({name:username});
                // console.log(Group);
                const unseenMessageCount = await MessageModel.countDocuments({
                    to: username,
                    from: {$ne:req.username},
                    memberSeen:{$ne:req.username},
                });

                chats.push({
                    username,
                    image: userData?.image || (Group?.image || ''), 
                    unseenMessages: unseenMessageCount,
                });

            }

            else {
                const unseenMessageCount = await MessageModel.countDocuments({
                    to: req.username,
                    from: username,
                    isRead: false,
                });

                chats.push({
                    username,
                    image: userData?.image || '',
                    unseenMessages: unseenMessageCount,
                });
            }
        }

        // Send the response
        res.status(200).send({
            message: 'Chats fetched successfully',
            success: true,
            chats,
        });
    } catch (error) {
        res.status(500).send({
            message: 'Failed to fetch chats',
            success: false,
            error: error.message,
        });
    }
};




const getChatMessagesController = async (req, res) => {
    try {
        const sender = req.username;

        // Fetch user and their groups
        const user = await UserModel.findOne({ username: sender });
        const groups = user.groups || [];

        // Fetch all messages related to the user or their groups in one go
        const messages = await MessageModel.find({
            $or: [
                { from: sender },
                { to: sender },
                { to: { $in: groups } }
            ]
        });

        let chats = {};

        // Process messages
        for (const msg of messages) {
            const user = await UserModel.findOne({ username: msg.from });
            const image = user?.image || '';

            if (msg.to && groups.includes(msg.to)) {
                // Group messages
                let myside = false;
                if (msg.from === sender) {
                    myside = true;
                }

                if (!chats[msg.to]) chats[msg.to] = [];
                chats[msg.to].push({
                    _id: msg._id,
                    to: msg.to,
                    from: msg.from,
                    fromcontent: msg.fromcontent,
                    tocontent: msg.tocontent,
                    myside: myside,
                    isForward: msg.isForward,
                    image,
                    isRead: msg.isRead,
                    memberSeen: msg.memberSeen ? msg.memberSeen : [],
                });
            } else {
                // Direct messages
                const chatKey = msg.from === sender ? msg.to : msg.from;
                if (!chats[chatKey]) chats[chatKey] = [];
                chats[chatKey].push({
                    _id: msg._id,
                    to: msg.to,
                    from: msg.from,
                    fromcontent: msg.fromcontent,
                    tocontent: msg.tocontent,
                    myside: msg.from === sender,
                    isForward: msg.isForward,
                    image,
                    isRead: msg.isRead,
                    memberSeen: msg.memberSeen ? msg.memberSeen : [],
                });
            }
        }


        res.status(200).send({
            success: true,
            message: 'Chat fetched successfully',
            chat: chats,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};



const getUserSuggestionController = async (req, res) => {
    try {
        const { query } = req.headers; // Get the search query from the request
        if (!query) {
            return res.status(200).send({
                success: false,
                message: 'Query parameter is required',
            });
        }

        // Perform case-sensitive search
        let users = await UserModel.find({
            username: { $regex: `^${query}` }, // Case-sensitive by default
        }).limit(10); // Limit the results for efficiency


        // Perform case-sensitive search
        let grps = await GroupModel.find({
            name: { $regex: `^${query}` }, // Case-sensitive by default
        }).limit(10); // Limit the results for efficiency

        grps.forEach((grp) => {
            users.push({
                username: grp.name,
                image: grp.image ? grp.image : null,
            })
        })

        res.status(200).send({
            success: true,
            users,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server error',
            error,
        });
    }
}



const getuserChatImageController = async (req, res) => {
    try {
        const user = req.body.chatuser;

        const userfind = await UserModel.findOne({ username: user });

        let grpfind;
        if (!userfind) {
            grpfind = await GroupModel.findOne({ username: user });
        }

        let image = '';
        if (userfind && userfind.image) {
            image = userfind.image;
        } else if (grpfind && grpfind.image) {
            image = grpfind.image;
        }
        // Respond after all operations are complete
        res.status(201).send({
            success: true,
            message: 'Image retrieved successfully',
            image,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Server error',
            error,
        });
    }
};


const groupCreateController = async (req, res) => {

    try {
        const Group = new GroupModel(req.body);
        let updatedgrp = await Group.save();

        const members = req.body.members;

        for (const username of members) {
            let user = await UserModel.findOne({ username });
            if (user) {
                if (!user.groups) {
                    user.groups = []; // Initialize groups if it doesn't exist
                }
                user.groups.push(req.body.name); // Add the group name to the user's groups
                await user.save();
            }
        }

        res.status(201).send({
            success: true,
            image: updatedgrp.image ? updatedgrp.image : null,
            message: 'Group Added..',
        });

    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send({
            success: false,
            message: 'Server issue.',
        });
    }
};

const handleBackupController=async(req,res)=>{
    try {

        const {privateKey,salt,iv} = req.body;

        await UserModel.updateOne({_id:req.userId},{privateKey,salt,iv});

        res.status(201).send({
            success:true,
            message:'back up is successfully',
        })
        
    } catch (error) {
         res.status(500).send({
            success:true,
            message:'not backup',
            error,
        })
    }
}


const savePublicKeyController=async(req,res)=>{
    try {

        await UserModel.updateOne({username:req.username},{publicKey:req.body.publicKey});

        res.status(201).send({
            success:true,
            message:'new public key saved ..',
        })
        
    } catch (error) {
        res.status(500).send({
            success:true,
            message:'new public key is not created',
            error,
        })
    }
}

module.exports = { RegisterDataController, LoginController, getUserController, SearchController, chatsController, getChatMessagesController, getUserSuggestionController, getuserChatImageController, groupCreateController,getPublicKeyController,handleBackupController ,savePublicKeyController};