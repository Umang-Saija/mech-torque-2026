/* Shared timeline for the picture (reel.html) and the score (score.js).
   All times in seconds. Change a beat here and both picture and sound move with it. */
(function (root) {
    const T = {
        DURATION: 48,
        FPS: 30,

        /* acts */
        hookEnd: 4.0,          // S1  protractor hook: "a quarter turn"
        wipe1: [3.55, 4.45],   //     quarter-turn wipe into the blueprint
        blueprint: [4.0, 8.4], // S2  "It starts as a line."
        scan: [8.0, 10.6],     // S3  laser scan: drawing becomes iron
        assembly: [11.0, 23.6],// S4  anatomy, seven parts lock in
        partStep: 1.8,         //     one part every 1.8 s
        partMove: 0.95,        //     travel time inside each step
        nameplate: [23.6, 27.0],// S5 macro on the data plate
        mount: [27.0, 31.0],   // S6  handwheel, tilt, drop onto valve
        wheelIn: [27.1, 28.4],
        tilt: [28.7, 30.2],    //     valve lands at tilt[1]
        turn: [31.0, 38.0],    // S7  the turn
        open: [32.0, 35.4],    //     disc 0 -> 90 degrees
        hold: [35.6, 38.0],    //     "Let go. It holds."
        wipe2: [37.7, 38.6],   //     quarter-turn wipe into range
        range: [38.0, 43.2],   // S8  MT-20 ... MT-60
        end: [43.2, 48.0]      // S9  logo + contact
    };
    T.partTimes = Array.from({ length: 7 }, (_, i) => T.assembly[0] + i * T.partStep);
    T.partLocks = T.partTimes.map(t => t + T.partMove);
    if (typeof module !== 'undefined') module.exports = T; else root.TL = T;
})(this);
