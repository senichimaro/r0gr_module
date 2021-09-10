import r0gr_module from '../r0gr_module'

export async function first(req,res){
    res.status(200).send({"success":true, "data":"Radar Activated"})
}

export async function radar_sensor(req,res){
    const radar_warfare = req.body;
    const r0gr_response = new r0gr_module( radar_warfare )
    res.status(200).send(r0gr_response.objective)
}