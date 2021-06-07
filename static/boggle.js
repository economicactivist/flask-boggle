class BoggleGame {
    /* make a new game at this DOM id */
  
    constructor(boardId, secs = 60) {
      this.secs = secs; // game length
      this.showTimer();
  
      this.score = 0;
      this.words = new Set();
      this.board = $("#" + boardId);
  
      // every 1000 msec, "tick"
      //? why are we not binding "this.timer" too?
      this.timer = setInterval(this.tick.bind(this), 1000);
      //* form in index.html has class="add-word", add id="boardId", then bind "this"
      $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
    }
  
    /* show word in list of words */
    //* add word to list below from (and below any messages)
    showWord(word) {
      $(".words", this.board).append($("<li>", { text: word }));
    }
  
    /* show score in html */
    //* in paragraph element above form
    showScore() {
      $(".score", this.board).text(this.score);
    }
  
    /* show a status message */
    //* adds text and style class ("err" or "ok") to paragraph element below form
    showMessage(msg, cls) {
      $(".msg", this.board)
        .text(msg)
        .removeClass()
        .addClass(`msg ${cls}`);
    }
  
    /* handle submission of word: if unique and valid, score & show */
  
    async handleSubmit(evt) {
      evt.preventDefault();

    //* Grabs the input element, class="word" and ads an id #boardID
    //? Why does need a separate board id?  
      const $word = $(".word", this.board);
    //* gets text from input box
      let word = $word.val();
    //* if the user doesn't enter a word, do nothing
      if (!word) return;
    //* ".has()" is used with sets in js "x = new Set()"  x.has()...
      if (this.words.has(word)) {
        this.showMessage(`Already found ${word}`, "err");
        return;
      }
  
      // check server for validity
      //* this is a GET request so the receiving function will use request.args
      //! remember that axios will turn the JSON string into a JS object
      const resp = await axios.get("/check-word", { params: { word: word }});
      if (resp.data.result === "not-word") {
        this.showMessage(`${word} is not a valid English word`, "err");
      } else if (resp.data.result === "not-on-board") {
        this.showMessage(`${word} is not a valid word on this board`, "err");
      } else {
        this.showWord(word);
        this.score += word.length;
        this.showScore();
        //* .add() is used with sets
        this.words.add(word);
        //!where is the logic to clear the messages?
        this.showMessage(`Added: ${word}`, "ok");
      }
  
      $word.val("").focus();
    }
  
    /* Update timer in DOM */
  
    showTimer() {
      $(".timer", this.board).text(this.secs);
    }
  
    /* Tick: handle a second passing in game */
    //?  why is this an async function?  
    //? Shouldn't tick intervals be constant and not await any other processes?
    async tick() {
      this.secs -= 1;
      this.showTimer();
  
      if (this.secs === 0) {
        clearInterval(this.timer);
        await this.scoreGame();
      }
    }
  
    /* end of game: score and update message. */
  
    async scoreGame() {
      $(".add-word", this.board).hide();
      //* returns true or false
      const resp = await axios.post("/post-score", { score: this.score }); //? would this work as a get request?
      if (resp.data.brokeRecord) {
        this.showMessage(`New record: ${this.score}`, "ok");
      } else {
        this.showMessage(`Final score: ${this.score}`, "ok");
      }
    }
  }