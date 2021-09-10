import r0gr_module from '../r0gr_module'

export async function getIndex(req,res){
    try{
        res.status(200).send({"success":true, "data":"Radar Activated"})
    }
    catch(e){
        throw new Error(e.message);
    }
}

export async function radar_sensor(req,res){
    try {
        const radar_warfare = req.body;        
        const r0gr_response = new r0gr_module( radar_warfare )
        res.status(200).send(r0gr_response.objective)
    }
    catch(e){
        throw new Error(`|>|>|${e.message}`);
        
    }
}