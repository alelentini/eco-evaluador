/**************************************************************************************************************************************************
/* Global Objects 
/**************************************************************************************************************************************************/

const PAGE_TITLE = 'UTN-FRH - Economía';
let currentViewId = undefined;
let examId = undefined;
let examIx = undefined;
let deliveryData = undefined;
let startTime = undefined;


/**************************************************************************************************************************************************
/* Main function to be executed after page load 
/**************************************************************************************************************************************************/

async function main() {

    getUrlParameters();
    updateUI();
    startTime = new Date();
}


/**************************************************************************************************************************************************
/* Data functions 
/**************************************************************************************************************************************************/

// Gets parameters from URL query string
function getUrlParameters() {

    const params = new URLSearchParams(location.search);
    currentViewId = params.get('vista');
    examId = params.get('examen');
}


/**************************************************************************************************************************************************
/* GUI functions 
/**************************************************************************************************************************************************/

// Updates UI
function updateUI() {

    switch (currentViewId) {
        case 'preguntas':
            updateQuestionsView();
            break;
    
            case 'examenes':
            updateExamsView();
            break;

        default:
            document.getElementById('page-title').innerHTML = `${PAGE_TITLE}`;
            document.getElementById('default').classList.remove('d-none');
            break;
    }
}


// Updates UI: questions view
function updateQuestionsView() {

    // Updates page title
    document.getElementById('page-title').innerHTML = `${PAGE_TITLE} - Preguntas`;

    // Updates contents
    document.getElementById('preguntas-contenido').innerHTML = questionsCardsHtml(questions, true, false);
    
    // Shows questions view
    document.getElementById('examenes').classList.add('d-none');
    document.getElementById('examenes-info').classList.add('d-none');
    document.getElementById('preguntas-contenido').classList.remove('d-none');
    document.getElementById('preguntas-filtros').classList.remove('d-none');
}


// Returns html for questions as listed as cards
function questionsCardsHtml(questions, showAnswer, setQuestionsIx) {

    const regex = new RegExp('^[1-9]\.');
    let html = '';
    let instruction = '';
    let questionId = undefined;
    let questionIx = 0;
    let optionIx = undefined;
    questions.forEach(question => {
        switch (question.type) {
            
            case 'OM':
                instruction = '';
                optionIx = 1;
                question.instruction.split('<br>').forEach(line => {
                    if (regex.test(line)) {
                        instruction += `
                            <div class="form-check mt-3">
                                <input 
                                    class="form-check-input" 
                                    type="checkbox" 
                                    name="${question.id}-btn" 
                                    id="${question.id}-${optionIx}" 
                                    value="${optionIx}"
                                    onclick="updateAnswers(${questionIx}, '${question.type}', '${optionIx}')">
                                <label class="form-check-label" for="${question.id}-${optionIx}">&nbsp;&nbsp;&nbsp;${optionIx}.${marked.parse(line.replace(`${optionIx}.`, '')).replace('<p>', '').replace('</p>', '')}</label>
                            </div>`;
                        optionIx++;
                    } else {
                        instruction += marked.parse(line);
                    }
                });
                break;
        
            default:
                instruction = marked.parse(question.instruction);
                break;
        }
        questionId = setQuestionsIx ? questionIx + 1 : question.id;
        html += `
            <div id="${questionId}-card" class="card mt-4 mx-auto" style="width:98%">
                <div class="card-header text-muted" style="font-size:80%">
                    ${questionId}
                </div>
                <div class="card-body">
                    <div class="card-text">${instruction}</div>
                    ${questionHtmlCardAnswer(questionIx, question, showAnswer)}
                </div>
            </div>
        `;
        questionIx++;
    });
    return html;
}


// Returns html for question card > Answer
function questionHtmlCardAnswer(questionIx, question, showAnswer) {

    let html = '';
    let htmlAnswer = '';
    switch (question.type) {
        
        // True/False
        case 'V/F':
            if (showAnswer) {
                htmlAnswer = `
                    <div class="mt-3" style="font-size:90%">
                        <p style="margin-top:15px">
                            <button type="button" class="btn btn-link" title="Ver respuesta" onclick="toggleAnswer(${question.id})">Respuesta</button>
                            <span id="${question.id}-respuesta" class="d-none" style="margin-left:8px">${question.answer == 'V' ? 'Verdadero' : 'Falso'}</span>
                            <span id="${question.id}-respuesta-correccion" style="margin-right:5px"></span>
                    </div>  
                `;
            }
            html = `
                <div class="btn-group" role="group" style="margin-top:30px">
                    <div class="form-check form-check-inline">
                        <input 
                            class="form-check-input" 
                            type="radio" 
                            name="${question.id}-btn" 
                            id="${question.id}-verdadero" 
                            value="V"
                            onclick="updateAnswers(${questionIx}, '${question.type}', 'V')">
                        <label class="form-check-label" for="${question.id}-verdadero">Verdadero</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input 
                            class="form-check-input" 
                            type="radio" 
                            name="${question.id}-btn" 
                            id="${question.id}-false" 
                            value="F"
                            onclick="updateAnswers(${questionIx}, '${question.type}', 'F')">
                        <label class="form-check-label" for="${question.id}-falso">Falso</label>
                    </div>
                </div>
                ${htmlAnswer} 
            `;
            break;
        
        // Multiple options
        case 'OM':
            if (showAnswer) {
                htmlAnswer = `
                    <div class="mt-3" style="font-size:90%">
                        <p style="margin-top:15px">
                            <button type="button" class="btn btn-link" title="Ver respuesta" onclick="toggleAnswer(${question.id})">Respuesta</button>
                            <span id="${question.id}-respuesta" class="d-none" style="margin-left:8px">${question.answer}</span>
                            <span id="${question.id}-respuesta-correccion" style="margin-right:5px"></span>
                    </div>  
                `;
            }
            html += `${htmlAnswer}`;
            break;
    
        default:
            break;
    }

    return html;
}


// Toggles answer visibility
function toggleAnswer(questionId) {

    document.getElementById(`${questionId}-respuesta`).classList.toggle('d-none');
}


// Updates UI: exams view
function updateExamsView() {

    // Sets exam index
    examIx = 0;
    let iterate = true;
    while (iterate) {
        if (exams[examIx].id === examId) {
            iterate = false;
        } else {
            examIx++;
            if (examIx === exams.length) {
                iterate = false;
                examIx = undefined;
            }
        }
    }

    if (examIx !== undefined) {
        // Updates page title
        document.getElementById('page-title').innerHTML = `${PAGE_TITLE} - Exámenes `;
        document.getElementById('examenes-info').innerHTML = `<h6 style="margin-left:15px">Examen ${examId} - ${exams[examIx].name}</h6>`;

        // Populates answers list
        exams[examIx].questions.forEach(question => {
            exams[examIx].answers.push('');
        });
        

        // Updates question tab
        updateQuestionsTab();

        // Shows questions view
        document.getElementById('preguntas-contenido').classList.add('d-none');
        document.getElementById('preguntas-filtros').classList.add('d-none');
        document.getElementById('examenes').classList.remove('d-none');
        document.getElementById('examenes-info').classList.remove('d-none');
    }
}


// Updates UI: exams view > questions tab
function updateQuestionsTab() {

    document.getElementById('nav-tab-contents-examenes-preguntas').innerHTML = questionsCardsHtml(questions.filter(question => exams[examIx].questions.includes(question.id)), false, true);
}


// Updates answers lists
function updateAnswers(questionIx, questionType, answer) {
    
    let currentAnswer = exams[examIx].answers[questionIx];
    let currentAnswers = undefined;
    switch (questionType) {
        case 'V/F':
            exams[examIx].answers[questionIx] = answer;
            break;

        case 'OM':
            if (currentAnswer === '') {
                exams[examIx].answers[questionIx] = answer;
            } else {
                currentAnswers = currentAnswer.split('; ');
                currentAnswers.push(answer)
                currentAnswers.sort();
                exams[examIx].answers[questionIx] = currentAnswers.join('; ');
            }
            break;
    
        default:
            break;
    }
}


// Updates delivery data
function updateDeliveryData() {

    let endTIme = new Date();

    // Updates delivery data > delivery tab
    let html = `
        <p>UTN-FRH - Economía | Examen ${examId} - ${exams[examIx].name}</p>
        <p>Fecha: ${startTime.toISOString().substring(0, 10)}</p>
        <p>Inicio: ${startTime.toTimeString().substring(0, 8)}</p>
        <p>Fin: ${endTIme.toTimeString().substring(0, 8)}</p>
        <p id='datos-entrega-legajo'>Legajo: </p>
        <p>Respuestas: ${exams[examIx].answers.join(', ')}</p>
    `;
    document.getElementById('datos-entrega').innerHTML = html;

    // Updates delivery data variable and copy it to the clipboard
    deliveryData = `UTN-FRH - Economía | Examen ${examId} - ${exams[examIx].name}
Fecha: ${startTime.toISOString().substring(0, 10)}
Inicio: ${startTime.toTimeString().substring(0, 8)}
Fin: ${endTIme.toTimeString().substring(0, 8)}
Legajo: 
Respuestas: ${exams[examIx].answers.join(', ')}`;
    navigator.clipboard.writeText(deliveryData);
}


// Updates delivery info > student ID
function updateDeliveryId() {

    // Updates delivery tab
    document.getElementById('datos-entrega-legajo').innerHTML = `Legajo: ${document.getElementById('legajo-input').value}`;

    // Updates delivery data variable and copy it to the clipboard
    deliveryData = deliveryData.replace(/Legajo: [0-9]*/, `Legajo: ${document.getElementById('legajo-input').value}`);
    navigator.clipboard.writeText(deliveryData);

}

/**************************************************************************************************************************************************
/* Other functions 
/**************************************************************************************************************************************************/

