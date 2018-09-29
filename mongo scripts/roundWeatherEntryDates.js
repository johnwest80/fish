
db.weatherentries.find({ }).sort({ "d": 1 }).forEach(
    function (e) {
        let coeff = 1000 * 60;

        let oldGetTime = e.d.getTime();
        let newGetTime = Math.floor(oldGetTime / coeff) * coeff;
        
        if (oldGetTime !== newGetTime) {
            e.d = new Date(newGetTime);
            print(e.d + ' Saved');
            db.weatherentries.save(e);
        }
        else {
            print(e.d + ' Skipped');
        }
    }
);
