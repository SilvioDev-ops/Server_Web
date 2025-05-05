export const checkRol = (allowedRoles) => (req, res, next) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(403).send("USER_NOT_FOUND");
    }

    const userRole =
      user.roles && Array.isArray(user.roles) ? user.roles[0] : undefined;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).send("ACCESS_DENIED");
    }

    next();
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
