import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import _ from 'lodash';
import axios from "axios";
import './styles/App.scss';

function QuizCard({ data, ayah, newQuestion }) {
  const [ state, setState ] = useState('quiz');
  const [ correctScore, setCorrectScore ] = useState(0);
  const [ totalScore, setTotalScore ] = useState(0);
  const [ correct, setCorrect ] = useState(true);

  let { surah_name, ayat, start_ayah, end_ayah, } = data;
  let numbers = _.map(ayat, 'numberInSurah');

  const numberClicked = (num) => {
    setState('result');
    setTotalScore(totalScore + 1);
    setCorrect(num === ayah.num);
    if (correct)
      setCorrectScore(correctScore + 1);
  }

  const continueClicked = () => {
    setState('quiz');
    newQuestion();
  }

  let score = <p className="score">Correct: { correctScore } Total: { totalScore }</p>;

  if (state === 'result') {
    return (
      <>
        { score }
        {
          correct
          ? <p className="good result">Correct</p>
          : <>
              <p className="bad result">Incorrect</p>
              <p className="correct-answer">The correct answer was { ayah.num }</p>
            </>
        }
        <button onClick={continueClicked}>Continue</button>
      </>
    );
  }

  return (
    <>
      { score }
      <h2>{ surah_name } { start_ayah }-{ end_ayah }</h2>
      <p className="text">Select the number of the ayah below</p>
      <p className="arabic">{ ayah.text }</p>
      <div className="button-grid">
        {numbers.map((n) => (
          <button
            key={n}
            onClick={() => numberClicked(n)}
          >{n}</button>
        ))}
      </div>
    </>
  );
}

function App() {
  const [ data, setData ] = useState(null);
  const [ ayah, setAyah ] = useState(null);
  let location = useLocation();

  /* run only on page load */
  useEffect(() => {
    let params = queryString.parse(location.search);
    let surah_num = params.surah_num;
    let start_ayah = params.start_ayah;
    let num_ayat = params.num_ayat;
    axios.get(
      `http://api.alquran.cloud/v1/surah/${surah_num}`, {
        params: {offset: start_ayah - 1, limit: num_ayat},
      },
    ).then((res) => {
      setData({
        surah_name: res.data.data.englishName,
        ayat: res.data.data.ayahs,
        start_ayah,
        end_ayah: start_ayah + num_ayat - 1,
      });
    }).catch((err) => console.log(err));
  }, [location.search]);

  const newQuestion = useCallback(() => {
    if (!data)
      return;

    /* random ayah from list */
    let ayah_object = data.ayat[Math.floor(Math.random() * data.ayat.length)];
    let num = ayah_object.numberInSurah;
    let text = ayah_object.text;
    setAyah({ num, text });
  }, [data]);

  useEffect(() => newQuestion(), [data, newQuestion]);

  return (
    <div className="App">
      <div className="card">
        {(data && ayah) ? <QuizCard data={data} ayah={ayah} newQuestion={newQuestion}/> : <div className="loading">Loading...</div>}
      </div>
    </div>
  );
}

export default App;
