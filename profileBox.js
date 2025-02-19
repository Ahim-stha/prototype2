function toggleProfile() {
    var profileBox = document.getElementById('profileBox');
    if (profileBox.style.display === "none" || profileBox.style.display === "") {
        profileBox.style.display = "block";
    } else {
        profileBox.style.display = "none";
    }
}

function logout() {
    // Show alert before logging out
    alert('You are logged out of this page.');
        window.location.replace("loginPage.html");
}
