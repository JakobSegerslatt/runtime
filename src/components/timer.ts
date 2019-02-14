
export class Timer {
    timer;

    total_ticks!: number;

    start_time!: number;
    current_time!: number;

    duration!: number;

    constructor(callback: any, duration: number = 1000) {
        this.total_ticks = 0;
        this.start_time = Date.now();
        this.duration = duration;
        this.run(callback);
    };

    run(callback = () => { }) {
        this.current_time = Date.now();
        if (!this.start_time) {
            this.start_time = this.current_time;
        }

        callback();

        /** 
         * Calculate how many ms to wait before calling this function again
         * E.g. take the duration provided (default: 1000) minus the difference
         * Difference is calulated by taking the amount of time that should have passed,
         * e.g. total ticks * duration, plus the starttime (to recive were we should be now)
         */
        var nextTick = this.duration - (this.current_time - (this.start_time + (this.total_ticks * this.duration)));
        this.total_ticks++;

        this.timer = setTimeout(() => {
            this.run(callback);
        }, nextTick);
    }

    stop() {
        clearTimeout(this.timer);
    }
}
