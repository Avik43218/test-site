from flask import (Blueprint, render_template, redirect, url_for, session,
                   request, flash)
from website.users.forms import UserLoginForm
import json, random

users = Blueprint("users", __name__)

a = random.randint(1, 9)
b = random.randint(1, 9)

CAPTCHA_POOL = [
    {"q": f"What is {a} + {b}?", "a": f"{a + b}"},
    {"q": "Odd one out: Cat, Dog, Banana", "a": "banana"},
    {"q": "Next in sequence: 10, 20, 30, ?", "a": "40"},
    {"q": "What has hands but can't clap?", "a": "clock"},
    {"q": "What has a bed but can't sleep?", "a": "river"}
]

@users.route("/login", methods=['POST', 'GET'])
def login():

    if 'hsw_verified' not in session:
        session['hsw_verified'] = False

    form = UserLoginForm()

    if request.method == "GET":
        challenge = random.choice(CAPTCHA_POOL)
        session["captcha_question"] = challenge["q"]
        session["captcha_answer"] = challenge["a"].strip().lower()

    if form.validate_on_submit():
        user_answer = form.captcha_answer.data.strip().lower()
        real_answer = session.get("captcha_answer", "")

        if user_answer == real_answer:
            flash("[*] Verification successful", 'success')
            return redirect(url_for('main.dashboard'))
        else:
            flash("[!] Suspicious activity detected", 'danger')
            return redirect(url_for('users.login'))

    return render_template("login.html", form=form, question=session.get("captcha_question"))


@users.route("/verify_hsw", methods=['POST', 'GET'])
def verify_hsw():
        
    try:
        print(request.headers.get("Content-Type"))

        data = request.get_data(as_text=True)
        record = json.loads(data)

        print("[*] HSW Request: ")
        print(json.dumps(record, indent=4))

        suspicious_flags = record.get("suspicious", [])
        token_1 = record.get("token", "")

        if suspicious_flags:
            print(f"[!] Suspicious activity detected: {suspicious_flags}")
            session['hsw_verified'] = False
            return ('denied', 403)
        
        else:
            print(f"[*] Human verified. Token: {token_1}")
            session['hsw_verified'] = True
            return ('', 204)
        
    except Exception as e:
        print(f"[!] Exception while verifying HSW: {str(e)}")
        session['hsw_verified'] = False
        return ('error', 404)
