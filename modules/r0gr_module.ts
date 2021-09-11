// Incomming data Schema
interface RadarInterface {
    protocols: string[];
    scan: object[];
}

// R0GR_Module Schema 
interface R0GR_Interface {
    modes: string[];
    protocols: string[];
    objective: object;
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
    objective = {};
    attack_allowed = false;
    target = [];
    scan = [];

    constructor(radar: RadarInterface) {

        // get unordered protocols
        // (without priority recognition)
        this.set_protocols(radar.protocols);

        // get scanner data to be analized
        // (raw enemies data)
        this.set_scan(radar.scan);

        // start module
        // (
        // priority filter | (defined in "modes")
        // priorities iteration |
        // dispatch attack
        // )
        this.scanner();

        // attack warranty for single protocols
        // (attacks not based in enemy distance)
        this.trigger_safety();
        
        // clean sockets after attack
        // (target & scan)
        this.helper_cleanner();
    }


    /** Core Functionality
     *
     * - scanner(): void
     * - dispacher(index): void
     * - assist_allies( scans ): void
     * - avoid_crossfire( scans ): void
     * - avoid_mech( scans ): void
     * - prioritize_mech( scans ): void
     * - distance_calculator( scans, flagged ): void
     * - trigger_safety(): void
     *
     */

    scanner(): void {
        // get protocols to recognition
        const protocols = this.get_protocols();
        
        // filter protocols against modes
        this.get_modes().forEach((order, index) => {
            protocols.forEach((prot, id) => {
                if (prot === order) this.dispacher(index);
            });
        });
    }

    dispacher(index): void {
        // get scan data for target filtering
        const scan = this.get_scan();

        // attacks based in "modes" "index" "order" (protocol)
        switch (index) {
            case 0:
                this.assist_allies( scan );
                // this.set_priorities( order );
                break;
            case 1:
                this.avoid_crossfire( scan );
                // this.set_priorities( order );
                break;
            case 2:
                this.avoid_mech( scan );
                // this.set_priorities( order );
                break;
            case 3:
                this.prioritize_mech( scan );
                // this.set_priorities( order );
                break;
            case 4:
                this.distance_calculator( scan , false );
                // this.set_priorities( order );
                break;
            case 5:
                this.distance_calculator( scan , true );
                // this.set_priorities( order );
                break;
            default:
                false;
        }
    }

    assist_allies( scans ): void {

        /* Assist Allies
         * "Deberan de priorizarse los puntos en los que exista algún aliado."
         * It must be prioritized data where Allies were located.
         *
        //  *.*.*.*.*.*.*.*.*.*.*.*.*.*.* 
         *
         * "assist_allies" always received no targets previously selected
         * It'll always deal based in scan data
         * 
        */

        // Get updated data based in the presence or not 
        // of previous targets selected
        // const scan = this.helper_update_scan( scans );

        // include in target from scan data
        // only targets where Allies were located 
        scans.forEach((item) => {
            const situation = Object.keys(item);
            if (situation.includes("allies")) this.get_target().push(item);
        });
    }

    avoid_crossfire( scans ): void {

        /* Avoid Crossfire
         * "No debe de atacarse ningún punto en el que haya algún aliado."
         * It must be prioritized data where Allies were not located.
         *
        //  *.*.*.*.*.*.*.*.*.*.*.*.*.*.* 
         *
         * "avoid_crossfire" always received no targets previously selected
         * It'll always deal based in scan data
         * 
        */

        // Get updated data based in the presence or not 
        // of previous targets selected
        // const scan = this.helper_update_scan( scans );

        // include in target from scan data
        // only targets where Allies were not located 
        scans.forEach((item) => {
            const situation = Object.keys(item);
            if (!situation.includes("allies")) this.get_target().push(item);
        });
    }

    avoid_mech( scans ): void {

        /* Avoid Mechanized Enemies
         * "No debe de atacarse ningún enemigo del tipo mech."
         * It must be prioritized data where Mech were not located.
         * 
        */

        // Get updated data based in the presence or not 
        // of previous targets selected
        const scan = this.helper_update_scan( scans );
        

        let targets = scan.filter((item) => item['enemies'].type !== "mech");
        this.set_target( targets );
    }

    prioritize_mech( scans ): void {

        /* Prioritize Mechanized Enemies
         * "Debe de atacarse un mech si se encuentra. En caso negativo, 
         *  cualquier otro tipo deobjetivo será válido."
         * It must be prioritized data where Mech were located.
         * 
        */

        // Get updated data based in the presence or not 
        // of previous targets selected
        const scan = this.helper_update_scan( scans );

        let targets = scan.filter((item) => item['enemies'].type !== "soldier");
        this.set_target( targets )
    }

    distance_calculator( scans, flagged ): void {
        /** Attack Based in Enemy Distance
         *  closest-enemies : Prioritize closest enemies.
         *  furthest-enemies : Prioritize furthest enemies.
         *
         *  Distance Calculator : boolean value
         *  Flag to select closest of furthest enemies

         *  flagged - true : closest-enemies
         *  flagged - false : furthest-enemies
         *  
         *  If distance_calculator() is used, "attack_allowed" flag
         *  It'll set to "true"
         *
         *  If distance_calculator() is not used Attack Not Based in Enemy Distance
         *  is assumpted "to be over the first enemy in the scan data".
         */

        // Get updated data based in the presence or not 
        // of previous targets selected
        const scan = this.helper_update_scan( scans, flagged );

        // sort scan data based in distace sized in klicks (1 = 1km)
        const sort = this.helper_klicker_filter(scan);
        
        // get the position of the enemy based in distances
        const index = this.helper_sort_longitudes( sort, flagged )
        const enemy = scan[index];
        this.set_objective(enemy['coordinates']);
        

        // "attack_allowed" flag to "true"
        this.set_attack_allowed( true );
    }

    trigger_safety(): void {
        /** Attack Not Based in Enemy Distance
         *  simple attack : allow attacks without enemies references
         *  If distance_calculator() is not used "discrete" attack is assumpted
         *  the assumption is that "if closest nor furthest enemy is preferred
         *  the attack is selected over the closest enemy according to the constraints".
         *
         *  The attack requires the flag "attack_allowed" to be "false".
         *  distance_calculator() will set "attack_allowed" flag to be "true"
         *  if It's used.
         */

        if (!this.attack_allowed) {
            const enemy = this.get_target();

            const sort = this.helper_klicker_filter( enemy );
            const index = this.helper_sort_longitudes( sort, true )

            const item = enemy[index];
            this.set_objective(item['coordinates']);
        }
        else;
    }


    /** Helper Tools
     *
     * - helper_klicker_filter( scan ): Array<number>
     * - helper_klicker(item): number
     * - helper_cleanner(): void
     * - helper_update_scan( scan, update = false ): object[]
     * - helper_sort_longitudes( arr, flagged ): number
     *
     */

    helper_klicker_filter( scan ): Array<number> {
        /** Tool Klicker Filte : Sort Distances
         *  Simple method to get closest (min) and furthest (max)
         *  distances.
         *  The Reference Problem:
         *  It's needed to find the owner of the closest or furthest
         *  distance, an ordered array it's not enough.
         *  The Solution: An array of arrays. 
         *  - First position ( 0 ) : location of the item in their own list
         *  - Second position ( 1 ) : distance in klicks (1 = 1km)
         *
         *  About the distance in klics:
         *  - First constraint : attack range from 0 to 100.
         *  - Second constraint : closest / furthest needs a comparison.
         *
         *  Distance needs to be filtered to be compared two times:
         *  - It must not be grather than 100.
         *  - It must be compared by itself to get the closest / furthest.
         */

        // array of distances: general purpose
        let distance = [];

        // Iteration over scan data to convert coordinates in distance (1 = 1)
        scan.forEach((item, index) => {
            const klicks = this.helper_klicker(item.coordinates);
            if (klicks < 100) distance.push([index, klicks]);
        });

        // distance array it's sorted to positioning
        // closest first and furthest last.
        return distance.sort((key, klicks) => {
            return key[1] - klicks[1];
        });
    }

    helper_klicker(item): number {
        /** Tool Klicker : Distance Formula for Coordinates
         *  If we cross y axis with x axis we get a point.
         *  That point is the enemy location but...
         *  How we know the closest of furthest?
         *
         *  An extra reference is needed.
         *  This tool is based in the "Goniometric Circumference".
         *  Then, any distance will be located into a quadrant and
         *  It will draw a "triangle rectangle".
         *  The distance will be the hypotenuse,
         *  the formula will be let by Pythagoras : a^2 + b^2 = c^3
         *  c = hypotenuse, where their ^2 is the square root of (a^2 + b^2)
         */
        return Math.sqrt(Math.pow(item.y, 2) + Math.pow(item.x, 2));
    }

    helper_cleanner(): void {
        // Tool Cleanner
        // remove scan & target data to avoid data colition
        this.scan = [];
        this.target = [];
    }

    helper_update_scan( scan, update = false ): object[] {
        
        if (this.get_target().length <= 0) {
            scan = this.get_scan();
            if ( update ) this.set_target( this.set_scan( scan ) );
        } else {
            scan = this.get_target();
        }
        
        return scan;
    }

    helper_sort_longitudes( arr, flagged ): number {

        // flagged : closets or further decisor
        let index;
        if ( flagged ) index = arr[0][0];
        else index = arr[arr.length - 1][0];

        return index
    }


    /** Getters & Setters
     *
     * - get_protocols(): string[]
     * - set_protocols( newprotocols ): void
     *
     * - get_modes(): string[]
     * - set_modes( newmodes ): void
     *
     * - get_target(): object[]
     * - set_target( newtarget ): void
     *
     * - get_scan(): object[]
     * - set_scan( newscan ): void
     *
     * - get_attack_allowed(): boolean
     * - set_attack_allowed( newattack_allowed ): void
     *
     * - get_objective(): object
     * - set_objective( newobjective ): void
     *
     */
    
    get_protocols(): string[] {
        return this.protocols;
    }
    set_protocols( newprotocols ): void {
        this.protocols = newprotocols;
    }
    
    get_modes(): string[] {
        return this.modes;
    }
    set_modes( newmodes ): void {
        this.modes = newmodes;
    }
    
    get_target(): object[] {
        return this.target;
    }
    set_target( newtarget ): void {
        this.target = newtarget;
    }
    
    get_scan(): object[] {
        return this.scan;
    }
    set_scan( newscan ): void {
        this.scan = newscan;
    }
    
    get_attack_allowed(): boolean {
        return this.attack_allowed;
    }
    set_attack_allowed( newattack_allowed ): void {
        this.attack_allowed = newattack_allowed;
    }
    
    get_objective(): object {
        return this.objective;
    }
    set_objective( newobjective ): void {
        this.objective = newobjective;
    }

} // end of class

export default R0GR_Module