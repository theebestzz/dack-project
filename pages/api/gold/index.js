import { connectToDatabase } from "../../../utils/mongodb";

async function handler(req, res) {
    try {
        const { method } = req
        if (method === "PUT") {

            const { db } = await connectToDatabase();

            const body = JSON.parse(req.body);

            var myquery = { publicKey: body.publicKey };

            const updatedGold = await db
                .collection("gold")
                .updateOne(myquery, { $set: { gold: body.gold } }, function (err, res) {
                    if (err) {
                        console.log(err)
                    };
                    console.log("1 document updated");
                });
            res.json(updatedGold)
        }
        else if (method === "POST") {
            const { db } = await connectToDatabase();
            const body = JSON.parse(req.body);

            const acc = await db.collection("gold").countDocuments({ publicKey: { $exists: true, $in: [body.publicKey] } })
            if (acc) {
                res.json({});
            } else {
                var obj = { publicKey: body.publicKey, gold: 0 };

                const createdAccount = await db
                    .collection("gold")
                    .insertOne(obj, function (err, res) {
                        if (err) {
                            console.log(err)
                        };
                        console.log("1 document added");
                    });
                res.json(createdAccount)
            }
        }
    }
    catch (err) {
        console.log(err)
    }
}

export default handler