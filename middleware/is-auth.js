module.exports = (req, res, next) => {
    if(!req.session.isAuthenticated) {
        return res.redirect('/login');
    }

    // here in "middleware", next() is a function is in contrllers
    // not a function in next line.
    next();
}