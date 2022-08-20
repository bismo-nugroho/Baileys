import { Boom } from '@hapi/boom'
import makeWASocket, { AnyMessageContent, delay, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, MessageRetryMap, useMultiFileAuthState } from './src'
import MAIN_LOGGER from './src/Utils/logger'

const logger = MAIN_LOGGER.child({})
logger.level = 'trace'

const useStore = !process.argv.includes('--no-store')
const doReplies = !process.argv.includes('--no-reply')

// external map to store retry counts of messages when decryption/encryption fails
// keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
const msgRetryCounterMap: MessageRetryMap = {}




import { exit, exitCode } from 'process'

const fetch = require('node-fetch')

const intervalcheck = 5; // 5 second
var started = 0;
var counter = 0;
var lastcounter = 0;
var checkcounter = 0;
var verified = 0;
var init = 0;
var processed = 0;
var isreply = false;

var msgqueue = [{ from: "", teks: "", type: "", buff: "" }];
//const { fetchJson, fetchText } = require('./lib/fetcher')


var counter = 0, lastcounter = 0, checkstatus = 0;

//const { fetchJson, fetchText } = require('./lib/fetcher')


const sets = {
    "webHook": "http://api.wa/",
    "quranWeb": "http://localhost:3000"
};


const fs = require('fs')

const setting = JSON.parse(fs.readFileSync('setting.json'))

//const setting = sets;
const webHook = setting.webHook;
const quranWeb = setting.quranWeb;



// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = useStore ? makeInMemoryStore({ logger }) : undefined
store?.readFromFile('./baileys_store_multi.json')
// save every 10s
setInterval(() => {
    store?.writeToFile('./baileys_store_multi.json')
}, 10_000)

// start a connection
const startSock = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
    // fetch latest version of WA Web
    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

    var id;
    var uid;

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        auth: state,
        msgRetryCounterMap,
        // implement to handle retries
        getMessage: async key => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid!, key.id!, undefined)
                return msg?.message || undefined
            }

            // only if store is present
            return {
                conversation: 'hello'
            }
        }
    })

    store?.bind(sock.ev)



    const timerMonitor = async () => {

        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date + ' ' + time;



        console.log(dateTime, ': Timer Monitor : Counter = ', counter, ' last counter= ', lastcounter, ' checkstatus=', checkstatus);


        if (counter == lastcounter) {
            checkstatus++;
        } else {
            checkstatus = 0;
        }

        lastcounter = counter;

        if (checkstatus > 5) {
            checkstatus = 0;
            counter = 0;
            lastcounter = 0;
            console.log(dateTime, ': Proses Timeout, re check new Message, Terminated');

            exit(1);

            sleeps(intervalcheck * 1000).then(async () => {
                startSock();
                //checkNewMessage();
                //	console.log('Check Message Routine...');
            });
        } else {
            setTimeout(function () { timerMonitor(); }, 5000);
        }


    }



    async function checkReply() {

        setTimeout(function () { checkReply() }, 3000);

        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date + ' ' + time;

        console.log(dateTime, ' : check Reply, Msgqueue = ', msgqueue, 'process=', processed);

        if (processed == 0 && msgqueue.length > 0) {
            var dest = msgqueue[0].from.split("@");
            if (msgqueue[0].from != "" && dest[1] == 's.whatsapp.net') {
                isreply = true;
                //obj.from = msgqueue[0].from;
                //obj.teks = msgqueue[0].teks;
                //obj.type = msgqueue[0].type;
                //obj.buffer = ""; /* whatever */
                await sendMessageWTyping({ text: msgqueue[0].teks }, msgqueue[0].from)
            } else {
                msgqueue.shift();
            }
        }



    }



    async function sendMessageText(client, from, teks, text) {
        if (teks != "") {
            var obj = { from: "", teks: "", type: "", buff: "" };
            obj.from = from;
            obj.teks = teks;
            obj.type = "text";
            obj.buff = "";///* whatever */;
            msgqueue.push(obj);

        }
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    }

    function highlightCari(teks, cari) {
        var res = teks;
        res = replaceAll(res, " " + cari, " *" + cari + "*");
        res = replaceAll(res, "" + cari + " ", "*" + cari + "* ");
        res = replaceAll(res, " " + cari + " ", " *" + cari + "* ");
        return res;
    }


    function toNumbers(str) {
        var nums = "" + str + "";
        var res = "";
        var x = 0;

        const tags = ["\uFD3E", "\uFD3F"];
        const numes = ["\u{660}", "\u{661}", "\u{662}", "\u{663}", "\u{664}", "\u{665}", "\u{666}", "\u{667}", "\u{668}", "\u{669}"];

        for (x = 0; x < nums.length; x++) {
            res = res + numes[nums.substr(x, 1)] + "";
        }

        res = tags[1] + res + tags[0];
        return res;

    }

    function searchPattern(translation, cari) {
        var carit = cari;

        var caris = translation.id.toLowerCase().indexOf(carit);
        if (caris == 0) {
            return true;
        }

        var caris = translation.id.toLowerCase().indexOf(carit + ",");
        if (caris == 0) {
            return true;
        }


        var caris = translation.id.toLowerCase().indexOf(carit + ".");
        if (caris == 0) {
            return true;
        }


        var caris = translation.id.toLowerCase().indexOf(" " + carit + " ");
        if (caris > 0) {
            return true;
        }

        var caris = translation.id.toLowerCase().indexOf(" " + carit + "");
        if (caris > 0) {
            return true;
        }

        var caris = translation.id.toLowerCase().indexOf("" + carit + " ");
        if (caris > 0) {
            return true;
        }

        var caris = translation.id.toLowerCase().indexOf("," + carit + "");
        if (caris > 0) {
            return true;
        }

        var caris = translation.id.toLowerCase().indexOf("" + carit + ",");
        if (caris > 0) {
            return true;
        }

        var caris = translation.id.toLowerCase().indexOf("" + carit + ".");
        if (caris > 0) {
            return true;
        }

        return false;
    }


    async function cariArti(client, from, text, cari, index, found, ayat) {

        if (index < 115) {
            //console.log("request - ",quranWeb+'/cariarti/' +cari );
            //const response = await fetchJson(quranWeb + '/cariarti/' + cari)
            const resp = await fetch(quranWeb + '/cariarti/' + cari);
            //console.log('Response=',resp.text());
            let response = await resp.json();

            const { data } = response;//.data
            //console.log(data);
            var pesan = ""
            if (data.data.length > 0) {
                for (var x = 0; x < data.data.length; x++) {
                    if (x == 0) {
                        pesan = pesan + "Pencarian terjemahan pada kata *" + cari + "* ditemukan di *" + data.totalsurah + "* surah sebanyak *" + data.totalayat + "* ayat \n\n"
                    }
                    pesan = pesan + data.data[x];
                }

                if (pesan != "") {
                    sendMessageText(client, from, pesan, text);
                } else {

                }


                //pesan = pesan + "Nama : " + data[idx].name.transliteration.id + "\n" + "Asma : " + data[idx].name.short + "\n" + "Arti : " + data[idx].name.translation.id + "\n" + "Jumlah ayat : " + data[idx].numberOfVerses + "\n" + "Nomor surah : " + data[idx].number + "\n" + "Jenis : " + data[idx].revelation.id + "\n" + "Keterangan : " + data[idx].tafsir.id
                //client.sendText(from, pesan)
                /*
                var arti = data.verses.filter(({
                    translation
                }) => {
                    return searchPattern(translation,cari);
                })
    	
                for (x in arti) {
                    ayat++;
                    //console.log("found==",found,"x=",x);
                    if (x == 0) {
                        found++;
                        //console.log("found=",found);
                    }
    	
                    if (found == 1 && x == 0) {
                        //console.log("init=",found);
                        pesan = pesan + "Pencarian Arti pada kata *" + cari + "* ditemukan di surat berikut :\n\n"
                    }
    	
                    if (x == 0) {
                        pesan = pesan + "*Surah " + data.name.transliteration.id + "*\n\n";
                    }
                    var datas = arti[x];
                    pesan = pesan + datas.text.arab + " " + toNumbers(datas.number.inSurah) + "\n\n"
                    pesan = pesan + datas.number.inSurah + ". " + highlightCari(datas.translation.id, cari) + "\n\n"
                }
    	
                if (pesan != "") {
                    sendMessageText(client, from, pesan, text);
                }
    	
                if (index < 115) {
                    index++;
                    if (pesan!=""){
                        times = 2000;
                    }else{
                        times = 300;
                    }
                    sleeps(times).then(async () => {
                        //await ticks();
                        await cariArti(client, from, text, cari, index, found,ayat);
                    });
    	
                    //cariArti(client,from,text,cari,index);
                */
            } else {
                //if (found==0){
                sendMessageText(client, from, "Mohon maaf pencarian untuk kata *" + cari + "* tidak ditemukan di semua surah \u{1F64F}", text);
                //}else{
                //	sendMessageText(client, from, "Akhir dari pencarian kata  *"+ cari +"*, ditemukan di "+ found +" surah sebanyak "+ ayat +" ayat \u{1F64F}", text);	
                //}
            }
        }

    }





    async function cariJuz(client, from, text, cari, index, found, ayat) {
        var x = 0;
        if (index < 115) {
            //consoe.llog("request - ",quranWeb+'/cariarti/' +cari );
            //const response = await fetchJson(quranWeb + '/carijuz/' + cari)

            const resp = await fetch(quranWeb + '/carijuz/' + cari);
            //console.log('Response=', resp);
            let response = await resp.json();

            const { data } = response;//.data
            //console.log(data);
            var pesan = ""
            if (data.data.length > 0) {
                for (var x = 0; x < data.data.length; x++) {
                    if (x == 0) {
                        //pesan = pesan + "Pencarian terjemahan pada kata *" + cari + "* ditemukan di *" + data.totalsurah + "* surah sebanyak *" + data.totalayat + "* ayat \n\n"
                    }
                    pesan = pesan + data.data[x];
                }

                if (pesan != "") {
                    sendMessageText(client, from, pesan, text);
                } else {

                }


                //pesan = pesan + "Nama : " + data[idx].name.transliteration.id + "\n" + "Asma : " + data[idx].name.short + "\n" + "Arti : " + data[idx].name.translation.id + "\n" + "Jumlah ayat : " + data[idx].numberOfVerses + "\n" + "Nomor surah : " + data[idx].number + "\n" + "Jenis : " + data[idx].revelation.id + "\n" + "Keterangan : " + data[idx].tafsir.id
                //client.sendText(from, pesan)
                /*
                var arti = data.verses.filter(({
                    translation
                }) => {
                    return searchPattern(translation,cari);
                })
    	
                for (x in arti) {
                    ayat++;
                    //console.log("found==",found,"x=",x);
                    if (x == 0) {
                        found++;
                        //console.log("found=",found);
                    }
    	
                    if (found == 1 && x == 0) {
                        //console.log("init=",found);
                        pesan = pesan + "Pencarian Arti pada kata *" + cari + "* ditemukan di surat berikut :\n\n"
                    }
    	
                    if (x == 0) {
                        pesan = pesan + "*Surah " + data.name.transliteration.id + "*\n\n";
                    }
                    var datas = arti[x];
                    pesan = pesan + datas.text.arab + " " + toNumbers(datas.number.inSurah) + "\n\n"
                    pesan = pesan + datas.number.inSurah + ". " + highlightCari(datas.translation.id, cari) + "\n\n"
                }
    	
                if (pesan != "") {
                    sendMessageText(client, from, pesan, text);
                }
    	
                if (index < 115) {
                    index++;
                    if (pesan!=""){
                        times = 2000;
                    }else{
                        times = 300;
                    }
                    sleeps(times).then(async () => {
                        //await ticks();
                        await cariArti(client, from, text, cari, index, found,ayat);
                    });
    	
                    //cariArti(client,from,text,cari,index);
                */
            } else {
                //if (found==0){
                sendMessageText(client, from, "Mohon maaf juz *" + cari + "* tidak ditemukan", text);
                //}else{
                //	sendMessageText(client, from, "Akhir dari pencarian kata  *"+ cari +"*, ditemukan di "+ found +" surah sebanyak "+ ayat +" ayat \u{1F64F}", text);	
                //}
            }
        }

    }




    async function fetchJson(par) {
        const resp = await fetch(par);
        var response = await resp.json();


        return response;
    }


    function processMessage(chat) {

        var body = chat.message.conversation;
        var from = chat.key.remoteJid;
        var idx = 0;

        sleeps(1000).then(async () => {

            console.log("Process message : ", body);

            var data = { idchat: "", message: "" };
            var d =
                data.idchat = from;
            data.message = body;

            var args = body.split(" ");
            var client = "";
            var texts = "";
            var text = "";;

            switch (args[0].toLowerCase()) {
                case '/menu':
                case '/helps':
                    //texts = `Bismillah.. Halo *${chats.presences}*n\nBerikut adalah menu yang bisa dipakai,\n\n*_/info surah <nama surah>_*\nMenampilkan informasi lengkap mengenai surah tertentu. Contoh penggunan: /info surah al-baqarah\n\n*_/surah <nama surah> <ayat>_*\nMenampilkan ayat Al-Qur'an tertentu beserta terjemahannya dalam bahasa Indonesia. Contoh penggunaan : /surah al-fatihah 1\n*_/surah <nama surah> <ayat> en_*\nMenampilkan ayat Al-Qur'an tertentu beserta terjemahannya dalam bahasa Inggris. Contoh penggunaan : /surah al-fatihah 1 en\n\n*_/tafsir <nama surah> <ayat>_*\nMenampilkan ayat Al-Qur'an tertentu beserta terjemahan dan tafsirnya dalam bahasa Indonesia. Contoh penggunaan : /tafsir al-fatihah 1\n\n*_/audio <nama surah>_*\nMenampilkan tautan dari audio surah tertentu. Contoh penggunaan : /audio al-fatihah\n*_/audio <nama surah> <ayat>_*\nMengirim audio surah dan ayat tertentu beserta terjemahannya dalam bahasa Indonesia. Contoh penggunaan : /audio al-fatihah 1\n*_/audio <nama surah> <ayat> en_*\nMengirim audio surah dan ayat tertentu beserta terjemahannya dalam bahasa Inggris. Contoh penggunaan : /audio al-fatihah 1 en\n\n*_/jadwal <kota(jika termasuk kota)> <nama kab/kota> <waktu/tanggal DD-M-YYYY(optional)> [Fitur ini tidak bisa digunakan untuk sementara]_*\nMenampilkan jadwal shalat untuk daerah harian tertentu dalam waktu tertentu. Contoh penggunaan:\nJika ingin menampilkan jadwal shalat di Kabupaten Tasikmalaya hari ini cukup ketik /jadwal tasikmalaya\nJika ingin menampilkan jadwal shalat di Kota Tasikmalaya hari ini cukup ketik /jadwal kota tasikmalaya\nJika ingin menambahkan keterangan waktu di akhir ketikkan tanggal-bulan-tahun, contoh: /jadwal tasikmalaya 23-9-2020\n\n*_/random ayat_*\nMenampilkan ayat tertentu secara random beserta terjemahannya dalam bahasa Indonesia.\n*_/random ayat en_*\nMenampilkan ayat tertentu secara random beserta terjemahannya dalam bahasa Inggris. \n\nCatatan: Perintah diawali dengan prefiks garing (/). Pastikan juga ketika mengetik nama surah menggunakan tanda hubung (-)\n`;
                    //texts = `Bismillah.. Halo, \n\nBerikut adalah menu yang bisa dipakai,\n\n*_/listsurah_*\nMenampilkan daftar lengkap surah. Contoh penggunan: /listsurah\n\n*_/info surah <nama surah>_*\nMenampilkan informasi lengkap mengenai surah tertentu. Contoh penggunan: /info surah al-baqarah\n\n*_/surah <nama surah> <ayat>_*\nMenampilkan ayat Al-Qur'an tertentu beserta terjemahannya dalam bahasa Indonesia. Contoh penggunaan : /surah al-fatihah 1\n : menampilkan Surah al-fatihah ayat ke 1\n*_/surah <nama surah>_*\nMenampilkan surah Al-Qur'an tertentu secara lengkap. Contoh penggunaan : /surah al-fatihah\n\n*_/tafsir <nama surah> <ayat>_*\nMenampilkan ayat Al-Qur'an tertentu beserta terjemahan dan tafsirnya dalam bahasa Indonesia. Contoh penggunaan : /tafsir al-fatihah 1\n\n*_/random ayat_*\nMenampilkan ayat tertentu secara random beserta terjemahannya dalam bahasa Indonesia.\n\n*_Catatan_*\nPerintah diawali dengan prefiks garing (/). Pastikan juga ketika mengetik nama surah menggunakan tanda hubung (-)\n`;
                    texts = `Bismillah.. Halo, \n\nBerikut adalah menu yang bisa dipakai,\n\n*_/listsurah_*\nMenampilkan daftar lengkap surah. Contoh penggunan: /listsurah\n\n*_/infosurah <nama surah>_*\nMenampilkan informasi lengkap mengenai surah tertentu. Contoh penggunan: /infosurah al-baqarah\n\n*_/surah <nama surah> <ayat>_*\nMenampilkan ayat Al-Qur'an tertentu beserta terjemahannya dalam bahasa Indonesia. Contoh penggunaan : /surah al-fatihah 1\n : menampilkan Surah al-fatihah ayat ke 1\n*_/surah <nama surah>_*\nMenampilkan surah Al-Qur'an tertentu secara lengkap. Contoh penggunaan : /surah al-fatihah\n\n*_/tafsir <nama surah> <ayat>_*\nMenampilkan ayat Al-Qur'an tertentu beserta terjemahan dan tafsirnya dalam bahasa Indonesia. Contoh penggunaan : /tafsir al-fatihah 1\n\n*_/random ayat_*\nMenampilkan ayat tertentu secara random beserta terjemahannya dalam bahasa Indonesia.\n\n*_Catatan_*\nPerintah diawali dengan prefiks garing (/). Pastikan juga ketika mengetik nama surah menggunakan tanda hubung (-)\n`;

                    sendMessageText(client, from, texts, text);
                    //client.sendText(from, )
                    break
                case '/listsurah':
                    if (body.length > 9) {
                        const response = await fetchJson(quranWeb + '/surah')

                        //const resp = await fetch(quranWeb + '/surah');
                        //let response = await resp.json();

                        const { data } = response;//.data
                        // console.log(data);
                        pesan = "Daftar Surah\n";
                        pesan = pesan + "------------------------\n";
                        var nums = 0;
                        for (var x = 0; x < data.length; x++) {
                            nums++;
                            var dt = data[x];
                            pesan = pesan + nums + ". ";
                            pesan = pesan + dt.name.transliteration.id + " ( " + dt.name.short + " ).\n";
                        }
                        //client.sendText(from, pesan)
                        sendMessageText(client, from, pesan, text);
                    }
                    break

                case '/cariarti':
                    var word = body.split(" ");
                    var params = word.join().replace(word[0], "").replace(/,/gi, " ").trim()
                    if (params.length > 2) {
                        sendMessageText(client, from, "Pencarian sedang dilakukan, kemungkinan membutuhkan waktu lebih lama \u{1F64F}", text);
                        await cariArti(client, from, text, params, 1, 0, 0)
                    } else {
                        sendMessageText(client, from, "Mohon maaf kata pencarian terlalu pendek, minimal 3 character", text);
                    }
                    break
                case '/juz':
                    var word = body.split(" ");
                    var params = word.join().replace(word[0], "").replace(/,/gi, " ").trim()
                    if (params.length > 0) {
                        sendMessageText(client, from, "Mohon ditunggu, Permintaan kamu sedang di proses \u{1F64F}", text);

                        //sendMessageText(client, from, "Pencarian sedang dilakukan, kemungkinan membutuhkan waktu lebih lama \u{1F64F}", text);
                        await cariJuz(client, from, text, params, 1, 0, 0)
                    } else {
                        sendMessageText(client, from, "Mohon maaf masukkan juz yang ingin anda request", text);
                    }
                    break
                case '/infosurah':
                    if (body.length > 10) {
                        sendMessageText(client, from, "Mohon ditunggu, Permintaan kamu sedang di proses \u{1F64F}", text);

                        //const response = await fetchJson(quranWeb + '/surah')
                        const resp = await fetch(quranWeb + '/surah');
                        let response = await resp.json();

                        const { data } = response;//.data
                        //console.log(data);
                        var idx = data.findIndex(function (post, index) {
                            if ((post.name.transliteration.id.toLowerCase() == args[1].toLowerCase()) || (post.name.transliteration.en.toLowerCase() == args[1].toLowerCase()))
                                return true;
                        });
                        if (idx >= 0) {
                            var pesan = ""
                            pesan = pesan + "Nama : " + data[idx].name.transliteration.id + "\n" + "Asma : " + data[idx].name.short + "\n" + "Arti : " + data[idx].name.translation.id + "\n" + "Jumlah ayat : " + data[idx].numberOfVerses + "\n" + "Nomor surah : " + data[idx].number + "\n" + "Jenis : " + data[idx].revelation.id + "\n" + "Keterangan : " + data[idx].tafsir.id
                            //client.sendText(from, pesan)
                            //sendMessageText(client, from, pesan, text);
                        } else {
                            pesan = "Nama Surah tidak ditemukan, Mohon diperiksa lagi ya  \u{1F64F} , \n";
                            pesan += "Pastikan juga ketika mengetik nama surah menggunakan tanda hubung (-)\n";
                            pesan += "Untuk informasi daftar surah kamu bisa ketik : */listsurah*";
                            //sendMessageText(client, from, pesan, text); 
                        }
                    } else {
                        pesan = "Sepertinya format yang anda masukkan masih salah \n";
                        pesan += "Formatnya adalah : */infosurah nama-surah* \n";
                        pesan += "contoh : */infosurah al-fatihah* \n";
                    }
                    sendMessageText(client, from, pesan, text);
                    break
                case '/surah':
                    if (body.length > 6) {
                        //const response = await fetchJson(')
                        const resp = await fetch(quranWeb + '/surah');
                        let response = await resp.json();
                        const { data } = response;//.data
                        idx = 0;
                        idx = data.findIndex(function (post, index) {
                            if ((post.name.transliteration.id.toLowerCase() == args[1].toLowerCase()) || (post.name.transliteration.en.toLowerCase() == args[1].toLowerCase()))
                                return true;
                        });

                        if (idx >= 0) {
                            var nmr = data[idx].number
                            if (args.length > 2) {
                                if (isNaN(args[2])) {
                                    pesan = "Nomor ayat harus dalam format angka, mungkin kamu salah memasukkan nomor-ayat \n";

                                } else {
                                    const responsi2 = await fetchJson(quranWeb + '/surah/' + nmr + "/" + args[2])
                                    const { data } = responsi2;//.data

                                    if (responsi2.code == 200) {
                                        var last = function last(array, n = null) {
                                            if (array == null) return void 0;
                                            if (n == null) return array[array.length - 1];
                                            return array.slice(Math.max(array.length - n, 0));
                                        };
                                        bhs = last(args)
                                        pesan = ""
                                        pesan = pesan + data.text.arab + "\n\n"
                                        if (bhs == "en") {
                                            pesan = pesan + data.translation.en
                                        } else {
                                            pesan = pesan + data.translation.id
                                        }
                                        pesan = pesan + "\n\n(Q.S. " + data.surah.name.transliteration.id + ":" + args[2] + ")"
                                    } else {
                                        pesan = "Nomor ayat tidak ditemukan, mungkin kamu salah memasukkan nomor-ayat \n";
                                    }
                                }
                            } else {
                                const responsi2 = await fetchJson(quranWeb + '/surah/' + nmr);
                                const { data } = responsi2;//.data
                                pesan = ""
                                var nums = 0;

                                pesan = pesan + "*Surah " + data.name.transliteration.id + " ( " + data.name.long + " )* \n";
                                pesan = pesan + data.revelation.id + " ( " + data.revelation.arab + " )\n\n";

                                if (data.preBismillah) {
                                    dt = data.preBismillah;
                                    pesan = pesan + dt.text.arab + "\n\n";
                                    pesan = pesan + dt.translation.id + "\n\n";

                                }


                                for (var x = 0; x < data.verses.length; x++) {
                                    nums++;
                                    dt = data.verses[x];
                                    pesan = pesan + " ";
                                    pesan = pesan + "  " + dt.text.arab + toNumbers(nums) + " \n\n";
                                    pesan = pesan + nums + ". " + dt.translation.id + "\n\n";

                                }

                            }
                            //client.sendText(from, pesan)
                            // sendMessageText(client, from, pesan, text);
                        } else {
                            pesan = "Nama Surah tidak ditemukan, Mohon diperiksa lagi ya  \u{1F64F} , \n";
                            pesan += "Pastikan juga ketika mengetik nama surah menggunakan tanda hubung (-)\n";
                            pesan += "Untuk informasi daftar surah kamu bisa ketik : */listsurah*";
                            //sendMessageText(client, from, pesan, text); 
                        }
                    } else {
                        pesan = "Sepertinya format yang anda masukkan masih salah \n";
                        pesan += "Formatnya adalah : \n";
                        pesan += "*/surah nama-surah nomor-ayat* atau \n";
                        pesan += " */surah nama-surah*\n";
                        pesan += "contoh : \n";
                        pesan += "*/surah al-fatihah 1* atau \n";
                        pesan += "*/surah al-fatihah*  \n";
                    }
                    sendMessageText(client, from, pesan, text);
                    break
                case '/tafsir':
                    if (body.length > 8) {
                        const respons = await fetchJson(quranWeb + '/surah')
                        const { data } = respons;//.data
                        var idx = data.findIndex(function (post, index) {
                            if ((post.name.transliteration.id.toLowerCase() == args[1].toLowerCase()) || (post.name.transliteration.en.toLowerCase() == args[1].toLowerCase()))
                                return true;
                        });

                        if (args.length > 2) {

                            if (idx >= 0) {
                                nmr = data[idx].number
                                if (isNaN(args[2])) {
                                    pesan = "Nomor ayat harus dalam format angka, mungkin kamu salah memasukkan nomor-ayat \n";

                                } else {
                                    const responsi = await fetchJson(quranWeb + '/surah/' + nmr + "/" + args[2])
                                    const { data } = responsi;//.data
                                    if (responsi.code == 200) {
                                        pesan = ""
                                        pesan = pesan + "Tafsir Q.S. " + data.surah.name.transliteration.id + ":" + args[2] + "\n\n"
                                        pesan = pesan + data.text.arab + "\n\n"
                                        pesan = pesan + "_" + data.translation.id + "_" + "\n\n" + data.tafsir.id.long
                                    } else {
                                        pesan = "Nomor ayat tidak ditemukan, mungkin kamu salah memasukkan nomor-ayat \n";
                                    }
                                }
                                //sendMessageText(client, from, pesan, text);
                                //client.sendText(from, pesan)
                            } else {
                                pesan = "Nama Surah tidak ditemukan, Mohon diperiksa lagi ya  \u{1F64F} , \n";
                                pesan += "Pastikan juga ketika mengetik nama surah menggunakan tanda hubung (-)\n";
                                pesan += "Untuk informasi daftar surah kamu bisa ketik : */listsurah*";
                                //sendMessageText(client, from, pesan, text); 
                            }
                        } else {
                            pesan = "Sepertinya format yang anda masukkan masih salah \n";
                            pesan += "Formatnya adalah : */tafsir nama-surah nomorayat* \n";
                            pesan += "contoh : */tafsir al-fatihah 1* \n";

                        }
                    } else {
                        pesan = "Sepertinya format yang anda masukkan masih salah \n";
                        pesan += "Formatnya adalah : */tafsir nama-surah nomorayat*\n";
                        pesan += "contoh : */tafsir al-fatihah 1* \n";
                    }
                    sendMessageText(client, from, pesan, text);
                    break

                case '/random':
                    if (body.length > 6) {
                        const response = await fetchJson(quranWeb + '/surah')
                        const { data } = response;//.data
                        nmr = Math.floor(Math.random() * 115);
                        var maks = data[nmr - 1].numberOfVerses
                        var ayat = Math.floor(Math.random() * maks) + 1;
                        if (!isNaN(nmr)) {
                            const responsi2 = await fetchJson(quranWeb + '/surah/' + nmr + "/" + ayat)
                            const { data } = responsi2;//.data
                            var last1 = function last(array, n = null) {
                                if (array == null) return void 0;
                                if (n == null) return array[array.length - 1];
                                return array.slice(Math.max(array.length - n, 0));
                            };
                            var bhs = last1(args)
                            pesan = ""
                            pesan = pesan + data.text.arab + "\n\n"
                            if (bhs == "en") {
                                pesan = pesan + data.translation.en
                            } else {
                                pesan = pesan + data.translation.id
                            }
                            pesan = pesan + "\n\n(Q.S. " + data.surah.name.transliteration.id + ":" + ayat + ")"
                            sendMessageText(client, from, pesan, text);
                            //client.sendText(from, pesan)
                        }
                    }
                    break
                    //case 'assalamualaikum':
                    //case 'aslmalaikum':
                    //case 'asalamualaikum':
                    sendMessageText(client, from, "Wa'alaikumsalam, \nUntuk menu bantuan bisa ketik */help* . Terima kasih \u{1F64F}", text);
                // client.sendText(from, "Waalaikumussalam Warahmatullahi Wabarakatuh")
                //	break
                default:
                    var ms = JSON.stringify(data);
                    //console.log("encoded=", ms);
                    ms = encodeURIComponent(ms)

                    var voss = await fetchJson(webHook + '/sendHook.php?source=' + ms);
                    try {
                        var datas = voss;
                        console.log("response from web", voss);
                        //voss = {voss);
                        if (datas.status) {
                            if (datas.response != "") {
                                sendMessageText(client, from, datas.response, text);
                            } else {
                                sendMessageText(client, from, "Assalamualaikum, \nUntuk menu bantuan bisa ketik */help* . Terima kasih \u{1F64F}", text);
                            }
                        }
                    } catch (e) {
                        sendMessageText(client, from, "Assalamualaikum, \nUntuk menu bantuan bisa ketik */help* . Terima kasih \u{1F64F}", text);

                    }

                    break;
            }

            //}
        });

    }


    const sendMessageWTyping = async (msg: AnyMessageContent, jid: string) => {
        console.log("Send Message : ", msg);

        if (processed != 0) return;

        processed = 1;

        await sock.presenceSubscribe(jid)
        await delay(500)

        await sock.sendPresenceUpdate('composing', jid)
        await delay(2000)

        await sock.sendPresenceUpdate('paused', jid)

        await sock.sendMessage(jid, msg)

        //sleeps(4000).then( async () => {
        //	await sock.sendPresenceUpdate('unavailable', jid)
        //checkNewMessage();
        //	console.log('Check Message Routine...');
        //});

        //setTimeout(function (){sock.sendPresenceUpdate('unavailable', jid)},10000);
    }

    const sendMessageButton = async (jid) => {

        const templateButtons = [
            { index: 1, urlButton: { displayText: '⭐ Star Baileys on GitHub!', url: 'https://github.com/adiwajshing/Baileys' } },
            { index: 2, callButton: { displayText: 'Call me!', phoneNumber: '+62 (89635866667)' } },
            { index: 3, quickReplyButton: { displayText: 'This is a reply, just like normal buttons!', id: 'id-like-buttons-message' } },
        ]

        const templateMessage = {
            text: "Hi it's a template message",
            footer: 'Im, Started',
            templateButtons: templateButtons
        }

        const sendMsg = await sock.sendMessage(jid, templateMessage);

    }







    function sleeps(time) {
        //promise sleep
        return new Promise((resolve) => setTimeout(resolve, time));
    }


    const checkNewMessage = async () => {
        counter++;
        //check new message from database if found
        //console.log('Check Message Routine...');
        var data = { id: 0, dest: "", status: "false", message: "", ack: 0, idchat: "" };


        if (counter > 10000)
            counter = 0;

        try {
            var url = webHook + '/getHook.php';
            //console.log(url);

            var voss = {};
            //await fetch(webHook + '/getHook.php')
            //.then(response => response.json())
            //.then(voss => console.log(voss));

            const resp = await fetch(webHook + '/getHook.php');
            let response = await resp.json();

            var today = new Date();
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date + ' ' + time;

            console.log(dateTime, ' : Check New Message Response = ', response);
            data = response;

            //var voss =  await fetchJson(webHook + '/getHook.php');
            //console.log("response from checkMessage = " , voss);
            // datas = voss; //.data;
            //console.log("response from checkMessage = " , datas);
            //datas = voss;
        } catch (e) {
            data.status = "false";
            //console.log('Error : %s', color(e, 'red'))
        }

        //datas = voss;

        if (data.status === "true") {
            var dests = data.dest + "@c.us";




            //const messages = await client.loadMessages (dests, 1);
            // console.log("got back from chatid = "+dests + "=" + messages + " messages",messages);
            //var exists = {jid:""};

            const [result] = await sock.onWhatsApp(data.dest.split("@")[0]);
            console.log("existed=", result);
            //const [result] = await sock.onWhatsApp(id)
            //if (result.exists) console.log (`${id} exists on WhatsApp, as jid: ${result.jid}`)

            if (result) {
                //contact is found
                //data.idchat = exists.jid;
                await sendMessageWTyping({ text: data.message }, result.jid);
                id = data.id;
                uid = "";
                //arrmsgs.push(data);
            } else {
                //contact not found

                data.status = 'ERROR';
                data.ack = 0;
                data.idchat = 'not found';


                updateChatStatus(data);
            }

        } else {

            sleeps(intervalcheck * 1000).then(async () => {
                checkNewMessage();
                //	console.log('Check Message Routine...');
            });
        }

    }

    async function updateChatStatus(data) {
        //update status , update to database that message has been sent
        //console.log('body match');
        //.chat_id = chat.key.id;
        //msg.ack = getAck(chat.status);
        var ms = JSON.stringify(data);
        //
        //console.log("encoded=", ms);
        ms = encodeURIComponent(ms)

        // datas = {};
        console.log("data update = >", data);

        const resp = await fetch(webHook + '/updateHook.php?source=' + ms);
       // console.log('Response=', resp);
        // let datas = await resp.json();



        //  console.log('Updated Response = ', datas);



        //await fetch(webHook + '/updateHook.php?source=' + ms)
        //.then(response => response.json())
        //.then(datas => console.log("data="datas));

        //var res = await fetchJson(webHook + '/updateHook.php?source=' + ms);
        //console.log('result=', res);

        if (data.ack == 1) {
            processed = 0;

        }

        sleeps(intervalcheck * 1000).then(async () => {
            if (data.ack == 1 && !isreply && data.id != 0)
                checkNewMessage();
            //	console.log('Check Message Routine...');
        });

        if (isreply && data.ack != 0) {
            isreply = !isreply;
            msgqueue.shift();
        }


    }

    // the process function lets you process all events that just occurred
    // efficiently in a batch
    sock.ev.process(
        // events is a map for event name => event data
        async (events) => {
            // something about the connection changed
            // maybe it closed, or we received all offline message or connection opened
            if (events['connection.update']) {

                const update = events['connection.update']
                const { connection, lastDisconnect } = update
                if (connection === 'close') {
                    // reconnect if not logged out
                    if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                        startSock()
                    } else {
                        console.log('Connection closed. You are logged out.')
                    }
                }

                console.log('connection update', update)


                /////////////////////////////
                /*
                const update = events['connection.update']
              
                const { connection, lastDisconnect } = update
                if (connection === 'close') {
                    // reconnect if not logged out
                    //if (init == 1 && verified == 0)
                    //	init = 0.

                    if ((lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {

                        console.log('run close not logout');
                        setTimeout(() => {
                            try {
                                startSock()
                            } catch (error) { }
                        }, 15000)
                        //startSock()
                    } else {
                        console.log('Connection closed. You are logged out.')
                    }
                }
*/
                console.log('connection update', update)


                console.log('connection update', update)
                console.log('QRcode=', update.qr);

                if (!update.qr && init == 1) {
                    verified = 1;
                }

                if (update.connection && update.connection == 'connecting') {
                    init = 1;
                }

                console.log('init=', init);
                console.log('verified =', verified);





                if (started == 0 && verified == 1) {
                    started = 1;

                    setTimeout(function () { /*sendMessageButton('6289635866667@s.whatsapp.net');*/  checkReply(); checkNewMessage() }, 3000);
                    setTimeout(function () { timerMonitor(); }, 3000);
                }


                //if (started == 0) {
                //		started = 1;
                //sendMessageWTyping({ text: "I'm Started" }, '6289635866667@s.whatsapp.net');

                //		setTimeout(function () { sendMessageButton('6289635866667@s.whatsapp.net'); /* sendMessageWTyping({ text: "I'm Started" }, '6289635866667@s.whatsapp.net'); */ /*checkNewMessage()*/ }, 3000);
                //		setTimeout(function () { timerMonitor(); }, 3000);

                //	}

            }

            // credentials updated -- save them
            if (events['creds.update']) {
                await saveCreds()
            }

            if (events.call) {
                console.log('recv call event', events.call)
            }

            // chat history received
            if (events['chats.set']) {
                const { chats, isLatest } = events['chats.set']
                console.log(`recv ${chats.length} chats (is latest: ${isLatest})`)
            }

            // message history received
            if (events['messages.set']) {
                const { messages, isLatest } = events['messages.set']
                console.log(`recv ${messages.length} messages (is latest: ${isLatest})`)
            }

            if (events['contacts.set']) {
                const { contacts, isLatest } = events['contacts.set']
                console.log(`recv ${contacts.length} contacts (is latest: ${isLatest})`)
            }

            // received a new message
            if (events['messages.upsert']) {
                const upsert = events['messages.upsert']
                console.log('recv messages ', JSON.stringify(upsert, undefined, 2))

                if (upsert.type === 'notify') {
                    for (const msg of upsert.messages) {
                        if (!msg.key.fromMe && doReplies) {
                            console.log('replying to', msg.key.remoteJid)
                            await sock!.readMessages([msg.key])
                            //await sendMessageWTyping({ text: 'Hello there!' }, msg.key.remoteJid!)
                        }
                    }
                }

                //////////////////////////
                const m = events['messages.upsert'];
                console.log("M object=>", JSON.stringify(m, undefined, 2))


                const msg = m.messages[0];


                if (msg) {
                    if (msg.key.fromMe && m.type === "append" && msg.status) {

                        console.log("Message has been sent, status: ", msg.status, " id:", msg.key.id);
                        uid = msg.key.id;
                        const idchat = msg.key.remoteJid;
                        var data = { id: id, ack: msg.status, chat_id: msg.key.id, idchat: idchat }
                        await updateChatStatus(data);

                    }
                }


                if (!msg.key.fromMe && m.type === 'notify') {
                    //console.log('replying to', m.messages[0].key.remoteJid)
                    //await sock!.sendReadReceipt(msg.key.remoteJid, msg.key.participant, [msg.key.id])

                    //console.log('send message to ', m.messages[0].key.remoteJid)
                    //await sendMessageWTyping({ text: '*Im Started*' }, msg.key.remoteJid)
                    processMessage(msg);
                }
            }

            // messages updated like status delivered, message deleted etc.
            if (events['messages.update']) {
                console.log(events['messages.update'])
                const msgs = events['messages.update']

                console.log("Messages-update =>", msgs)

                for (const ms of msgs) {

                    const rem = ms.key.remoteJid;
                    var rems = [];

                    if (rem){
                        rems = rem.split(":");

                    }

                    if (ms.key.fromMe && rems.length > 0) {
                        const idchat = ms.key.remoteJid;
                        console.log("Message status updated to : ", ms.update.status, " id:", ms.key.id, ' idchat= ', idchat);

                        const data = { id: 0, ack: ms.update.status, chat_id: ms.key.id, idchat: idchat }
                        //data.idchat = idchat;
                        await updateChatStatus(data);
                    }
                }


            }

            if (events['message-receipt.update']) {
                console.log(events['message-receipt.update'])
            }

            if (events['messages.reaction']) {
                console.log(events['messages.reaction'])
            }

            if (events['presence.update']) {
                console.log(events['presence.update'])
            }

            if (events['chats.update']) {
                console.log(events['chats.update'])
            }

            if (events['chats.delete']) {
                console.log('chats deleted ', events['chats.delete'])
            }
        }
    )

    return sock
}

startSock()