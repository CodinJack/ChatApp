import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
	try {
		const { message } = req.body;
		const { id: receiverID } = req.params;
		const senderID = req.user._id;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderID, receiverID] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderID, receiverID],
			});
		}

		const newMessage = new Message({
			senderID,
			receiverID,
			message,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		// to make it run in parallel
		await Promise.all([conversation.save(), newMessage.save()]);

		// SOCKET IO FUNCTIONALITY WILL GO HERE
		const receiverSocketId = getReceiverSocketId(receiverID);
		if (receiverSocketId) {
			// io.to(<socket_id>).emit() used to send events to specific client
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderID = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderID, userToChatId] },
		}).populate("messages"); // actual messages

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};