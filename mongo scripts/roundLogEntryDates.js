
db.logentries.find({ }).sort({ "_id.d": 1 }).forEach(
    function (e) {
        let coeff = 1000 * 60;

        let oldId = { d: e._id.d, n: e._id.n };
        let oldGetTime = e._id.d.getTime();
        let newGetTime = Math.floor(oldGetTime / coeff) * coeff;
        
        if (oldGetTime !== newGetTime) {
            let newId = { d: new Date(newGetTime), n: e._id.n };

            e._id = newId;
            db.logentries.save(e);
            db.logentries.deleteOne({ _id: oldId });
            print(oldId.n + ' Added: ' + newId.d + ' / Removed: ' + oldId.d);
        }
        else {
            print(oldId.n + ' Skipped: ' + oldId.d);
        }
    }
);
