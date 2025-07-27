from flask_wtf import FlaskForm
from wtforms.validators import Length, DataRequired
from wtforms import (StringField, PasswordField, SubmitField, HiddenField)

class UserLoginForm(FlaskForm):

    username = StringField("Username", validators=[DataRequired(), Length(min=3, max=20)])
    current_password = PasswordField("Password", validators=[DataRequired(), Length(min=8)])
    captcha_answer = StringField("Your Answer", validators=[DataRequired()])
    submit = SubmitField("Submit")
