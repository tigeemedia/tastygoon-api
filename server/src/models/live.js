router.post("/start", authenticateToken, async (req, res) => {
  try {
    const newStream = new LiveStream({
      host: req.user.id,
      title: req.body.title,
      streamKey: Math.random().toString(36).substring(2), // Generate unique stream key
    });

    await newStream.save();
    res.status(201).json({ message: "Live stream started", stream: newStream });
  } catch (error) {
    res.status(500).json({ message: "Error starting live stream", error });
  }
});
