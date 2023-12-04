const logoutSocket = io.connect();

logoutSocket.on("inactive", async (userId) => {
    if (userId === localStorage.getItem("currentUserId")) {
        logout();
    }
})

const logout = function () {
    alert("Your account has been inactivated by the administrator, you will be logged out immediately")

    $.ajax({
        method: 'POST',
        url: '/users/logout',
    }).done(function () {
        localStorage.removeItem("currentUserId");
        logoutSocket.disconnect();
        window.location.href = '/';
    });
};