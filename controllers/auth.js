const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../db/models/User");

exports.register = async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
            message: "Please fill all the required fields",
        });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password less than 6 characters" });
    }

    let profilePicture = '';
    if (req.file) {
        profilePicture = req.file.path;
    }

    bcrypt.hash(password, 10).then(async (hash) => {
        await User.create({
            email,
            firstName,
            lastName,
            profilePicture,
            password: hash,
        })
            .then((user) => {
                const maxAge = process.env.JWT_EXPIRY;
                const token = jwt.sign(
                    { id: user._id, email, firstName, lastName },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: maxAge,
                    }
                );
                res.cookie("jwt", token, {
                    httpOnly: true,
                    maxAge: maxAge * 1000,
                });
                res.status(201).json({
                    message: "User successfully created",
                    user
                });
            })
            .catch((error) =>
                res.status(400).json({
                    message: "User not successful created",
                    error: error.message,
                })
            );
    });
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email or Password not present",
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({
                message: "Login not successful",
                error: "User not found",
            });
        } else {
            bcrypt.compare(password, user.password).then(function (result) {
                if (result) {
                    const maxAge = process.env.JWT_EXPIRY * 60 * 60;
                    const token = jwt.sign(
                        {
                            id: user._id,
                            email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            profilePicture: user.profilePicture,
                        },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: maxAge,
                        }
                    );
                    res.cookie("jwt", token, {
                        httpOnly: true,
                        maxAge: maxAge * 1000,
                    });
                    res.status(201).json({
                        message: "User successfully Logged in",
                        id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        profilePicture: user.profilePicture,
                    });
                } else {
                    res.status(400).json({ message: "Login not succesful" });
                }
            });
        }
    } catch (error) {
        res.status(400).json({
            message: "An error occurred",
            error: error.message,
        });
    }
};

exports.updateUser = async (req, res) => {
    const { password, confirmPassword } = req.body;
    const { user } = req;

    let payload = req.body;
    delete payload.password;

    if (password && password !== "") {
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match" });
        } else {
            const hash = await bcrypt.hash(password, 10);
            payload.password = hash;
        }
    }

    try {
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const userFound = await User.findById(user.id);
        if (!userFound) {
            return res.status(400).json({ message: "User not found" });
        }

        if (req.file) {
            if (userFound.profilePicture) {
                const filename = userFound.profilePicture.split("/").pop();
                const imagePath = path.join(
                    __dirname,
                    "..",
                    filename
                );

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            payload.profilePicture = req.file.path;
        }

        const updatedUser = await User.findByIdAndUpdate(userFound._id, { $set: payload }, { new: true });

        res.clearCookie('jwt');
        res.status(201).json({ message: "User updated successful", user: updatedUser });
    } catch (error) {
        console.log("Error update user: ", error);
        res.status(400).json({ message: "An error occurred", error: error.message });
    }
};

exports.deleteUser = async (req, res, next) => {
    const { user } = req;

    if (!user) {
        return res
            .status(400)
            .json({ message: "User not found", error: error.message })
    }

    try {
        const deletedUser = await User.findByIdAndDelete(user.id)

        res.clearCookie('jwt');
        res.status(201).json({ message: "Account deleted successful", user: deletedUser });
    } catch (error) {
        res
            .status(400)
            .json({ message: "An error occurred", error: error.message })
    }
};

exports.logout = async (req, res, next) => {
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Logout successful' });
}