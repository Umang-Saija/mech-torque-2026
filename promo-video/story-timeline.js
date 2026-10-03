/* Timeline for the story film (story.html + story-score.js). Seconds. */
(function (root) {
    const T = {
        DURATION: 52.5,
        FPS: 24,
        /* ACT I: night shift, the struggle */
        coldOpen: [0, 2.4],
        push1: [1.8, 3.9], slip1: [4.15, 4.45],
        walkB: [4.6, 6.0],
        push2: [6.2, 9.1], slip2: [9.6, 9.85],
        defeat: [10.1, 11.6],
        /* ACT II: the call */
        call: [11.6, 15.2], ring: [11.9, 13.0], connect: 13.05,
        wipe1: [14.55, 15.35],
        /* ACT III: engineered (studio) */
        blueprint: [15.0, 18.0],
        scan: [17.5, 20.0],
        assembly: [20.2, 30.7], partStep: 1.5, partMove: .8,
        nameplate: [30.7, 33.0], wheelIn: [31.7, 32.7],
        /* ACT IV: morning, the install */
        install: [33.0, 37.2], drop: [33.3, 35.7],
        /* ACT V: life is easy */
        easy: [37.2, 45.2], walkA: [37.3, 38.3], grip: [38.3, 38.6], open: [38.7, 43.0], release: [43.2, 43.6],
        resolve: [45.2, 47.6], bump: 46.25,
        end: [47.6, 52.5]
    };
    T.partTimes = Array.from({ length: 7 }, (_, i) => T.assembly[0] + i * T.partStep);
    T.partLocks = T.partTimes.map(t => t + T.partMove);
    T.factory = t => t < T.blueprint[0] + .35 || t >= T.install[0];
    if (typeof module !== 'undefined') module.exports = T; else root.TL = T;
})(this);
