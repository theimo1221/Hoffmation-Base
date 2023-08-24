import ReadKeyList from './ReadKeyList';

export default {
  BetriebsDatenDachs: [
    ReadKeyList.Hka_Bd.Anforderung.ModulAnzahl.key,
    ReadKeyList.Hka_Bd.Anforderung.UStromF_Anf.bFlagSF.key,
    ReadKeyList.Hka_Bd.UStromF_Frei.bFreigabe.key,
    ReadKeyList.Hka_Bd.bStoerung.key,
    ReadKeyList.Hka_Bd.bWarnung.key,
    ReadKeyList.Hka_Bd.UHka_Anf.Anforderung.fStrom.key,
    ReadKeyList.Hka_Bd.UHka_Anf.usAnforderung.key,
    ReadKeyList.Hka_Bd.UHka_Frei.usFreigabe.key,
    ReadKeyList.Hka_Bd.ulArbeitElektr.key,
    ReadKeyList.Hka_Bd.ulArbeitThermHka.key,
    ReadKeyList.Hka_Bd.ulArbeitThermKon.key,
    ReadKeyList.Hka_Bd.ulBetriebssekunden.key,
    ReadKeyList.Hka_Bd.ulAnzahlStarts.key,
    ReadKeyList.Hka_Bd_Stat.uchSeriennummer.key,
    ReadKeyList.Hka_Bd_Stat.uchTeilenummer.key,
    ReadKeyList.Hka_Bd_Stat.ulInbetriebnahmedatum.key,
  ],
  BetriebsDaten3112: [
    ReadKeyList.BD3112.Hka_Bd.ulBetriebssekunden.key,
    ReadKeyList.BD3112.Hka_Bd.ulAnzahlStarts.key,
    ReadKeyList.BD3112.Hka_Bd.ulArbeitElektr.key,
    ReadKeyList.BD3112.Hka_Bd.ulArbeitThermHka.key,
    ReadKeyList.BD3112.Hka_Bd.ulArbeitThermKon.key,
    ReadKeyList.BD3112.Ww_Bd.ulWwMengepA.key,
  ],
  Daten2Waermeerzeuger: [
    ReadKeyList.Brenner_Bd.bIstStatus.key,
    ReadKeyList.Brenner_Bd.bWarnung.key,
    ReadKeyList.Brenner_Bd.UBrenner_Anf.usAnforderung.key,
    ReadKeyList.Brenner_Bd.UBrenner_Frei.bFreigabe.key,
    ReadKeyList.Brenner_Bd.ulAnzahlStarts.key,
    ReadKeyList.Brenner_Bd.ulBetriebssekunden.key,
  ],
  HydraulikSchema: [
    ReadKeyList.Hka_Ew.HydraulikNr.bSpeicherArt.key,
    ReadKeyList.Hka_Ew.HydraulikNr.bWW_Art.key,
    ReadKeyList.Hka_Ew.HydraulikNr.b2_Waermeerzeuger.key,
    ReadKeyList.Hka_Ew.HydraulikNr.bMehrmodul.key,
  ],
  Temperatures: [
    ReadKeyList.Hka_Mw1.Temp.sAbgasHKA.key,
    ReadKeyList.Hka_Mw1.Temp.sAbgasMotor.key,
    ReadKeyList.Hka_Mw1.Temp.sKapsel.key,
    ReadKeyList.Hka_Mw1.Temp.sbAussen.key,
    ReadKeyList.Hka_Mw1.Temp.sbFreigabeModul.key,
    ReadKeyList.Hka_Mw1.Temp.sbFuehler1.key,
    ReadKeyList.Hka_Mw1.Temp.sbFuehler2.key,
    ReadKeyList.Hka_Mw1.Temp.sbGen.key,
    ReadKeyList.Hka_Mw1.Temp.sbMotor.key,
    ReadKeyList.Hka_Mw1.Temp.sbRegler.key,
    ReadKeyList.Hka_Mw1.Temp.sbRuecklauf.key,
    ReadKeyList.Hka_Mw1.Temp.sbVorlauf.key,
    ReadKeyList.Hka_Mw1.Temp.sbZS_Fuehler3.key,
    ReadKeyList.Hka_Mw1.Temp.sbZS_Fuehler4.key,
    ReadKeyList.Hka_Mw1.Temp.sbZS_Vorlauf1.key,
    ReadKeyList.Hka_Mw1.Temp.sbZS_Vorlauf2.key,
    ReadKeyList.Hka_Mw1.Temp.sbZS_Warmwasser.key,
    ReadKeyList.Hka_Mw1.Solltemp.sbRuecklauf.key,
    ReadKeyList.Hka_Mw1.Solltemp.sbVorlauf.key,
  ],
  Aktoren: [
    ReadKeyList.Hka_Mw1.Aktor.bWwPumpe.key,
    ReadKeyList.Hka_Mw1.Aktor.fFreiAltWaerm.key,
    ReadKeyList.Hka_Mw1.Aktor.fMischer1Auf.key,
    ReadKeyList.Hka_Mw1.Aktor.fMischer1Zu.key,
    ReadKeyList.Hka_Mw1.Aktor.fMischer2Auf.key,
    ReadKeyList.Hka_Mw1.Aktor.fMischer2Zu.key,
    ReadKeyList.Hka_Mw1.Aktor.fProgAus1.key,
    ReadKeyList.Hka_Mw1.Aktor.fProgAus2.key,
    ReadKeyList.Hka_Mw1.Aktor.fProgAus3.key,
    ReadKeyList.Hka_Mw1.Aktor.fStoerung.key,
    ReadKeyList.Hka_Mw1.Aktor.fUPHeizkreis1.key,
    ReadKeyList.Hka_Mw1.Aktor.fUPHeizkreis2.key,
    ReadKeyList.Hka_Mw1.Aktor.fUPKuehlung.key,
    ReadKeyList.Hka_Mw1.Aktor.fUPVordruck.key,
    ReadKeyList.Hka_Mw1.Aktor.fUPZirkulation.key,
    ReadKeyList.Hka_Mw1.Aktor.fWartung.key,
    ReadKeyList.Hka_Mw1.sWirkleistung.key,
    ReadKeyList.Hka_Mw1.ulMotorlaufsekunden.key,
    ReadKeyList.Hka_Mw1.usDrehzahl.key,
  ],
  Tageslauf: [
    ReadKeyList.Laufraster15Min_aktTag.bDoppelstunde[0].key,
    ReadKeyList.Laufraster15Min_aktTag.bDoppelstunde[1].key,
    ReadKeyList.Laufraster15Min_aktTag.bDoppelstunde[2].key,
    ReadKeyList.Laufraster15Min_aktTag.bDoppelstunde[3].key,
    ReadKeyList.Laufraster15Min_aktTag.bDoppelstunde[4].key,
    ReadKeyList.Laufraster15Min_aktTag.bDoppelstunde[5].key,
    ReadKeyList.Laufraster15Min_aktTag.bDoppelstunde[6].key,
    ReadKeyList.Laufraster15Min_aktTag.bDoppelstunde[7].key,
    ReadKeyList.Laufraster15Min_aktTag.bDoppelstunde[8].key,
    ReadKeyList.Laufraster15Min_aktTag.bDoppelstunde[9].key,
    ReadKeyList.Laufraster15Min_aktTag.bDoppelstunde[10].key,
    ReadKeyList.Laufraster15Min_aktTag.bDoppelstunde[11].key,
  ],
  MehrmodulTechnik: [
    ReadKeyList.Mm[0].ModulSteuerung.fModulLaeuft.key,
    ReadKeyList.Mm[0].ModulSteuerung.fModulVerfuegbar.key,
    ReadKeyList.Mm[1].ModulSteuerung.fModulLaeuft.key,
    ReadKeyList.Mm[1].ModulSteuerung.fModulVerfuegbar.key,
    ReadKeyList.Mm[2].ModulSteuerung.fModulLaeuft.key,
    ReadKeyList.Mm[2].ModulSteuerung.fModulVerfuegbar.key,
    ReadKeyList.Mm[3].ModulSteuerung.fModulLaeuft.key,
    ReadKeyList.Mm[3].ModulSteuerung.fModulVerfuegbar.key,
    ReadKeyList.Mm[4].ModulSteuerung.fModulLaeuft.key,
    ReadKeyList.Mm[4].ModulSteuerung.fModulVerfuegbar.key,
    ReadKeyList.Mm[5].ModulSteuerung.fModulLaeuft.key,
    ReadKeyList.Mm[5].ModulSteuerung.fModulVerfuegbar.key,
    ReadKeyList.Mm[6].ModulSteuerung.fModulLaeuft.key,
    ReadKeyList.Mm[6].ModulSteuerung.fModulVerfuegbar.key,
    ReadKeyList.Mm[7].ModulSteuerung.fModulLaeuft.key,
    ReadKeyList.Mm[7].ModulSteuerung.fModulVerfuegbar.key,
    ReadKeyList.Mm[8].ModulSteuerung.fModulLaeuft.key,
    ReadKeyList.Mm[8].ModulSteuerung.fModulVerfuegbar.key,
    ReadKeyList.Mm[9].ModulSteuerung.fModulLaeuft.key,
    ReadKeyList.Mm[9].ModulSteuerung.fModulVerfuegbar.key,
    ReadKeyList.Mm_MinMax.bModulBhMaxWart.key,
    ReadKeyList.Mm_MinMax.bModulBhMinWart.key,
    ReadKeyList.Mm_MinMax.sBhMaxWart.key,
    ReadKeyList.Mm_MinMax.sBhMinWart.key,
    ReadKeyList.Mm_MinMax.ModulBhMax.bModulNr.key,
    ReadKeyList.Mm_MinMax.ModulBhMax.ulWert.key,
    ReadKeyList.Mm_MinMax.ModulBhMin.bModulNr.key,
    ReadKeyList.Mm_MinMax.ModulBhMin.ulWert.key,
    ReadKeyList.Mm_MinMax.ModulStartMax.bModulNr.key,
    ReadKeyList.Mm_MinMax.ModulStartMax.ulWert.key,
    ReadKeyList.Mm_MinMax.ModulStartMin.bModulNr.key,
    ReadKeyList.Mm_MinMax.ModulStartMin.ulWert.key,
  ],
  Wartung: [
    ReadKeyList.Wartung_Cache.fStehtAn.key,
    ReadKeyList.Wartung_Cache.ulBetriebssekundenBei.key,
    ReadKeyList.Wartung_Cache.ulZeitstempel.key,
    ReadKeyList.Wartung_Cache.usIntervall.key,
  ],
};
