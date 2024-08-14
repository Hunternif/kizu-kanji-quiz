export function QuestionModeHelp() {
  return (
    <div className="help-article">
      <h2>Question mode</h2>
      <p>What the question looks like:</p>
      <table>
        <tr>
          <td>漢字</td>
          <td>Shows original Kanji writing*.</td>
        </tr>

        <tr>
          <td>Meaning</td>
          <td>Shows the word's meaning* in English.</td>
        </tr>
        <tr>
          <td>ひらがな</td>
          <td>Shows the word's spelling in Hiragana*.</td>
        </tr>
        <tr>
          <td>Romaji</td>
          <td>Shows the word's spelling in Romaji (English alphabet).</td>
        </tr>
      </table>
      <p>
        * For Hiragana & Katakana questions, 'Kanji' will show the original
        Kana, and 'meaning' will show Romaji.
      </p>
    </div>
  );
}

export function AnswerModeHelp() {
  return (
    <div className="help-article">
      <h2>Answer mode</h2>
      <p>What the players' answers will look like:</p>
      <table>
        <tr>
          <td>Choose kanji</td>
          <td>Multiple choice, select the Kanji writing*.</td>
        </tr>
        {/* <tr>
          <td>Draw kanji</td>
          <td>Draw kanji* on the screen.</td>
        </tr> */}
        <tr>
          <td>Choose meaning</td>
          <td>Multiple choice, select the word's meaning* in English.</td>
        </tr>
        <tr>
          <td>Type meaning</td>
          <td>Type the word's meaning* directly.</td>
        </tr>
        <tr>
          <td>Choose hiragana</td>
          <td>Multiple choice, select the word's spelling in Hiragana.</td>
        </tr>
        {/* <tr>
          <td><li>Draw hiragana</td>
          <td>Draw hiragana on the screen.</td>
        </tr> */}
        <tr>
          <td>Choose romaji</td>
          <td>
            Multiple choice, select the word's spelling in Romaji (English
            alphabet).
          </td>
        </tr>
        <tr>
          <td>Type romaji</td>
          <td>Type Romaji spelling directly.</td>
        </tr>
      </table>
      <p>
        * For Hiragana & Katakana questions, 'Kanji' will show the original
        Kana, and 'meaning' will show Romaji.
      </p>
    </div>
  );
}
