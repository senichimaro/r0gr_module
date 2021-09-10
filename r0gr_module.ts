interface RadarInterface {
    protocols: string[];
    scan: object[];
}

interface R0GR_Interface {
    modes: string[];
    protocols: string[];
    priorities: string[];
    objective: object;
    longitude: number;
    attack_allowed: boolean;
    target: object[];
    scan: object[];
}


class R0GR_Module implements R0GR_Interface {

    modes = [
        "assist-allies",
        "avoid-crossfire",
        "avoid-mech",
        "prioritize-mech",
        "furthest-enemies",
        "closest-enemies"
    ];
    protocols = [];
    priorities = [];
    objective = {};
    longitude = 0;
    attack_allowed = false;
    target = [];
    scan = [];

    constructor(radar: RadarInterface) {
        this.protocols = radar.protocols;
        this.scan = radar.scan;
        this.scanner(this.protocols, this.scan);
        this.trigger_safety();
        this.helper_cleanner_team();
    }

    scanner(protocols, scan): void {
        this.modes.forEach((order, index) => {
            protocols.forEach((prot, id) => {
                if (prot === order) this.dispacher(index, order);
            });
        });
    }

    dispacher(index, order): void {
        switch (index) {
            case 0:
                this.assist_allies(this.scan);
                this.priorities.push(order);
                break;
            case 1:
                this.avoid_crossfire(this.scan);
                this.priorities.push(order);
                break;
            case 2:
                this.avoid_mech(this.scan);
                this.priorities.push(order);
                break;
            case 3:
                this.prioritize_mech(this.scan);
                this.priorities.push(order);
                break;
            case 4:
                this.distance_calculator(this.scan, false);
                this.priorities.push(order);
                break;
            case 5:
                this.distance_calculator(this.scan, true);
                this.priorities.push(order);
                break;
            default:
                false;
        }
    }

    assist_allies(scan): void {
        if (this.target.length <= 0) scan = this.scan;
        else scan = this.target;

        scan.forEach((item) => {
            const situation = Object.keys(item);
            if (situation.includes("allies")) this.target.push(item);
        });
    }

    avoid_crossfire(scan): void {
        if (this.target.length <= 0) scan = this.scan;
        else scan = this.target;

        scan.forEach((item) => {
            const situation = Object.keys(item);
            if (!situation.includes("allies")) this.target.push(item);
        });
    }

    avoid_mech(scan): void {
        if (this.target.length <= 0) scan = this.scan;
        else scan = this.target;

        let targets = scan.filter((item) => item.enemies.type !== "mech");
        this.target = targets;
    }

    prioritize_mech(scan): void {
        if (this.target.length <= 0) scan = this.scan;
        else scan = this.target;

        let targets = scan.filter((item) => item.enemies.type !== "soldier");
        this.target = targets;
    }

    distance_calculator(scan, chief): void {
        if (this.target.length <= 0) {
            scan = this.scan;
            this.target = this.scan;
        } else {
            scan = this.target;
        }

        let sort = this.helper_klicker_filter(scan);

        let index;
        if (chief) index = sort[0][0];
        else index = sort[sort.length - 1][0];
        let enemy = scan[index];
        this.objective = enemy.coordinates;

        let longitude;
        if (chief) longitude = sort[0][1];
        else longitude = sort[sort.length - 1][1];
        this.longitude = longitude;

        // allow attack
        this.attack_allowed = true;
    }

    trigger_safety(): void {
        if (!this.attack_allowed) {
            const enemy = this.target;
            const longitude = this.helper_klicker_filter(enemy);
            this.longitude = longitude[0][1];
            const index = longitude[0][0];
            const item = enemy[index];
            this.objective = enemy[index]['coordinates'];

            // allow attack
            this.attack_allowed = true;
        }
        else;
    }

    helper_klicker_filter(scan): Array<number> {
        let distance = [];

        scan.forEach((item, index) => {
            const klicks = this.helper_klicker(item.coordinates);
            if (klicks < 100) distance.push([index, klicks]);
        });

        return distance.sort((key, klicks) => {
            return key[1] - klicks[1];
        });
    }

    helper_klicker(item): number {
        return Math.sqrt(Math.pow(item.y, 2) + Math.pow(item.x, 2));
    }

    helper_cleanner_team(): void {
        this.helper_clean_scanner();
        this.helper_clean_target();
    }

    helper_clean_scanner(): void {
        this.scan = [];
    }

    helper_clean_target(): void {
        this.target = [];
    }

} // end of class

export default R0GR_Module