/* CS 61A Fa18 Grade Calculation Script */
/* Run in JS console at https://okpy.org/cal/cs61a/fa18 */
GRADES = ['F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
BUCKETS = [0, 160, 165, 170, 175, 185, 195, 205, 225, 250, 270, 285, 300];

N_LABS = 13 // labs 0-13, minus 3
N_DISCS = 12
N_CHECKOFFS = 8

PARTICIPATION_TOTAL = 35
PARTICIPATION_EXTRAS = PARTICIPATION_TOTAL - (N_LABS + N_DISCS + N_CHECKOFFS)
PARTICIPATION_POINTS = 10
PARTICIPATION_RECOVERY = 20

N_HWS = 12
MT1_MAX = 40
MT2_MAX = 50
FINAL_MAX = 75
PROJECT_TOTAL = 100
HW_POINTS = 25

FINAL_RECOVERY = false // no recovery on the final exam

function setupLog() {
    var el = document.querySelector('#log');
    if (!el) {
        el = document.createElement('pre');
        el.id = 'log';
        el.style.position = 'fixed';
        el.style.top = '0';
        el.style.left = '0';
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.background = 'black';
        el.style.color = '#0f0';
        el.style.zIndex = '100000';
        document.body.append(el);
        el.addEventListener("click", function() {
            el.id = 'dead';
            el.style.display = 'none';
        });
    }
}

function log() {
    document.querySelector('#log').innerHTML += [].slice.call(arguments).join('') + '\n';
}

function s(assign, type) {
    if (!scores[assign]) return 0;
    type = type || 'total';
    var result = scores[assign][type] || 0;
    if (type === 'total') {
        return Math.max(result, scores[assign].regrade || 0);
    } else if (type === 'composition') {
        return Math.max(result, scores[assign].revision || 0);
    }
    return result;
}

function hw(num) {
    var assign = num < 10 ? 'hw0' + num : 'hw' + num;
    return Math.max(s(assign), s(assign, 'effort'));
}

function lab(num) {
    var assign = num < 10 ? 'lab0' + num : 'lab' + num;
    return s(assign);
}

function labcheckoff(num) {
    var assign = 'labcheckoff' + num;
    return s(assign);
}

function disc(num) {
    return s('disc' + num) || s('disc0' + num) || s('discussion' + num);
}

function recovery(examScore, maxExam, recoveryCredits) {
    var maxRecovery = Math.max(0, (maxExam / 2.0 - examScore) / 2.0);
    return maxRecovery * (recoveryCredits / PARTICIPATION_RECOVERY);
}

function logExam(name, score, recovery, maxScore) {
    var incl = '';
    if (recovery > 0) {
        incl = ' (including ' + recovery + ' recovery)';
    }
    log(name + ': ' + score + '/' + maxScore + incl);
}

function gradeFor(total) {
    for (var i = BUCKETS.length - 1; i >= 0; i--) {
        if (total >= BUCKETS[i]) return GRADES[i];
    }
}

function logPointsNeeded(total, grade, before, recoveryCredits, finalPoints) {
    var start = GRADES.indexOf(grade);
    for (var i = start + 1; i < BUCKETS.length; i++) {
        if (BUCKETS[i] - before > finalPoints) return;
        var needed = BUCKETS[i] - before;
        log('You need ', needed, ' on the final for a ', GRADES[i], '.');
    }
}

function calculateGrades() {

    var labs = 0;
    for (var i = 0; i <= N_LABS; i++) {
        labs += lab(i);
    }

    var discs = 0;
    for (var i = 1; i <= N_DISCS; i++) {
        discs += disc(i);
    }

    var hws = 0;
    for (var i = 1; i <= N_HWS; i++) {
        hws += hw(i);
    }

    var checkins = 0;
    for (var i = 1; i <= N_CHECKOFFS; i++) {
        checkins += labcheckoff(i);
    }

    var hog = s('proj01') + s('proj01', 'composition') + s('hogcheckpoint');
    var maps = s('proj02') + s('proj02', 'composition');
    var ants = s('proj03') + s('proj03', 'composition') + s('antscheckpoint');
    var scheme = Math.max(s('proj04') + s('schemecheckpoint1') + s('schemecheckpoint2'), s('proj04stubbed'));
    console.log(scheme);

    var projects = hog + maps + ants + scheme;

    var partCredits = labs + discs + checkins + PARTICIPATION_EXTRAS;

    var partPoints = Math.min(PARTICIPATION_POINTS, partCredits);

    var recoveryCredits = Math.min(partCredits, PARTICIPATION_POINTS + PARTICIPATION_RECOVERY) - partPoints;

    var mt1recovery = recovery(s('midterm1'), MT1_MAX, recoveryCredits);
    var mt2recovery = recovery(s('midterm2'), MT2_MAX, recoveryCredits);
    var finalrecovery = 0;
    if (FINAL_RECOVERY) {
        finalrecovery = recovery(s('final'), FINAL_MAX, recoveryCredits);
    }

    var midterm1 = s('midterm1') + mt1recovery;
    var midterm1extra = s('midterm1extra');
    var midterm2 = s('midterm2') + mt2recovery;
    var final = s('final') + finalrecovery;

    var contests = s('proj01contest') + s('scheme_contest');

    var total = projects + hws + partPoints + midterm1 + midterm1extra + midterm2 + final + contests;

    var grade = gradeFor(total);
    setupLog();
    var nameEl = document.querySelector('.user-name') || document.querySelector('.widget-user-username');
    var student = nameEl.innerHTML.trim();

    log('<strong>CS 61A Fa18 Score Report for ', student, '</strong>');
    log('=========================================================================');
    log();
    log('<strong>Participation</strong>');
    log('-------------------------------------------------------------------------');
    log('Discussion: ', discs, '/' + N_DISCS);
    log('Labs: ', labs, '/' + N_LABS);
    log('Checkoffs: ', checkins, '/' + N_CHECKOFFS);
    log('Free credits: ', PARTICIPATION_EXTRAS + "/" + PARTICIPATION_EXTRAS);
    log('You earned ', partCredits, ' participation credits.');
    log('This counts for ', partPoints, '/' + PARTICIPATION_POINTS + ' points with ', recoveryCredits,
        '/' + PARTICIPATION_RECOVERY + ' for exam recovery.');
    log();
    log();
    log('<strong>Points Earned</strong>');
    log('-------------------------------------------------------------------------');
    log('Projects: ', projects, '/' + PROJECT_TOTAL);
    log('Homeworks: ', hws, '/' + HW_POINTS);
    log('Participation: ', partPoints, '/' + PARTICIPATION_POINTS);
    logExam('Midterm 1', midterm1, mt1recovery, MT1_MAX);
    logExam('Midterm 2', midterm2, mt2recovery, MT2_MAX);
    logExam('Final Exam', final, finalrecovery, FINAL_MAX);
    if (contests > 0) log('Contests: ', contests, ' (EC)');
    if (midterm1extra > 0) log('Midterm 1 Extra: ', midterm1extra, ' (EC)')
    log();
    log('<strong>Total Score in the Class: ', total, '</strong>');
    log();
    log();

    if (scheme > 0) {
        log('<strong>Predicted Grade</strong>');
        log('-------------------------------------------------------------------------');
        if (s('final') === 0) {
            log('If you skip the final, your points will result in a <strong>', grade, '</strong>');
            logPointsNeeded(total, grade, total - final, recoveryCredits, FINAL_MAX);
        } else {
            log('Your expected grade based on ', total, ' points is a <strong>', grade, '</strong>');
        }
        log();
        log();
    }

    log('<strong>Disclaimer</strong>')
    log('-------------------------------------------------------------------------');
    log('This calculator is only for your reference.');
    log('It does not apply if you missed a midterm.');
    log('The output here may have bugs, and does not guarantee a particular grade.');
    log();
    log();

    if (scheme > 0) {
        log('<strong>Grading Bins</strong>');
        log('-------------------------------------------------------------------------');
        for (var i = BUCKETS.length - 1; i > 0; i -= 3) {
            var line = GRADES[i] + ' ≥ ' + BUCKETS[i] + ' '.repeat(12);
            line += GRADES[i - 1] + ' ≥ ' + BUCKETS[i - 1] + ' '.repeat(12);
            line += GRADES[i - 2] + ' ≥ ' + BUCKETS[i - 2];
            log(line);
        }
        log();
        log();
    }

    log('<strong>Click anywhere to close.</strong>');
}
calculateGrades();
