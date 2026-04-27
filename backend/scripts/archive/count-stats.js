const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/dnd_app").then(async () => {
    try {
        const Item = require("./models/Item");
        const allCount = await Item.countDocuments({});
        const costCount = await Item.countDocuments({ cost: { $exists: true, $ne: null } });
        const weightCount = await Item.countDocuments({ weight: { $exists: true, $ne: null } });
        const damageCount = await Item.countDocuments({ damage: { $exists: true, $ne: null } });
        console.log("Total:", allCount, "Cost:", costCount, "Weight:", weightCount, "Damage:", damageCount);
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
});
