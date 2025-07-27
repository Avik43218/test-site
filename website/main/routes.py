from flask import Blueprint, render_template, session

main = Blueprint("main", __name__)

@main.route("/")
@main.route("/home")
def home():

    return render_template("home.html", title="Home")

@main.route("/dashboard")
def dashboard():

    if session.get('hsw_verified') == False:
        return "<h1>Access Denied</h1><p>Suspicious activity detected</p>", 403

    return render_template("dashboard.html", title="Dashboard")
