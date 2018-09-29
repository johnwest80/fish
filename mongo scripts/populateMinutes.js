// cursor = db.weatherentries.find();
// while ( cursor.hasNext() ) {
//    printjson( cursor.next() );
// }

function go() {
    print('start');
    let d = new Date('2018-07-15T20:08:00Z');
    let e = new Date('2030-12-31');
    while (d.getTime() < e.getTime()) {
        print(d.toString());
        db.calendarminutes.insertOne({ _id: d })
        d = new Date(d.getTime() + 60000);
    }
    print('end');
}

//go();
