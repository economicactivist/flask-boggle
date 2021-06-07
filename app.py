from flask import Flask, request, render_template, jsonify, session
from boggle import Boggle

app = Flask(__name__)
app.config["SECRET_KEY"] = "fdfgkjtjkkg45yfdb"

#* create an instace of the Boggle class
boggle_game = Boggle()


@app.route("/")
def homepage():
    """Show board."""
    #* returns a list of five inner lists, each with five random
    #* characters from A to Z
    board = boggle_game.make_board()
    #* creates cookie to store the list of lists of letters
    session['board'] = board
    #if no highscore variable exists, it's intialized here
    highscore = session.get("highscore", 0)
    #if no nplays variable exists, it's intialized here
    nplays = session.get("nplays", 0)

    #make variables created here available to index.html for jinja templating
    return render_template("index.html", board=board,
                           highscore=highscore,
                           nplays=nplays)

#* called through boggle.js file: 
#* const resp = await axios.get("/check-word", { params: { word: word }});
#? why does this function need a path if it's not rendering any html?
@app.route("/check-word")
def check_word():
    """Check if word is in dictionary."""
    #* get submitted word from handlesubmit() in js file 
    #* accessed through a GET request, so use request.args
    #? why not request.json?
    word = request.args["word"]
    #* not sure why we're assigning session["board"] to a variable
    #* maybe it can't be passed directly as argument to check_valid_word
    board = session["board"]
    response = boggle_game.check_valid_word(board, word)
    return jsonify({'result': response})  #! either "ok", "not-on-board", or "not-word"

 #? would this still work as a get request?
@app.route("/post-score", methods=["POST"])
def post_score():
    """Receive score, update nplays, update high score if appropriate."""
    score = request.json["score"]
    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)

    session['nplays'] = nplays + 1
    session['highscore'] = max(score, highscore)

    return jsonify(brokeRecord=score > highscore) #! either true or false but why not in form {'brokeRecord': score}?