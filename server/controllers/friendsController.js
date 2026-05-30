import User from "../models/User.js";

/* ── SEND REQUEST ── */
export const sendRequest = async (req, res) => {
  try {
    const { targetUsername } = req.body;
    if (!targetUsername?.trim()) return res.status(400).json({ message: "Username is required" });

    const me = await User.findById(req.user._id);
    // Case-insensitive name search
    const target = await User.findOne({ name: new RegExp(`^${targetUsername.trim()}$`, "i") });

    if (!target) return res.status(404).json({ message: "User not found" });
    if (target._id.equals(me._id)) return res.status(400).json({ message: "Cannot add yourself" });

    // Use .some() with .equals() — Array.includes() fails on Mongoose ObjectIds
    if (me.friends.some(id => id.equals(target._id)))
      return res.status(400).json({ message: "Already friends" });
    if (target.friendRequests.some(id => id.equals(me._id)))
      return res.status(400).json({ message: "Friend request already sent" });
    if (me.friendRequests.some(id => id.equals(target._id)))
      return res.status(400).json({ message: "This user already sent you a request — check your Requests tab" });

    await User.findByIdAndUpdate(target._id, { $push: { friendRequests: me._id } });
    res.json({ message: "Friend request sent" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ── ACCEPT REQUEST ── */
export const acceptRequest = async (req, res) => {
  try {
    const { fromUserId } = req.body;
    if (!fromUserId) return res.status(400).json({ message: "fromUserId is required" });

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friendRequests: fromUserId },
      $addToSet: { friends: fromUserId },
    });
    await User.findByIdAndUpdate(fromUserId, {
      $addToSet: { friends: req.user._id },
    });
    res.json({ message: "Friend added" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ── DECLINE REQUEST ── */
export const declineRequest = async (req, res) => {
  try {
    const { fromUserId } = req.body;
    if (!fromUserId) return res.status(400).json({ message: "fromUserId is required" });

    await User.findByIdAndUpdate(req.user._id, { $pull: { friendRequests: fromUserId } });
    res.json({ message: "Request declined" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ── GET FRIENDS LIST ── */
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "name avatar rating bestWpm isOnline lastSeen")
      .populate("friendRequests", "name avatar");
    res.json({ friends: user.friends, requests: user.friendRequests });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ── REMOVE FRIEND ── */
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    if (!friendId) return res.status(400).json({ message: "friendId is required" });

    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: req.user._id } });
    res.json({ message: "Friend removed" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ── SEARCH USERS ── */
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim() || q.trim().length < 2)
      return res.status(400).json({ message: "Query must be at least 2 characters" });

    const me = await User.findById(req.user._id);
    const users = await User.find({
      name: new RegExp(q.trim(), "i"),
      _id: { $ne: req.user._id },
    }).select("name avatar rating bestWpm").limit(8);

    // Annotate each result with relationship status
    const results = users.map(u => ({
      _id: u._id,
      name: u.name,
      avatar: u.avatar,
      rating: u.rating,
      bestWpm: u.bestWpm,
      isFriend: me.friends.some(id => id.equals(u._id)),
      requestSent: u.friendRequests
        ? false // we don't load target's requests here
        : false,
    }));

    res.json({ users: results });
  } catch (err) { res.status(500).json({ message: err.message }); }
};