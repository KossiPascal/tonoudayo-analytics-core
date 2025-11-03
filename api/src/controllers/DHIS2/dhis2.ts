import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
import https from 'https';
import { APP_ENV } from "../../providers/constantes";
import { DataIndicators } from "../../entities/Dhis2";
import { httpHeaders, logNginx, notEmpty } from "../../functions/functions";

const fetch = require('node-fetch');
const request = require('request');



const { DHIS_HOST, CHT_PROD_HOST, CHT_DEV_HOST } = APP_ENV;


export async function insertOrUpdateDataToDhis2(req: Request, res: Response, next: NextFunction) {
    const { dhisusername, dhispassword, chwsDataToDhis2 } = req.body;
    const chwsData = chwsDataToDhis2 as DataIndicators;

    try {
        if (notEmpty(chwsData)) {
            var jsonData = matchDhis2Data(chwsData);
            const enable_strict_SSL_checking = false;
            
            const headers = httpHeaders(dhisusername, dhispassword);

            await request({
                url: jsonData.requestLink,
                method: 'GET',
                headers: headers,
                strictSSL: enable_strict_SSL_checking,
            }, async function (err: any, response1: any, body: any) {
                if (err) return res.status(201).json({ status: 201, data: err.toString(), chw: jsonData.chw });
                try {
                    const jsonBody = JSON.parse(body);
                    if (jsonBody && jsonBody.hasOwnProperty('events')) {
                        var reqData: any[] = jsonBody["events"];
                        const dataId = reqData.length == 1 ? reqData[0].event : ''

                        await request({
                            url: reqData.length == 1 ? `${jsonData.baseLink}/${dataId}` : jsonData.baseLink,
                            cache: 'no-cache',
                            mode: "cors",
                            credentials: "include",
                            referrerPolicy: 'no-referrer',
                            method: reqData.length == 1 ? 'PUT' : 'POST',
                            body: JSON.stringify(jsonData.data),
                            headers: headers,
                            strictSSL: enable_strict_SSL_checking,
                        }, async function (err: any, response2: any, body: any) {
                            if (err) return res.status(201).json({ status: 201, data: err.toString(), chw: jsonData.chw });
                            if (response2.statusCode != 200) return res.status(201).json({ status: 201, data: `Error Found, retry!`, chw: jsonData.chw })
                            return res.status(200).json({ status: 200, data: reqData.length == 1 ? `Updated` : `Created` })
                        });

                    } else {
                        return res.status(201).json({ status: 201, data: 'Connection Error! Retry', chw: jsonData.chw });
                    }
                } catch (error) {
                    logNginx(error)
                }
            });
        } else {
            return res.status(201).json({ status: 201, data: 'No Data Available!', chw: '' });
        }
    } catch (err: any) {
        console.log(err);
        return res.status(201).json({ status: 201, data: err.toString(), chw: '' });
    }
}





export function matchDhis2Data(datas: DataIndicators) {

    const pageSize = 1000000;
  
    const program = "aaw8nwnmmcC";
    const chw = datas.code_asc;
    const data_filter = `JC752xYegbJ:EQ:${datas.district},JkMyqI3e6or:like:${chw},lbHrQBTbY1d:EQ:${datas.reported_date},FW6z2Ha2GNr:like:${datas.data_source}`;
    const fields = `event,eventDate,dataValues[dataElement, value]`;
  
    const baseLink = `https://${DHIS_HOST}/api/events`;
    const requestLink = `${baseLink}.json?paging=false&pageSize=${pageSize}&program=${program}&orgUnit=${datas.orgUnit}&filter=${data_filter}&fields=${fields}&order=created:desc`;
  
    var dataValues = [
      {
        "dataElement": "FW6z2Ha2GNr",  // source de données
        "value": datas.data_source,
      },
      {
        "dataElement": "lbHrQBTbY1d",  // report_date
        "value": datas.reported_date,
      },
      {
        "dataElement": "JkMyqI3e6or",  // list des ASC
        "value": datas.code_asc,
      },
      {
        "dataElement": "JC752xYegbJ",  // admin_org_unit_district
        "value": datas.district,
      },
      {
        "dataElement": "lvW5Kj1cisa", // "Nombre d'enfant 0 à 5 ans pris en charge à domicile
        "value": datas.sum_soins_suivi.tonoudayo,
      },
      {
        "dataElement": "M6WRPsREqsZ",  // "Total Vad PCIME Suivi
        "value": datas.suivi_pcime.tonoudayo,
      },
      {
        "dataElement": "oeDKJi4BICh",  // total_vad
        "value": datas.total_vad.tonoudayo,
      },
      {
        "dataElement": "PrN89trdUGm", // "Nombre de femme enceinte nouveau cas
        "value": datas.femmes_enceintes_NC.tonoudayo,
      },
      {
        "dataElement": "wdg7jjP9ZRg", // "Nombre de femmes référée pour plannification familiale
        "value": datas.reference_pf.tonoudayo,
      },
      {
        "dataElement": "qNxNXSwDAaI", // "promptitude diarrhée 24h
        "value": datas.prompt_pcime_diarrhee_24h.tonoudayo,
      },
      {
        "dataElement": "S1zPDVOIVLZ",  // "promptitude diarrhee 48h
        "value": datas.prompt_pcime_diarrhee_48h.tonoudayo,
      },
      {
        "dataElement": "nW3O5ULr75J", // "promptitude diarrhée 72h
        "value": datas.prompt_pcime_diarrhee_72h.tonoudayo,
      },
      {
        "dataElement": "NUpARMZ383s", // "promptitude paludisme 24h
        "value": datas.prompt_pcime_paludisme_24h.tonoudayo,
      },
      {
        "dataElement": "yQa48SF9bua", // "promptitude paludisme 48h
        "value": datas.prompt_pcime_paludisme_48h.tonoudayo,
      },
      {
        "dataElement": "NzKjJuAniNx", // "promptitude paludisme 72h
        "value": datas.prompt_pcime_paludisme_72h.tonoudayo,
      },
      {
        "dataElement": "AA2We0Ao5sv", // "promptitude pneumonie 24h
        "value": datas.prompt_pcime_pneumonie_24h.tonoudayo,
      },
      {
        "dataElement": "PYwikai4k2J", // "promptitude pneumonie 48h
        "value": datas.prompt_pcime_pneumonie_48h.tonoudayo,
      },
      {
        "dataElement": "rgjFO0bDVUL", // "promptitude pneumonie 72h
        "value": datas.prompt_pcime_pneumonie_72h.tonoudayo,
      },
      {
        "dataElement": "WR9u3cGJn9W", // "total consultation femme enceinte
        "value": datas.femmes_enceinte.tonoudayo,
      },
      {
        "dataElement": "Pl6qRNgjd3a", // "total de femmes référées par les asc
        "value": datas.reference_femmes_enceinte_postpartum.tonoudayo,
      },
      {
        "dataElement": "DicYcTqr9xT", // "Total de référence pcime
        "value": datas.reference_pcime.tonoudayo,
      },
      {
        "dataElement": "caef2rf638P", // "total diarrhee pcime
        "value": datas.diarrhee_pcime.tonoudayo,
      },
      {
        "dataElement": "Q0BQtUdJOCy", // "Total femmes en postpartum
        "value": datas.femmes_postpartum.tonoudayo,
      },
      {
        "dataElement": "dLYksBMOqST", // "total malnutrition pcime
        "value": datas.malnutrition_pcime.tonoudayo,
      },
      {
        "dataElement": "jp2i3vN3VJk", // "total paludisme pcime
        "value": datas.paludisme_pcime.tonoudayo,
      },
      {
        "dataElement": "LZ3R8fj9CGG", // "total pneumonie pcime
        "value": datas.pneumonie_pcime.tonoudayo,
      },
      {
        "dataElement": "O9EZVn3C3pF", // "Total postpartum nouveau cas
        "value": datas.femme_postpartum_NC.tonoudayo,
      },
      {
        "dataElement": "lsBS60uQPtc", // "Total recherche active
        "value": datas.home_visit.tonoudayo,
      },
      {
        "dataElement": "lopdYxQrgyj", // "Total test de grossesse administrée
        "value": datas.test_de_grossesse.tonoudayo,
      },
      {
        "dataElement": "AzwUzgh0nd7",  // "Total Vad Pf
        "value": datas.pf.tonoudayo,
      }
    ]
  
    return {
        chw,
      baseLink,
      requestLink,
      data: {
        "program": program,
        "orgUnit": datas.orgUnit,  // "PgoyKuRs20z",
        "eventDate": datas.reported_date + "T00:00:00.000",  // "2021-05-07T00:00:00.000",
        "status": "COMPLETED",
        "completedDate": datas.reported_date + "T00:00:00.000",  // "2021-05-07T00:00:00.000",
        "dataValues": dataValues
      }
    };
  }
  