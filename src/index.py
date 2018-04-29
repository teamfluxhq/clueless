###################################
## Team Flux Copyright 2018
## 
##
###################################
from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def gameview():
    return render_template('index.html', title="Home")

if __name__ == '__main__':
   app.run(host="0.0.0.0", port=5000, debug=True)