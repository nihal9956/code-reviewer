const getProfile =   (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.send(`<h1>Hello ${req.user.username}</h1><a href="/logout">Logout</a>`);
}
module.exports = {
    getProfile
}