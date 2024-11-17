const status = async (req, res) => {
  res.status(200).json({ message: "Test api" });
};

export default status;
