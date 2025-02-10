router.post("/tip/:recipientId", authenticateToken, async (req, res) => {
  try {
    const sender = await Wallet.findOne({ user: req.user.id });
    const recipient = await Wallet.findOne({ user: req.params.recipientId });
    const amount = req.body.amount;

    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    sender.balance -= amount;
    recipient.balance += amount;

    sender.transactions.push({ type: "tip", amount });
    recipient.transactions.push({ type: "earn", amount });

    await sender.save();
    await recipient.save();

    res.status(200).json({ message: "Tip sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error processing tip", error });
  }
});
