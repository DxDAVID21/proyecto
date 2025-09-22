document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('quiz-container');
  const resultatDiv = document.getElementById('resultat');
  const contadorDiv = document.getElementById('contador');
  const tempsDiv = document.getElementById('temps-restant');
  const btnComneçar = document.getElementById('btn-començar');

  let tempsTotal = 30;
  let intervalID = null;
  let puntuacioActual = 0;
  let totalPreguntes = 0;
  
  btnComneçar.addEventListener('click', () =>{
    btnComneçar.style.display = 'none';
    tempsDiv.style.display = 'block';
    contadorDiv.style.display = 'block';
    reiniciarQuiz();
    inciarTemporitzador();
    cargarPregunta();
  })

  // Temporadizador global del juego
  function inciarTemporitzador(){
    tempsDiv.textContent = `Temps restant: ${tempsTotal}s`;
    intervalID = setInterval(() => {
      tempsTotal --;
      tempsDiv.textContent = `Temps restant: ${tempsTotal}s`;
      if (tempsTotal <= 0){
        clearInterval(intervalID);
        finalitzarPerTemps();
      }
    }, 1000);
  }

  // Funció per mostrar una pregunta
  function mostrarPregunta(data) {
    let html = `<h3>${data.pregunta}</h3>`;
    if (data.imatge) {
      html += `<img src="${data.imatge}" alt="bandera" style="max-width: 300px; margin-bottom: 10px;">`;
    }
    data.respostes.forEach(r => {
      html += `<button data-id="${r.id}">${r.resposta}</button>`;
    });
    container.innerHTML = html;
    contadorDiv.textContent = `Pregunta ${data.indice + 1} de ${data.total}`;
    resultatDiv.textContent = '';
  }

  // Funció per cargar la pregunta actual
  function cargarPregunta() {
    fetch('php/data.php')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          resultatDiv.textContent = data.error;
          container.innerHTML = '';
          return;
        }
        if (!intervalID) inciarTemporitzador();
        totalPreguntes = data.total;
        mostrarPregunta(data);
      })
      .catch(() => {
        resultatDiv.textContent = 'Error carregant la pregunta.';
        container.innerHTML = '';
      });
  }

  // Funció per enviar la respuesta seleccionada
  function enviarResposta(id) {
    fetch('php/check_answer.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: 'resposta=' + encodeURIComponent(id)
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        resultatDiv.textContent = data.error;
        return;
      }

      if (data.correcte) puntuacioActual++;

      if (data.acabat) {
        clearInterval(intervalID);
        container.innerHTML = '';
        resultatDiv.innerHTML = `
          <p>Quiz acabat! Has encertat ${data.puntuacioActual} de ${totalPreguntes} preguntes.</p>
          <button id="btn-reiniciar">Tornar a jugar</button>
        `;

        document.getElementById('btn-reiniciar').addEventListener('click', reiniciarQuiz);
      } else {
        mostrarPregunta(data)
        resultatDiv.textContent = data.correcte ? 'Correcte! 🎉' : 'Incorrecte 😞';
        /*
        setTimeout(() => {
          mostrarPregunta(data);
        }, 1500);
        */
      }
    })
    .catch(() => {
      resultatDiv.textContent = 'Error enviant la respuesta.';
    });
  }

  // Funció per reiniciar el quiz
  function reiniciarQuiz() {
    fetch('php/reset.php')
      .then(() => {
        puntuacioActual = 0;
        tempsTotal = 30;
        clearInterval(intervalID);
        intervalID = null;  
        resultatDiv.textContent = '';
        container.innerHTML = '';
        tempsDiv.style.display = 'block';
        contadorDiv.style.display = 'block';
        cargarPregunta();
        inciarTemporitzador();
      })
      .catch(() => {
        resultatDiv.textContent = 'Error al reiniciar el quiz.';
      });
  }

  function finalitzarPerTemps(){
    container.innerHTML = '';
    resultatDiv.innerHTML = `
      <p> Temps esgotat! ⏰ Has encertat ${puntuacioActual} de ${totalPreguntes} preguntes. </p>
      <button id = "btn-reiniciar">Tornar a jugar</button>
    `;
    document.getElementById('btn-reiniciar').addEventListener('click', reiniciarQuiz);
  }

  container.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON' && e.target.hasAttribute('data-id')) {
      const id = e.target.getAttribute('data-id');
      if (id) enviarResposta(id);
    }
  });
});
